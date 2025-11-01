import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { generateWord } from '@/lib/export/word-generator'
import { formatDebateForExport, sanitizeFilename } from '@/lib/export/transcript-formatter'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Fetch debate with all related data
    const debate = await prisma.debate.findUnique({
      where: { id },
      include: {
        participants: true,
        formatTemplate: true,
      },
    })

    if (!debate) {
      return NextResponse.json({ error: 'Debate not found' }, { status: 404 })
    }

    if (!debate.transcript || debate.transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Debate has no transcript to export' },
        { status: 400 }
      )
    }

    // Format debate data for export
    const formattedData = formatDebateForExport(debate)

    // Generate Word document
    const wordBuffer = await generateWord(formattedData)

    // Generate filename
    const filename = `${sanitizeFilename(debate.title)}-transcript.docx`

    // Return Word document with appropriate headers
    return new NextResponse(wordBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': wordBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating Word document:', error)
    return NextResponse.json(
      { error: 'Failed to generate Word export' },
      { status: 500 }
    )
  }
}
