import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { taxonomyTermSchema } from '@/lib/validations/taxonomy'
import { TaxonomyTermsResponse } from '@/types/taxonomy'

// GET /api/taxonomy-terms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const sortBy = searchParams.get('sortBy') || 'sortOrder'
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc'

    const skip = (page - 1) * pageSize

    const where: any = {}

    // Filter by category if provided
    if (categoryId) {
      where.categoryId = categoryId
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    const [terms, total] = await Promise.all([
      prisma.taxonomyTerm.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
        },
      }),
      prisma.taxonomyTerm.count({ where }),
    ])

    const response: TaxonomyTermsResponse = {
      terms,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching taxonomy terms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch taxonomy terms' },
      { status: 500 }
    )
  }
}

// POST /api/taxonomy-terms
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = taxonomyTermSchema.parse(body)

    // Check if slug already exists in the same category
    const existingTerm = await prisma.taxonomyTerm.findFirst({
      where: {
        categoryId: validatedData.categoryId,
        slug: validatedData.slug,
      },
    })

    if (existingTerm) {
      return NextResponse.json(
        { error: 'A term with this slug already exists in this category' },
        { status: 400 }
      )
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

    // Create the new term
    const term = await prisma.taxonomyTerm.create({
      data: validatedData,
      include: {
        category: true,
      },
    })

    return NextResponse.json(term, { status: 201 })
  } catch (error: any) {
    console.error('Error creating taxonomy term:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create taxonomy term' },
      { status: 500 }
    )
  }
}
