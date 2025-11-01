import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import slugify from "slugify";

// GET /api/debates/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const debate = await prisma.debate.findUnique({
      where: { id },
      include: {
        debateMode: true,
        formatTemplate: true,
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
        analytics: true,
      },
    });

    if (!debate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    return NextResponse.json(debate);
  } catch (error) {
    console.error("Error fetching debate:", error);
    return NextResponse.json(
      { error: "Failed to fetch debate" },
      { status: 500 }
    );
  }
}

// PATCH /api/debates/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      topic,
      description,
      modeId,
      segmentStructure,
      totalDurationMinutes,
      flexibleTiming,
      status,
      errorMessage,
      participants,
      minParticipants,
      maxParticipants,
      requiresModerator,
    } = body;

    // Check if debate exists
    const existingDebate = await prisma.debate.findUnique({
      where: { id },
    });

    if (!existingDebate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    // Prevent editing debates that are currently generating
    if (existingDebate.status === "GENERATING") {
      return NextResponse.json(
        { error: "Cannot edit debate while it is generating" },
        { status: 409 }
      );
    }

    // Generate new slug if title changed
    let slug = existingDebate.slug;
    if (title && title !== existingDebate.title) {
      slug = slugify(title, { lower: true, strict: true });

      // Ensure slug is unique
      let slugCounter = 1;
      while (
        await prisma.debate.findFirst({
          where: {
            slug,
            id: { not: id },
          },
        })
      ) {
        slug = `${slugify(title, { lower: true, strict: true })}-${slugCounter}`;
        slugCounter++;
      }
    }

    // Update the debate and participants in a transaction
    const debate = await prisma.$transaction(async (tx) => {
      // Update debate fields
      const updatedDebate = await tx.debate.update({
        where: { id },
        data: {
          ...(title && { title, slug }),
          ...(topic && { topic }),
          ...(description !== undefined && { description }),
          ...(modeId !== undefined && { modeId }),
          ...(segmentStructure && { segmentStructure }),
          ...(totalDurationMinutes && { totalDurationMinutes }),
          ...(flexibleTiming !== undefined && { flexibleTiming }),
          ...(status && { status }),
          ...(errorMessage !== undefined && { errorMessage }),
          // Only update participant constraints if provided (for custom format debates)
          ...(minParticipants !== undefined && { minParticipants }),
          ...(maxParticipants !== undefined && { maxParticipants }),
          ...(requiresModerator !== undefined && { requiresModerator }),
        },
      });

      // Update participants if provided
      if (participants && Array.isArray(participants)) {
        // Delete existing participants
        await tx.debateParticipant.deleteMany({
          where: { debateId: id },
        });

        // Create new participants
        if (participants.length > 0) {
          await tx.debateParticipant.createMany({
            data: participants.map((p: any) => ({
              debateId: id,
              personaId: p.personaId,
              role: p.role,
              speakingOrder: p.speakingOrder,
            })),
          });
        }
      }

      // Fetch and return the complete debate with relations
      return await tx.debate.findUnique({
        where: { id },
        include: {
          debateMode: true,
          formatTemplate: true,
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
    });

    return NextResponse.json(debate);
  } catch (error: any) {
    console.error("Error updating debate:", error);

    return NextResponse.json(
      {
        error: "Failed to update debate",
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}

// DELETE /api/debates/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if debate exists
    const existingDebate = await prisma.debate.findUnique({
      where: { id },
    });

    if (!existingDebate) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    // Prevent deleting debates that are currently generating
    if (existingDebate.status === "GENERATING") {
      return NextResponse.json(
        { error: "Cannot delete debate while it is generating" },
        { status: 409 }
      );
    }

    // Delete the debate (cascade will handle participants and segments)
    await prisma.debate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting debate:", error);

    return NextResponse.json(
      { error: "Failed to delete debate" },
      { status: 500 }
    );
  }
}
