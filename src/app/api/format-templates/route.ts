import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { FormatCategory, DebateMode } from "@prisma/client";
import slugify from "slugify";

// GET /api/format-templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") as FormatCategory | null;
    const mode = searchParams.get("mode") as DebateMode | null;
    const isPreset = searchParams.get("isPreset");

    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (mode) {
      where.mode = mode;
    }

    if (isPreset !== null) {
      where.isPreset = isPreset === "true";
    }

    const [templates, total] = await Promise.all([
      prisma.formatTemplate.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ isPreset: "desc" }, { createdAt: "desc" }],
        include: {
          _count: {
            select: { debates: true },
          },
        },
      }),
      prisma.formatTemplate.count({ where }),
    ]);

    return NextResponse.json({
      templates,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching format templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch format templates" },
      { status: 500 }
    );
  }
}

// POST /api/format-templates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      mode,
      minParticipants,
      maxParticipants,
      requiresModerator,
      allowsDocumentUpload,
      durationMinutes,
      flexibleTiming,
      segmentStructure,
      bestFor,
      personaRecommendations,
      createdBy,
    } = body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !category ||
      !mode ||
      minParticipants === undefined ||
      maxParticipants === undefined ||
      requiresModerator === undefined ||
      !durationMinutes ||
      flexibleTiming === undefined ||
      !segmentStructure
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate participants range
    if (minParticipants < 2 || maxParticipants < minParticipants) {
      return NextResponse.json(
        { error: "Invalid participant range" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });

    // Check if slug already exists
    const existingTemplate = await prisma.formatTemplate.findUnique({
      where: { slug },
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: "A template with this name already exists" },
        { status: 409 }
      );
    }

    // Create the template
    const template = await prisma.formatTemplate.create({
      data: {
        name,
        slug,
        description,
        category,
        mode,
        isPreset: false,
        minParticipants,
        maxParticipants,
        requiresModerator,
        allowsDocumentUpload: allowsDocumentUpload || false,
        durationMinutes,
        flexibleTiming,
        segmentStructure,
        bestFor: bestFor || null,
        personaRecommendations: personaRecommendations || null,
        createdBy: createdBy || null,
      },
      include: {
        _count: {
          select: { debates: true },
        },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    console.error("Error creating format template:", error);

    return NextResponse.json(
      { error: "Failed to create format template" },
      { status: 500 }
    );
  }
}
