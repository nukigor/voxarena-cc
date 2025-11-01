import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { generatePDF } from '@/lib/export/pdf-generator'
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

    // Generate PDF
    const pdfBuffer = await generatePDF(formattedData)

    // Generate filename
    const filename = `${sanitizeFilename(debate.title)}-transcript.pdf`

    // Return PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF export' },
      { status: 500 }
    )
  }
}
