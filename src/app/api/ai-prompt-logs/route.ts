import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { AiPromptStatus } from '@prisma/client'

// GET /api/ai-prompt-logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const functionality = searchParams.get('functionality') || undefined
    const parentModel = searchParams.get('parentModel') || undefined
    const status = searchParams.get('status') as AiPromptStatus | undefined
    const search = searchParams.get('search') || ''
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as 'createdAt' | 'executionTimeMs' | 'tokenUsage' | 'estimatedCost'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    const skip = (page - 1) * pageSize

    const where: any = {}

    if (functionality) {
      where.functionality = functionality
    }

    if (parentModel) {
      where.parentModel = parentModel
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { prompt: { contains: search, mode: 'insensitive' as const } },
        { result: { contains: search, mode: 'insensitive' as const } },
        { parentObjectName: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    const [logs, total] = await Promise.all([
      prisma.aiPromptLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.aiPromptLog.count({ where }),
    ])

    // Get unique functionalities and parent models for filters
    const [functionalities, parentModels] = await Promise.all([
      prisma.aiPromptLog.findMany({
        select: { functionality: true },
        distinct: ['functionality'],
        orderBy: { functionality: 'asc' },
      }),
      prisma.aiPromptLog.findMany({
        select: { parentModel: true },
        distinct: ['parentModel'],
        orderBy: { parentModel: 'asc' },
      }),
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      filters: {
        functionalities: functionalities.map(f => f.functionality),
        parentModels: parentModels.map(p => p.parentModel),
      },
    })
  } catch (error) {
    console.error('Error fetching AI prompt logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI prompt logs' },
      { status: 500 }
    )
  }
}
