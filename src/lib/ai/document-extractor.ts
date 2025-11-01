import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { extractKeyFromUrl } from '@/lib/r2/document-upload'

// R2 client configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'voxarena'

/**
 * Fetch document content from R2
 * For now, we'll return a summary prompt for the AI to analyze the document
 */
export async function fetchDocumentContent(documentUrl: string, documentName?: string): Promise<string | null> {
  try {
    if (!documentUrl) return null

    // For the AI debate generation, we'll describe the document context
    // In a production environment, you might want to:
    // 1. Download and parse PDF/Word content using libraries like pdf-parse or mammoth
    // 2. Extract the actual text content
    // 3. Summarize long documents to fit within token limits

    // For now, return a document context description
    const documentContext = `
DOCUMENT FOR REVIEW:
- Document Name: ${documentName || 'Uploaded Document'}
- Document URL: ${documentUrl}

IMPORTANT: This debate involves reviewing and discussing the above document.
The experts should reference specific aspects of the document, provide critique,
offer suggestions for improvement, and evaluate its strengths and weaknesses.

Since the actual document content extraction is not implemented yet,
the AI should simulate a realistic review discussion based on:
1. The document title/name
2. The debate topic and description
3. The segment structure (e.g., document summary, individual assessments, recommendations)
4. Each expert's background and expertise

The discussion should feel authentic as if the experts have thoroughly reviewed the actual document.
`

    return documentContext
  } catch (error) {
    console.error('Error fetching document content:', error)
    return null
  }
}

/**
 * Create a document summary prompt for AI generation
 */
export function createDocumentPrompt(documentName?: string | null, documentContent?: string | null): string {
  if (!documentName && !documentContent) {
    return ''
  }

  return `
DOCUMENT UNDER REVIEW:
${documentName ? `Title/Name: ${documentName}` : ''}
${documentContent || ''}

The participants should engage with this document throughout the debate,
referencing it specifically when making their points, critiques, and recommendations.
`
}