import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { DebateMode, DebateStatus } from "@prisma/client";
import slugify from "slugify";

// GET /api/debates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as DebateStatus | null;
    const mode = searchParams.get("mode") as DebateMode | null;
    const formatTemplateId = searchParams.get("formatTemplateId") || null;

    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" as const } },
        { topic: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (mode) {
      where.mode = mode;
    }

    if (formatTemplateId) {
      where.formatTemplateId = formatTemplateId;
    }

    const [debates, total] = await Promise.all([
      prisma.debate.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          debateMode: {
            select: {
              id: true,
              name: true,
              slug: true,
              teaser: true,
            },
          },
          formatTemplate: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              mode: true,
            },
          },
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
          _count: {
            select: { segments: true },
          },
        },
      }),
      prisma.debate.count({ where }),
    ]);

    return NextResponse.json({
      debates,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching debates:", error);
    return NextResponse.json(
      { error: "Failed to fetch debates" },
      { status: 500 }
    );
  }
}

// POST /api/debates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      topic,
      modeId,
      formatTemplateId,
      description,
      segmentStructure,
      totalDurationMinutes,
      flexibleTiming,
      participants,
      createdBy,
    } = body;

    // Validate required fields
    if (
      !title ||
      !topic ||
      !modeId ||
      flexibleTiming === undefined ||
      !participants ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate Mode exists
    const mode = await prisma.mode.findUnique({
      where: { id: modeId },
    });

    if (!mode) {
      return NextResponse.json(
        { error: "Mode not found" },
        { status: 404 }
      );
    }

    // Validate format template if provided
    let formatTemplate = null;
    if (formatTemplateId) {
      formatTemplate = await prisma.formatTemplate.findUnique({
        where: { id: formatTemplateId },
      });

      if (!formatTemplate) {
        return NextResponse.json(
          { error: "Format template not found" },
          { status: 404 }
        );
      }

      // Validate participant count against template requirements
      if (
        participants.length < formatTemplate.minParticipants ||
        participants.length > formatTemplate.maxParticipants
      ) {
        return NextResponse.json(
          {
            error: `Template requires between ${formatTemplate.minParticipants} and ${formatTemplate.maxParticipants} participants`,
          },
          { status: 400 }
        );
      }

      // Validate moderator requirement
      const hasModerator = participants.some((p) => p.role === "MODERATOR");
      if (formatTemplate.requiresModerator && !hasModerator) {
        return NextResponse.json(
          { error: "Template requires a moderator" },
          { status: 400 }
        );
      }
    }

    // Validate all personas exist
    const personaIds = participants.map((p) => p.personaId);
    const personas = await prisma.persona.findMany({
      where: { id: { in: personaIds } },
    });

    if (personas.length !== personaIds.length) {
      return NextResponse.json(
        { error: "One or more personas not found" },
        { status: 404 }
      );
    }

    // Generate slug from title
    let slug = slugify(title, { lower: true, strict: true });

    // Ensure slug is unique
    let slugCounter = 1;
    while (await prisma.debate.findUnique({ where: { slug } })) {
      slug = `${slugify(title, { lower: true, strict: true })}-${slugCounter}`;
      slugCounter++;
    }

    // Determine segment structure (use custom or template)
    const finalSegmentStructure =
      segmentStructure ||
      (formatTemplate ? formatTemplate.segmentStructure : null);

    // Create the debate with participants in a transaction
    const debate = await prisma.$transaction(async (tx) => {
      // Create the debate
      const newDebate = await tx.debate.create({
        data: {
          title,
          slug,
          topic,
          modeId,
          formatTemplateId: formatTemplateId || null,
          description: description || null,
          segmentStructure: finalSegmentStructure,
          totalDurationMinutes:
            totalDurationMinutes ||
            (formatTemplate ? formatTemplate.durationMinutes : null),
          flexibleTiming,
          status: "DRAFT",
          createdBy: createdBy || null,
        },
      });

      // Create participant associations
      await tx.debateParticipant.createMany({
        data: participants.map((p) => ({
          debateId: newDebate.id,
          personaId: p.personaId,
          role: p.role,
          speakingOrder: p.speakingOrder || null,
        })),
      });

      // Fetch the complete debate with relations
      return await tx.debate.findUnique({
        where: { id: newDebate.id },
        include: {
          formatTemplate: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              mode: true,
            },
          },
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
        },
      });
    });

    return NextResponse.json(debate, { status: 201 });
  } catch (error: any) {
    console.error("Error creating debate:", error);

    return NextResponse.json(
      { error: "Failed to create debate" },
      { status: 500 }
    );
  }
}
