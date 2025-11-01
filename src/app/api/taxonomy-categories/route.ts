import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { taxonomyCategorySchema } from '@/lib/validations/taxonomy'
import { TaxonomyCategoriesResponse } from '@/types/taxonomy'

// GET /api/taxonomy-categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'sortOrder'
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc'

    const skip = (page - 1) * pageSize

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [categories, total] = await Promise.all([
      prisma.taxonomyCategory.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { terms: true },
          },
        },
      }),
      prisma.taxonomyCategory.count({ where }),
    ])

    const response: TaxonomyCategoriesResponse = {
      categories,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching taxonomy categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch taxonomy categories' },
      { status: 500 }
    )
  }
}

// POST /api/taxonomy-categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = taxonomyCategorySchema.parse(body)

    // Check if slug already exists
    const existingCategory = await prisma.taxonomyCategory.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      )
    }

    // Create the new category
    const category = await prisma.taxonomyCategory.create({
      data: validatedData,
      include: {
        _count: {
          select: { terms: true },
        },
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Error creating taxonomy category:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create taxonomy category' },
      { status: 500 }
    )
  }
}