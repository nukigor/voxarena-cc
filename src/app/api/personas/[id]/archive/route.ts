import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

// PATCH /api/personas/:id/archive
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Update persona status to ARCHIVED
    const persona = await prisma.persona.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      include: {
        taxonomyValues: {
          include: {
            term: {
              include: {
                category: true,
              },
            },
          },
        },
        _count: {
          select: { debateParticipations: true },
        },
      },
    })

    return NextResponse.json(persona)
  } catch (error: any) {
    console.error('Error archiving persona:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to archive persona' },
      { status: 500 }
    )
  }
}
