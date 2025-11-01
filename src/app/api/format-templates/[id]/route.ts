import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import slugify from "slugify";

// GET /api/format-templates/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await prisma.formatTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: { debates: true },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Format template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching format template:", error);
    return NextResponse.json(
      { error: "Failed to fetch format template" },
      { status: 500 }
    );
  }
}

// PATCH /api/format-templates/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    } = body;

    // Check if template exists
    const existingTemplate = await prisma.formatTemplate.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Format template not found" },
        { status: 404 }
      );
    }

    // Validate participants range if provided
    if (minParticipants !== undefined && maxParticipants !== undefined) {
      if (minParticipants < 2 || maxParticipants < minParticipants) {
        return NextResponse.json(
          { error: "Invalid participant range" },
          { status: 400 }
        );
      }
    }

    // Generate new slug if name changed
    let slug = existingTemplate.slug;
    if (name && name !== existingTemplate.name) {
      slug = slugify(name, { lower: true, strict: true });

      // Check if new slug already exists
      const slugExists = await prisma.formatTemplate.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A template with this name already exists" },
          { status: 409 }
        );
      }
    }

    // Update the template
    const template = await prisma.formatTemplate.update({
      where: { id },
      data: {
        ...(name && { name, slug }),
        ...(description && { description }),
        ...(category && { category }),
        ...(mode && { mode }),
        ...(minParticipants !== undefined && { minParticipants }),
        ...(maxParticipants !== undefined && { maxParticipants }),
        ...(requiresModerator !== undefined && { requiresModerator }),
        ...(allowsDocumentUpload !== undefined && { allowsDocumentUpload }),
        ...(durationMinutes && { durationMinutes }),
        ...(flexibleTiming !== undefined && { flexibleTiming }),
        ...(segmentStructure && { segmentStructure }),
        ...(bestFor !== undefined && { bestFor }),
        ...(personaRecommendations !== undefined && { personaRecommendations }),
      },
      include: {
        _count: {
          select: { debates: true },
        },
      },
    });

    return NextResponse.json(template);
  } catch (error: any) {
    console.error("Error updating format template:", error);

    return NextResponse.json(
      { error: "Failed to update format template" },
      { status: 500 }
    );
  }
}

// DELETE /api/format-templates/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if template exists
    const existingTemplate = await prisma.formatTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: { debates: true },
        },
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Format template not found" },
        { status: 404 }
      );
    }

    // Prevent deleting preset templates
    if (existingTemplate.isPreset) {
      return NextResponse.json(
        { error: "Cannot delete preset templates" },
        { status: 403 }
      );
    }

    // Prevent deleting templates with associated debates
    if (existingTemplate._count.debates > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete template with ${existingTemplate._count.debates} associated debates`,
        },
        { status: 409 }
      );
    }

    // Delete the template
    await prisma.formatTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting format template:", error);

    return NextResponse.json(
      { error: "Failed to delete format template" },
      { status: 500 }
    );
  }
}
