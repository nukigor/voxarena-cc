import OpenAI from 'openai'
import { PersonaFormConfig } from '@/types/persona-form-config'
import { logAiPrompt, buildAvatarPromptExplanation } from '@/lib/ai/prompt-logger'
import { AiPromptFunctionality, AiPromptParentModel, AiModel } from '@/types/ai-prompt-log'
import { AiPromptStatus } from '@prisma/client'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface PersonaData {
  [key: string]: any
}

interface TaxonomyTermIds {
  [categorySlug: string]: string | string[]
}

/**
 * Builds a comprehensive prompt with all persona characteristics
 */
function buildFullPrompt(
  personaData: PersonaData,
  taxonomyTermIds: TaxonomyTermIds,
  config: PersonaFormConfig
): string {
  const promptParts: string[] = []

  // Base prompt with photo-realistic requirements
  const basePrompt = `Photo-realistic head and shoulders portrait, centered composition, neutral minimal background, soft focus behind subject, natural daylight, approachable and authentic, calm with neutral steady gaze.`
  promptParts.push(basePrompt)

  // Collect all taxonomy fields from config
  const taxonomyFields = new Map<string, any>()
  config.pages.forEach((page) => {
    page.fieldGroups.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.source === 'persona_taxonomy' && field.options) {
          taxonomyFields.set(field.name, {
            description: field.helperText || field.description || '',
            options: field.options,
            type: field.type,
          })
        }
      })
    })
  })

  // Add all taxonomy-based characteristics with full descriptions
  Object.entries(taxonomyTermIds).forEach(([categorySlug, termIdOrIds]) => {
    const fieldConfig = taxonomyFields.get(categorySlug)
    if (!fieldConfig) return

    const termIds = Array.isArray(termIdOrIds) ? termIdOrIds : [termIdOrIds]

    termIds.forEach((termId) => {
      const selectedTerm = fieldConfig.options.find((opt: any) => opt.value === termId)
      if (selectedTerm) {
        const termDescription = selectedTerm.description || selectedTerm.label
        promptParts.push(`${selectedTerm.label}: ${termDescription}`)
      }
    })
  })

  // Add profession/role if provided
  if (personaData.professionRole && typeof personaData.professionRole === 'string' && personaData.professionRole.trim()) {
    promptParts.push(`Professional role: ${personaData.professionRole.trim()}`)
  }

  // Add quirks if provided
  if (personaData.quirks && typeof personaData.quirks === 'string' && personaData.quirks.trim()) {
    promptParts.push(`Distinctive characteristics: ${personaData.quirks.trim()}`)
  }

  return promptParts.join(' ')
}

/**
 * Uses OpenAI to condense a prompt that's too long while preserving visual details
 */
async function condensePrompt(longPrompt: string): Promise<string> {
  console.log(`Prompt too long (${longPrompt.length} chars), using AI to condense...`)

  const condenserPrompt = `You are a prompt optimizer for DALL-E 3 image generation. Your task is to condense the following persona description into a concise prompt under 3900 characters while preserving the most visually relevant details for generating a photo-realistic portrait.

PRIORITIZE in order:
1. Age, gender, ethnicity, cultural background
2. Physical appearance descriptors
3. Professional context if it affects appearance
4. Personality traits that affect facial expression or demeanor

DEPRIORITIZE:
- Abstract concepts (debate styles, philosophical views)
- Non-visual characteristics (communication patterns, thinking styles)
- Redundant or repetitive information

ORIGINAL PROMPT (${longPrompt.length} chars):
${longPrompt}

CONDENSED PROMPT (under 3900 characters, focusing on visual characteristics):`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a prompt optimization expert. Return only the condensed prompt, no explanation or commentary.'
        },
        {
          role: 'user',
          content: condenserPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const condensed = response.choices[0]?.message?.content?.trim()
    if (!condensed) {
      throw new Error('No condensed prompt returned')
    }

    console.log(`Condensed prompt to ${condensed.length} characters`)
    return condensed
  } catch (error) {
    console.error('Failed to condense prompt, falling back to truncation:', error)
    // Fallback to simple truncation if AI condensing fails
    return longPrompt.substring(0, 3900) + '...'
  }
}

/**
 * Builds a dynamic AI prompt for avatar generation based on persona characteristics
 * If prompt exceeds 4000 chars, uses AI to intelligently condense it
 */
