import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { uploadDocument, validateDocument, extractKeyFromUrl, deleteDocument } from '@/lib/r2/document-upload'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get the debate
    const debate = await prisma.debate.findUnique({
      where: { id },
      include: {
        formatTemplate: true,
      },
    })

    if (!debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      )
    }

    // Check if debate is in a valid state for document upload
    if (debate.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Documents can only be uploaded to draft debates' },
        { status: 400 }
      )
    }

    // Check if this format allows document upload
    if (!debate.formatTemplate?.allowsDocumentUpload) {
      return NextResponse.json(
        { error: 'Document upload is not enabled for this debate format' },
        { status: 400 }
      )
    }

    // Get the form data
    const formData = await request.formData()
    const file = formData.get('document') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No document provided' },
        { status: 400 }
      )
    }

    // Validate the document
    const validation = validateDocument(file, file.name)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // If there's an existing document, delete it first
    if (debate.reviewDocumentUrl) {
      const oldKey = extractKeyFromUrl(debate.reviewDocumentUrl)
      await deleteDocument(oldKey)
    }

    // Upload to R2
    const uploadResult = await uploadDocument(
      id,
      buffer,
      file.name,
      file.type
    )

    // Update debate record
    const updatedDebate = await prisma.debate.update({
      where: { id },
      data: {
        reviewDocumentUrl: uploadResult.url,
        reviewDocumentName: file.name,
        reviewDocumentSize: uploadResult.size,
        reviewDocumentType: file.type,
      },
    })

    return NextResponse.json({
      success: true,
      documentUrl: uploadResult.url,
      documentName: file.name,
      documentSize: uploadResult.size,
      documentType: file.type,
    })
  } catch (error: any) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload document' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get the debate
    const debate = await prisma.debate.findUnique({
      where: { id },
    })

    if (!debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      )
    }

    // Check if debate has a document
    if (!debate.reviewDocumentUrl) {
      return NextResponse.json(
        { error: 'No document to remove' },
        { status: 400 }
      )
    }

    // Check if debate is in a valid state
    if (debate.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Documents can only be removed from draft debates' },
        { status: 400 }
      )
    }

    // Delete from R2
    const key = extractKeyFromUrl(debate.reviewDocumentUrl)
    await deleteDocument(key)

    // Update debate record
    await prisma.debate.update({
      where: { id },
      data: {
        reviewDocumentUrl: null,
        reviewDocumentName: null,
        reviewDocumentSize: null,
        reviewDocumentType: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Document removed successfully',
    })
  } catch (error: any) {
    console.error('Error removing document:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove document' },
      { status: 500 }
    )
  }
}