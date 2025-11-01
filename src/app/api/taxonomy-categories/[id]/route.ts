import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { taxonomyCategorySchema } from '@/lib/validations/taxonomy'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/taxonomy-categories/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const category = await prisma.taxonomyCategory.findUnique({
      where: { id: params.id },
      include: {
        terms: true,
        _count: {
          select: { terms: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Taxonomy category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching taxonomy category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch taxonomy category' },
      { status: 500 }
    )
  }
}

// PUT /api/taxonomy-categories/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = taxonomyCategorySchema.parse(body)

    // Check if the category exists
    const existingCategory = await prisma.taxonomyCategory.findUnique({
      where: { id: params.id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Taxonomy category not found' },
        { status: 404 }
      )
    }

    // Check if slug is being changed and if it already exists
    if (validatedData.slug !== existingCategory.slug) {
      const slugExists = await prisma.taxonomyCategory.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update the category
    const updatedCategory = await prisma.taxonomyCategory.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: { terms: true },
        },
      },
    })

    return NextResponse.json(updatedCategory)
  } catch (error: any) {
    console.error('Error updating taxonomy category:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update taxonomy category' },
      { status: 500 }
    )
  }
}

// DELETE /api/taxonomy-categories/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check if the category exists
    const existingCategory = await prisma.taxonomyCategory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { terms: true },
        },
      },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Taxonomy category not found' },
        { status: 404 }
      )
    }

    // Delete the category (this will cascade delete all related terms)
    await prisma.taxonomyCategory.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Taxonomy category deleted successfully',
      deletedCategory: existingCategory,
    })
  } catch (error) {
    console.error('Error deleting taxonomy category:', error)
    return NextResponse.json(
      { error: 'Failed to delete taxonomy category' },
      { status: 500 }
    )
  }
}