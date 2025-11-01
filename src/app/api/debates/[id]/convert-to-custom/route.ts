import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch the debate
    const debate = await prisma.debate.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        formatTemplateId: true,
      },
    })

    if (!debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      )
    }

    // Only allow converting DRAFT debates
    if (debate.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft debates can be converted to custom format' },
        { status: 400 }
      )
    }

    // Check if debate is already custom
    if (!debate.formatTemplateId) {
      return NextResponse.json(
        { error: 'Debate is already a custom format' },
        { status: 400 }
      )
    }

    // Remove the template link
    const updatedDebate = await prisma.debate.update({
      where: { id },
      data: {
        formatTemplateId: null,
      },
      include: {
        formatTemplate: true,
        participants: {
          include: {
            persona: true,
          },
          orderBy: {
            speakingOrder: 'asc',
          },
        },
      },
    })

    return NextResponse.json(updatedDebate)
  } catch (error) {
    console.error('Error converting debate to custom format:', error)
    return NextResponse.json(
      { error: 'Failed to convert debate to custom format' },
      { status: 500 }
    )
  }
}
