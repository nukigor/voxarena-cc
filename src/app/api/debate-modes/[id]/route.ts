import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { debateModeSchema } from '@/lib/validations/debate-mode'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/debate-modes/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const mode = await prisma.mode.findUnique({
      where: { id },
    })

    if (!mode) {
      return NextResponse.json(
        { error: 'Debate mode not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(mode)
  } catch (error) {
    console.error('Error fetching debate mode:', error)
    return NextResponse.json(
      { error: 'Failed to fetch debate mode' },
      { status: 500 }
    )
  }
}

// PUT /api/debate-modes/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate the request body
    const validatedData = debateModeSchema.parse(body)

    // Check if the mode exists
    const existingMode = await prisma.mode.findUnique({
      where: { id },
    })

    if (!existingMode) {
      return NextResponse.json(
        { error: 'Debate mode not found' },
        { status: 404 }
      )
    }

    // Check if slug is being changed and if it already exists
    if (validatedData.slug !== existingMode.slug) {
      const slugExists = await prisma.mode.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A mode with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update the mode
    const updatedMode = await prisma.mode.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(updatedMode)
  } catch (error: any) {
    console.error('Error updating debate mode:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update debate mode' },
      { status: 500 }
    )
  }
}

// DELETE /api/debate-modes/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Check if the mode exists
    const existingMode = await prisma.mode.findUnique({
      where: { id },
    })

    if (!existingMode) {
      return NextResponse.json(
        { error: 'Debate mode not found' },
        { status: 404 }
      )
    }

    // Delete the mode
    await prisma.mode.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Debate mode deleted successfully',
      deletedMode: existingMode,
    })
  } catch (error) {
    console.error('Error deleting debate mode:', error)
    return NextResponse.json(
      { error: 'Failed to delete debate mode' },
      { status: 500 }
    )
  }
}
