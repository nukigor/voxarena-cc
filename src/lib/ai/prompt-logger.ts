import prisma from '@/lib/db/prisma'
import {
  AiPromptFunctionality,
  AiPromptParentModel,
  AiModel,
  CreateAiPromptLogInput,
} from '@/types/ai-prompt-log'
import { AiPromptStatus } from '@prisma/client'

// OpenAI pricing (as of 2024) - USD per 1K tokens
const PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'dall-e-3': { input: 0, output: 0.04 }, // Per image for 1024x1024 standard quality
}

interface TaxonomyValue {
  term: {
    id: string
    name: string
    slug: string
    description: string
    category: {
      id: string
      name: string
      slug: string
      description: string
    }
  }
}

interface LogPromptParams {
  functionality: AiPromptFunctionality
  parentModel: AiPromptParentModel
  parentObjectId: string
  parentObjectName: string
  parentObjectSlug?: string
  aiModel: string  // Accept any model string (not limited to AiModel enum)
  prompt: string
  promptExplanation: string
  result?: string
  status: AiPromptStatus
  executionTimeMs?: number
  tokenUsage?: number
  errorMessage?: string
}

/**
 * Main logging function - creates a log entry in the database
 */
export async function logAiPrompt(params: LogPromptParams): Promise<void> {
  try {
    const estimatedCost = calculateCost(params.aiModel, params.tokenUsage)

    const logData: CreateAiPromptLogInput = {
      functionality: params.functionality,
      parentModel: params.parentModel,
      parentObjectId: params.parentObjectId,
      parentObjectName: params.parentObjectName,
      parentObjectSlug: params.parentObjectSlug || null,
      aiModel: params.aiModel,
      prompt: params.prompt,
      promptExplanation: params.promptExplanation,
      result: params.result || '',
      status: params.status,
      executionTimeMs: params.executionTimeMs || null,
      tokenUsage: params.tokenUsage || null,
      estimatedCost,
      errorMessage: params.errorMessage || null,
    }

    await prisma.aiPromptLog.create({
      data: logData,
    })

    console.log(`[AI Prompt Log] ${params.functionality} logged for ${params.parentModel}:${params.parentObjectId}`)
  } catch (error) {
    // Don't fail the main operation if logging fails
    console.error('[AI Prompt Log] Failed to log prompt:', error)
  }
}

/**
 * Calculate estimated cost based on model and token usage
 */
