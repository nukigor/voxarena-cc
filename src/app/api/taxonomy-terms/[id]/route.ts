import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { taxonomyTermSchema } from '@/lib/validations/taxonomy'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/taxonomy-terms/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const term = await prisma.taxonomyTerm.findUnique({
      where: { id: params.id },
      include: {
        category: true,
      },
    })

    if (!term) {
      return NextResponse.json(
        { error: 'Taxonomy term not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(term)
  } catch (error) {
    console.error('Error fetching taxonomy term:', error)
    return NextResponse.json(
      { error: 'Failed to fetch taxonomy term' },
      { status: 500 }
    )
  }
}

// PUT /api/taxonomy-terms/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = taxonomyTermSchema.parse(body)

    // Check if the term exists
    const existingTerm = await prisma.taxonomyTerm.findUnique({
      where: { id: params.id },
    })

    if (!existingTerm) {
      return NextResponse.json(
        { error: 'Taxonomy term not found' },
        { status: 404 }
      )
    }

    // Check if slug is being changed and if it already exists in the category
    if (
      validatedData.slug !== existingTerm.slug ||
      validatedData.categoryId !== existingTerm.categoryId
    ) {
      const slugExists = await prisma.taxonomyTerm.findFirst({
        where: {
          categoryId: validatedData.categoryId,
          slug: validatedData.slug,
          NOT: {
            id: params.id,
          },
        },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A term with this slug already exists in this category' },
          { status: 400 }
        )
      }
    }

    // Verify category exists
    const category = await prisma.taxonomyCategory.findUnique({
      where: { id: validatedData.categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Update the term
    const updatedTerm = await prisma.taxonomyTerm.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        category: true,
      },
    })

    return NextResponse.json(updatedTerm)
  } catch (error: any) {
    console.error('Error updating taxonomy term:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update taxonomy term' },
      { status: 500 }
    )
  }
}

// DELETE /api/taxonomy-terms/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if the term exists
    const existingTerm = await prisma.taxonomyTerm.findUnique({
      where: { id: params.id },
      include: {
        category: true,
      },
    })

    if (!existingTerm) {
      return NextResponse.json(
        { error: 'Taxonomy term not found' },
        { status: 404 }
      )
    }

    // Delete the term
    await prisma.taxonomyTerm.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Taxonomy term deleted successfully',
      deletedTerm: existingTerm,
    })
  } catch (error) {
    console.error('Error deleting taxonomy term:', error)
    return NextResponse.json(
      { error: 'Failed to delete taxonomy term' },
      { status: 500 }
    )
  }
}
