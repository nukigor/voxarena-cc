import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify debate exists and is in COMPLETED state
    const existingDebate = await prisma.debate.findUnique({
      where: { id },
    });

    if (!existingDebate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      );
    }

    if (existingDebate.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Only completed debates can be published' },
        { status: 400 }
      );
    }

    // Update debate status to PUBLISHED
    const updatedDebate = await prisma.debate.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
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
    console.error('Error publishing debate:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish debate' },
      { status: 500 }
    );
  }
}
