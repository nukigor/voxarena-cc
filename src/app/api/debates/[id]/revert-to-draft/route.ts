import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify debate exists and is in COMPLETED or PUBLISHED state
    const existingDebate = await prisma.debate.findUnique({
      where: { id },
    });

    if (!existingDebate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      );
    }

    if (existingDebate.status !== 'COMPLETED' && existingDebate.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Only completed or published debates can be reverted to draft' },
        { status: 400 }
      );
    }

    // Update debate status to DRAFT and clear generated content
    const updatedDebate = await prisma.debate.update({
      where: { id },
      data: {
        status: 'DRAFT',
        transcript: null,
        audioUrl: null,
        duration: null,
        generationStartedAt: null,
        generationCompletedAt: null,
        publishedAt: null,
        errorMessage: null,
      },
      include: {
        participants: {
          include: {
            persona: true,
          },
        },
        formatTemplate: true,
        debateMode: true,
      },
    });

    return NextResponse.json(updatedDebate);
  } catch (error: any) {
    console.error('Error reverting debate to draft:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to revert debate to draft' },
      { status: 500 }
    );
  }
}
