import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { generateDebateWithRetry } from "@/lib/ai/debate-generation";
import { generatePlaceholderTranscript } from "@/lib/debate/placeholder-transcript";
import { fetchDocumentContent } from "@/lib/ai/document-extractor";

// POST /api/debates/[id]/generate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if debate exists
    const existingDebate = await prisma.debate.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            persona: {
              include: {
                taxonomyValues: {
                  include: {
                    term: {
                      include: {
                        category: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        formatTemplate: true,
        debateMode: true,
      },
    });

    if (!existingDebate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    // Validate debate can be generated
    if (existingDebate.status === "GENERATING") {
      return NextResponse.json(
        { error: "Debate is already being generated" },
        { status: 409 }
      );
    }

    if (existingDebate.status === "COMPLETED" || existingDebate.status === "PUBLISHED") {
      return NextResponse.json(
        { error: "Debate has already been generated" },
        { status: 409 }
      );
    }

    if (existingDebate.participants.length === 0) {
      return NextResponse.json(
        { error: "Debate must have at least one participant" },
        { status: 400 }
      );
    }

    // Update status to GENERATING
    await prisma.debate.update({
      where: { id },
      data: {
        status: "GENERATING",
        generationStartedAt: new Date(),
        errorMessage: null,
      },
    });

    // Check if AI generation is enabled (check for OpenAI API key)
    const useAiGeneration = process.env.OPENAI_API_KEY &&
                           process.env.OPENAI_API_KEY.length > 0 &&
                           process.env.USE_AI_GENERATION !== 'false';

    let generatedTranscript: string;

    if (useAiGeneration) {
      try {
        console.log(`Starting AI generation for debate: ${existingDebate.title}`);

        // Fetch document content if the debate has a document
        let documentContent: string | null = null;
        if (existingDebate.reviewDocumentUrl) {
          documentContent = await fetchDocumentContent(
            existingDebate.reviewDocumentUrl,
            existingDebate.reviewDocumentName || undefined
          );
        }

        // Prepare debate data for generation
        const debateData = {
          id: existingDebate.id,
          title: existingDebate.title,
          topic: existingDebate.topic,
          description: existingDebate.description,
          mode: existingDebate.debateMode,
          formatTemplate: existingDebate.formatTemplate,
          totalDurationMinutes: existingDebate.totalDurationMinutes,
          segmentStructure: existingDebate.segmentStructure,
          reviewDocumentUrl: existingDebate.reviewDocumentUrl,
          reviewDocumentName: existingDebate.reviewDocumentName,
          reviewDocumentContent: documentContent,
          participants: existingDebate.participants.map(p => ({
            id: p.persona.id,
            name: p.persona.name,
            nickname: p.persona.nickname,
            professionRole: p.persona.professionRole,
            quirks: p.persona.quirks,
            role: p.role,
            speakingOrder: p.speakingOrder,
            taxonomyValues: p.persona.taxonomyValues,
          })),
        };

        // Generate debate content with retry logic
        generatedTranscript = await generateDebateWithRetry(debateData, 3);
        console.log(`AI generation completed successfully for debate: ${existingDebate.title}`);
      } catch (aiError: any) {
        console.error("AI generation failed, falling back to placeholder:", aiError);

        // Fall back to placeholder if AI generation fails
        generatedTranscript = generatePlaceholderTranscript({
          title: existingDebate.title,
          topic: existingDebate.topic,
          participants: existingDebate.participants,
          segmentStructure: existingDebate.segmentStructure,
        });

        // Log the fallback
        console.warn(`Using placeholder transcript for debate ${id} due to AI generation failure`);
      }
    } else {
      // Use placeholder if AI generation is not enabled
      console.log("AI generation disabled, using placeholder transcript");
      generatedTranscript = generatePlaceholderTranscript({
        title: existingDebate.title,
        topic: existingDebate.topic,
        participants: existingDebate.participants,
        segmentStructure: existingDebate.segmentStructure,
      });
    }

    // Update debate with generated content
    const debate = await prisma.debate.update({
      where: { id },
      data: {
        status: "COMPLETED",
        generationCompletedAt: new Date(),
        transcript: generatedTranscript,
        duration: existingDebate.totalDurationMinutes
          ? existingDebate.totalDurationMinutes * 60
          : null,
      },
      include: {
        formatTemplate: true,
        debateMode: true,
        participants: {
          include: {
            persona: {
              include: {
                taxonomyValues: {
                  include: {
                    term: {
                      include: {
                        category: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { speakingOrder: "asc" },
        },
        segments: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json({
      message: useAiGeneration
        ? "Debate generation completed successfully"
        : "Debate generation completed (placeholder mode)",
      debate,
    });
  } catch (error: any) {
    console.error("Error generating debate:", error);

    // Update debate status to FAILED
    try {
      const { id } = await params;
      await prisma.debate.update({
        where: { id },
        data: {
          status: "FAILED",
          errorMessage: error.message || "Unknown error during generation",
        },
      });
    } catch (updateError) {
      console.error("Error updating debate status to FAILED:", updateError);
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate debate" },
      { status: 500 }
    );
  }
}