export async function buildAvatarPrompt(
  personaData: PersonaData,
  taxonomyTermIds: TaxonomyTermIds,
  config: PersonaFormConfig
): Promise<string> {
  // Build full prompt with all details
  const fullPrompt = buildFullPrompt(personaData, taxonomyTermIds, config)

  console.log(`Generated full prompt: ${fullPrompt.length} characters`)

  // If under limit, use as-is
  if (fullPrompt.length <= 3900) {
    return fullPrompt
  }

  // Otherwise, use AI to intelligently condense
  return await condensePrompt(fullPrompt)
}

/**
 * Generates a persona avatar using configured image provider
 * @returns Buffer containing the generated image
 */
export async function generatePersonaAvatar(
  personaData: PersonaData,
  taxonomyTermIds: TaxonomyTermIds,
  config: PersonaFormConfig,
  personaId?: string,
  personaName?: string,
  imageProvider: string = 'OPENAI',
  imageModel: string = 'dall-e-3'
): Promise<Buffer> {
  const startTime = Date.now()
  let finalPrompt = ''
  let wasCondensed = false

  try {
    // Build the full prompt first (before condensing)
    const fullPrompt = buildFullPrompt(personaData, taxonomyTermIds, config)

    // Build the actual prompt that will be sent (may be condensed)
    finalPrompt = await buildAvatarPrompt(personaData, taxonomyTermIds, config)
    wasCondensed = fullPrompt.length > 3900

    console.log('Generating avatar with final prompt:', finalPrompt)
    console.log(`Using image provider: ${imageProvider}, model: ${imageModel}`)

    // Only OpenAI is supported for now
    if (imageProvider !== 'OPENAI') {
      throw new Error(`Unsupported image provider: ${imageProvider}. Only OPENAI is currently supported.`)
    }

    // Generate image using configured model
    const response = await openai.images.generate({
      model: imageModel as 'dall-e-3' | 'dall-e-2',
      prompt: finalPrompt,
      n: 1,
      size: '1024x1024',
      quality: imageModel === 'dall-e-3' ? 'standard' : undefined, // quality only supported in DALL-E 3
      response_format: 'url',
    })

    const imageUrl = response.data[0]?.url
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E')
    }

    console.log('Avatar generated successfully, downloading image...')

    // Download the image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to download generated image: ${imageResponse.statusText}`)
    }

    const arrayBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Log successful generation
    if (personaId && personaName) {
      const executionTime = Date.now() - startTime

      // Build taxonomy values for explanation
      const taxonomyValues = Object.entries(taxonomyTermIds).flatMap(([categorySlug, termIds]) => {
        const fieldConfig = config.pages
          .flatMap(p => p.fieldGroups)
          .flatMap(g => g.fields)
          .find(f => f.name === categorySlug)

        if (!fieldConfig?.options) return []

        const termIdArray = Array.isArray(termIds) ? termIds : [termIds]
        return termIdArray.map(termId => {
          const option = fieldConfig.options?.find((opt: any) => opt.value === termId)
          if (!option) return null
          return {
            term: {
              id: termId,
              name: option.label,
              slug: categorySlug,
              description: option.description || option.label,
              category: {
                id: categorySlug,
                name: fieldConfig.label || categorySlug,
                slug: categorySlug,
                description: fieldConfig.helperText || '',
              }
            }
          }
        }).filter(Boolean)
      })

      const promptExplanation = buildAvatarPromptExplanation(
        personaData,
        taxonomyValues as any,
        fullPrompt,
        wasCondensed
      )

      await logAiPrompt({
        functionality: AiPromptFunctionality.PERSONA_AVATAR,
        parentModel: AiPromptParentModel.PERSONA,
        parentObjectId: personaId,
        parentObjectName: personaName,
        aiModel: AiModel.DALL_E_3,
        prompt: finalPrompt,
        promptExplanation,
        result: imageUrl,
        status: AiPromptStatus.SUCCESS,
        executionTimeMs: executionTime,
      })
    }

    return buffer
  } catch (error) {
    console.error('Error generating persona avatar:', error)

    // Log failed generation
    if (personaId && personaName) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      await logAiPrompt({
        functionality: AiPromptFunctionality.PERSONA_AVATAR,
        parentModel: AiPromptParentModel.PERSONA,
        parentObjectId: personaId,
        parentObjectName: personaName,
        aiModel: AiModel.DALL_E_3,
        prompt: finalPrompt || 'Failed before prompt generation',
        promptExplanation: 'Avatar generation failed',
        result: '',
        status: AiPromptStatus.FAILED,
        executionTimeMs: executionTime,
        errorMessage,
      })
    }

    throw new Error(`Avatar generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
