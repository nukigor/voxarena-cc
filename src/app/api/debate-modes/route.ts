import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { debateModeSchema } from '@/lib/validations/debate-mode'
import { DebateModesResponse } from '@/types/debate-mode'

// GET /api/debate-modes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc'

    const skip = (page - 1) * pageSize

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { teaser: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [modes, total] = await Promise.all([
      prisma.mode.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.mode.count({ where }),
    ])

    const response: DebateModesResponse = {
      modes,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching debate modes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch debate modes' },
      { status: 500 }
    )
  }
}

// POST /api/debate-modes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = debateModeSchema.parse(body)

    // Check if slug already exists
    const existingMode = await prisma.mode.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingMode) {
      return NextResponse.json(
        { error: 'A mode with this slug already exists' },
        { status: 400 }
      )
    }

    // Create the new mode
    const mode = await prisma.mode.create({
      data: validatedData,
    })

    return NextResponse.json(mode, { status: 201 })
  } catch (error: any) {
    console.error('Error creating debate mode:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create debate mode' },
      { status: 500 }
    )
  }
}