function calculateCost(model: AiModel, tokenUsage?: number): number | null {
  const pricing = PRICING[model]
  if (!pricing) return null

  if (model === AiModel.DALL_E_3) {
    // DALL-E 3 charges per image, not per token
    return pricing.output
  }

  if (!tokenUsage) return null

  // For text models, assume 50/50 split between input and output tokens
  // This is a rough estimate - more accurate tracking would require separate input/output counts
  const inputTokens = tokenUsage * 0.5
  const outputTokens = tokenUsage * 0.5

  return (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output
}

/**
 * Build a human-readable explanation for persona avatar generation
 */
export function buildAvatarPromptExplanation(
  personaData: any,
  taxonomyValues: TaxonomyValue[],
  fullPrompt: string,
  wasCondensed: boolean
): string {
  const parts: string[] = []

  parts.push('=== PROMPT CONSTRUCTION EXPLANATION ===\n')
  parts.push('Base prompt: Photo-realistic head and shoulders portrait requirements\n')

  // Taxonomy characteristics
  if (taxonomyValues.length > 0) {
    parts.push('\nTaxonomy characteristics:')
    taxonomyValues.forEach((tv) => {
      parts.push(
        `- ${tv.term.name}: From persona taxonomy category "${tv.term.category.name}" (${tv.term.category.slug})`
      )
    })
  }

  // Direct persona fields
  const directFields: string[] = []
  if (personaData.professionRole) {
    directFields.push('- Professional role: From persona.professionRole field')
  }
  if (personaData.quirks) {
    directFields.push('- Distinctive characteristics: From persona.quirks field')
  }

  if (directFields.length > 0) {
    parts.push('\nDirect persona fields:')
    parts.push(...directFields)
  }

  // Prompt metadata
  parts.push(`\nTotal prompt length: ${fullPrompt.length} characters`)
  parts.push(`Prompt condensed: ${wasCondensed ? 'Yes (exceeded 3900 char limit)' : 'No (under 3900 char limit)'}`)

  return parts.join('\n')
}

/**
 * Build a human-readable explanation for persona teaser generation
 */
export function buildTeaserPromptExplanation(
  personaData: any,
  taxonomyValues: TaxonomyValue[]
): string {
  const parts: string[] = []

  parts.push('=== PROMPT CONSTRUCTION EXPLANATION ===\n')
  parts.push('Model: GPT-4o')
  parts.push('Task: Generate ultra-short, punchy teaser (max 8 words)\n')

  parts.push('\nPrompt structure (in priority order):')
  parts.push('1. Persona name: From persona.name field')
  if (personaData.nickname) {
    parts.push('2. Nickname: From persona.nickname field')
  }

  if (taxonomyValues.length > 0) {
    parts.push('\n3. Taxonomy characteristics (defining debate persona):')
    const categoriesMap = new Map<string, TaxonomyValue[]>()
    taxonomyValues.forEach((tv) => {
      const catSlug = tv.term.category.slug
      if (!categoriesMap.has(catSlug)) {
        categoriesMap.set(catSlug, [])
      }
      categoriesMap.get(catSlug)!.push(tv)
    })

    categoriesMap.forEach((terms, catSlug) => {
      const category = terms[0].term.category
      parts.push(`   - ${category.name}:`)
      terms.forEach((tv) => {
        parts.push(`     • ${tv.term.name}`)
      })
    })
  }

  if (personaData.quirks) {
    parts.push('\n4. Personality/Style: From persona.quirks field')
  }

  if (personaData.professionRole) {
    parts.push('\n5. Background context: From persona.professionRole field (summarized if >150 chars)')
  }

  parts.push('\nNote: Characteristics are prioritized to focus on debate perspective, not job titles')

  return parts.join('\n')
}

/**
 * Build a human-readable explanation for persona description generation
 */
export function buildDescriptionPromptExplanation(
  personaData: any,
  taxonomyValues: TaxonomyValue[]
): string {
  const parts: string[] = []

  parts.push('=== PROMPT CONSTRUCTION EXPLANATION ===\n')
  parts.push('Model: GPT-4o')
  parts.push('Task: Generate compelling persona description (2-3 paragraphs, 200-300 words)\n')

  parts.push('\nPrompt components:')

  // Persona core fields
  const coreFields: string[] = []
  if (personaData.name) coreFields.push('- Persona name: From persona.name field')
  if (personaData.nickname) coreFields.push('- Nickname: From persona.nickname field')
  if (personaData.professionRole) coreFields.push('- Professional role: From persona.professionRole field')
  if (personaData.quirks) coreFields.push('- Distinctive characteristics: From persona.quirks field')

  if (coreFields.length > 0) {
    parts.push('\n1. Persona core fields:')
    parts.push(...coreFields)
  }

  // Taxonomy characteristics grouped by category
  if (taxonomyValues.length > 0) {
    parts.push('\n2. Taxonomy characteristics (grouped by category):')

    const categoriesMap = new Map<string, TaxonomyValue[]>()
    taxonomyValues.forEach((tv) => {
      const catSlug = tv.term.category.slug
      if (!categoriesMap.has(catSlug)) {
        categoriesMap.set(catSlug, [])
      }
      categoriesMap.get(catSlug)!.push(tv)
    })

    categoriesMap.forEach((terms, catSlug) => {
      const category = terms[0].term.category
      parts.push(`   - ${category.name} (${category.description}):`)
      terms.forEach((tv) => {
        parts.push(`     • ${tv.term.name}: ${tv.term.description}`)
      })
    })
  }

  parts.push('\nStyle instructions: Engaging, confident, cinematic tone; focus on debate readiness')

  return parts.join('\n')
}

/**
 * Build a human-readable explanation for debate generation
 */
export function buildDebatePromptExplanation(
  debateData: any,
  participants: any[],
  segments: any[]
): string {
  const parts: string[] = []

  parts.push('=== DEBATE GENERATION EXPLANATION ===\n')
  parts.push('Model: GPT-4o')
  parts.push(`Task: Generate complete debate transcript with ${segments.length} segments\n`)

  // Debate configuration
  parts.push('\nDebate Configuration:')
  parts.push(`- Title: ${debateData.title}`)
  parts.push(`- Topic: ${debateData.topic}`)
  if (debateData.description) parts.push(`- Description: ${debateData.description}`)
  parts.push(`- Mode: ${debateData.mode?.name || 'Default'}`)
  if (debateData.formatTemplate) {
    parts.push(`- Format Template: ${debateData.formatTemplate.name} (${debateData.formatTemplate.category})`)
  }
  if (debateData.totalDurationMinutes) {
    parts.push(`- Total Duration: ${debateData.totalDurationMinutes} minutes`)
  }

  // Participants
  parts.push('\nParticipants:')
  participants.forEach((p) => {
    parts.push(`- ${p.name} (${p.role})`)
    if (p.taxonomyValues && p.taxonomyValues.length > 0) {
      const categories = new Set(p.taxonomyValues.map((tv: any) => tv.term.category.name))
      parts.push(`  Characteristics: ${Array.from(categories).join(', ')}`)
    }
    if (p.previousDebates && p.previousDebates.length > 0) {
      parts.push(`  Previous debates: ${p.previousDebates.length} referenced`)
    }
  })

  // Segments
  parts.push('\nGenerated Segments:')
  segments.forEach((segment) => {
    parts.push(`- ${segment.title} (${segment.durationMinutes} minutes)`)
    if (segment.description) {
      parts.push(`  Focus: ${segment.description}`)
    }
  })

  // Generation approach
  parts.push('\nGeneration Approach:')
  parts.push('- Each segment generated with context from previous segments')
  parts.push('- Personas maintain consistent voice based on taxonomy characteristics')
  parts.push('- References to previous debates included where relevant')
  parts.push('- Natural dialogue with personality traits from quirks field')
  parts.push('- Arguments reflect worldview from high-weight taxonomy categories')

  return parts.join('\n')
}
