import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createHash } from 'crypto'

// R2 client configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

// Constants
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'voxarena'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
]

interface UploadDocumentResult {
  url: string
  key: string
  size: number
  type: string
}

/**
 * Validate document file
 */
export function validateDocument(file: File | Blob, fileName?: string): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
    }
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only PDF and Word documents are allowed.'
    }
  }

  // Check file extension if filename is provided
  if (fileName) {
    const ext = fileName.toLowerCase().split('.').pop()
    const validExtensions = ['pdf', 'doc', 'docx']
    if (!ext || !validExtensions.includes(ext)) {
      return {
        valid: false,
        error: 'Invalid file extension. Only .pdf, .doc, and .docx files are allowed.'
      }
    }
  }

  return { valid: true }
}

/**
 * Generate unique filename for document
 */
function generateUniqueKey(debateId: string, originalName: string): string {
  const timestamp = Date.now()
  const hash = createHash('md5').update(`${debateId}-${timestamp}`).digest('hex').substring(0, 8)
  const ext = originalName.toLowerCase().split('.').pop()
  const sanitizedName = originalName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)

  return `documents/debates/${debateId}/${timestamp}-${hash}-${sanitizedName}`
}

/**
 * Upload document to R2
 */
export async function uploadDocument(
  debateId: string,
  file: Buffer | Uint8Array,
  originalName: string,
  mimeType: string
): Promise<UploadDocumentResult> {
  try {
    const key = generateUniqueKey(debateId, originalName)

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: mimeType,
      Metadata: {
        'original-name': originalName,
        'debate-id': debateId,
        'uploaded-at': new Date().toISOString(),
      },
    })

    await r2Client.send(command)

    // Generate public URL
    const url = `${process.env.R2_PUBLIC_URL}/${key}`

    return {
      url,
      key,
      size: file.length,
      type: mimeType,
    }
  } catch (error) {
    console.error('Error uploading document to R2:', error)
    throw new Error('Failed to upload document')
  }
}

/**
 * Delete document from R2
 */
export async function deleteDocument(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await r2Client.send(command)
  } catch (error) {
    console.error('Error deleting document from R2:', error)
    // Don't throw error if deletion fails - log it but continue
  }
}

/**
 * Extract R2 key from URL
 */
export function extractKeyFromUrl(url: string): string {
  // Remove the base URL to get the key
  const baseUrl = process.env.R2_PUBLIC_URL || ''
  return url.replace(`${baseUrl}/`, '')
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file type display name
 */
export function getFileTypeDisplay(mimeType: string): string {
  switch (mimeType) {
    case 'application/pdf':
      return 'PDF Document'
    case 'application/msword':
      return 'Word Document (.doc)'
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'Word Document (.docx)'
    default:
      return 'Document'
  }
}