import { logAiPrompt, buildTeaserPromptExplanation, buildDescriptionPromptExplanation } from '@/lib/ai/prompt-logger'
import { AiPromptFunctionality, AiPromptParentModel, AiModel } from '@/types/ai-prompt-log'
import { AiPromptStatus, AiProvider as PrismaAiProvider } from '@prisma/client'
import { getAiProvider } from '@/lib/ai/providers/factory'

interface PersonaData {
  [key: string]: any
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

/**
 * Builds a prompt for generating a persona description
 * Uses taxonomy terms, their descriptions, parent categories, and persona properties
 */
function buildDescriptionPrompt(
  personaData: PersonaData,
  taxonomyValues: TaxonomyValue[]
): string {
  const promptParts: string[] = []

  // Add persona name and nickname
  if (personaData.name && typeof personaData.name === 'string' && personaData.name.trim()) {
    promptParts.push(`Persona name: ${personaData.name.trim()}`)
  }

  if (personaData.nickname && typeof personaData.nickname === 'string' && personaData.nickname.trim()) {
    promptParts.push(`Nickname: ${personaData.nickname.trim()}`)
  }

  // Add persona direct properties
  if (personaData.professionRole && typeof personaData.professionRole === 'string' && personaData.professionRole.trim()) {
    promptParts.push(`Professional role: ${personaData.professionRole.trim()}`)
  }

  if (personaData.quirks && typeof personaData.quirks === 'string' && personaData.quirks.trim()) {
    promptParts.push(`Distinctive characteristics/quirks: ${personaData.quirks.trim()}`)
  }

  // Group taxonomy values by category
  const categoriesMap = new Map<string, { category: any; terms: any[] }>()

  taxonomyValues.forEach((tv) => {
    const categorySlug = tv.term.category.slug
    if (!categoriesMap.has(categorySlug)) {
      categoriesMap.set(categorySlug, {
        category: tv.term.category,
        terms: [],
      })
    }
    categoriesMap.get(categorySlug)!.terms.push(tv.term)
  })

  // Add taxonomy information organized by category
  categoriesMap.forEach(({ category, terms }) => {
    promptParts.push(`\n${category.name} (${category.description}):`)
    terms.forEach((term) => {
      promptParts.push(`- ${term.name}: ${term.description}`)
    })
  })

  return promptParts.join('\n')
}

/**
 * Generates a captivating persona description using configured AI provider
 * @returns Generated description text (2-3 paragraphs, 200-300 words)
 */
export async function generatePersonaDescription(
  personaData: PersonaData,
  taxonomyValues: TaxonomyValue[],
  personaId?: string,
  personaName?: string,
  contentProvider: PrismaAiProvider = 'OPENAI',
  contentModel: string = 'gpt-4o',
  temperature: number = 0.8,
  maxTokens: number = 500
): Promise<string> {
  const startTime = Date.now()
  let characteristicsPrompt = ''

  try {
    // Build the characteristics prompt
    characteristicsPrompt = buildDescriptionPrompt(personaData, taxonomyValues)

    console.log('Generating persona description with characteristics:', characteristicsPrompt)
    console.log(`Using content provider: ${contentProvider}, model: ${contentModel}`)

    const systemPrompt = `You are an expert writer crafting compelling persona descriptions for VoxArena, a debate platform. Your task is to create captivating, well-rounded persona descriptions that make users want to choose this persona for upcoming debates.

STYLE GUIDELINES:
- Use an engaging, confident, and slightly cinematic tone
- Make the persona feel alive and interesting, but also credible and debate-ready
- Write 2-3 paragraphs, around 200-300 words total
- Start with a hook sentence that encapsulates their vibe
- Describe their worldview, debate style, and what makes them stand out
- End with a short tagline or quote that captures their essence

EMPHASIS:
- Highlight how this persona's background, intellect, or temperament can spark dynamic, memorable debates
- Show why someone would WANT to include them in a debate
- Make them feel like a real, three-dimensional person with conviction and personality

Do not use placeholder text or generic statements. Create a specific, vivid description based on the characteristics provided.`

    const userPrompt = `Create a compelling persona description based on these characteristics:

${characteristicsPrompt}

Remember: 2-3 paragraphs, 200-300 words, engaging and debate-focused. Make them irresistible for debates!`

    // Get AI provider and generate description
    const provider = getAiProvider(contentProvider)
    const response = await provider.generate({
      provider: contentProvider,
      model: contentModel,
      prompt: userPrompt,
      systemPrompt: systemPrompt,
      temperature,
      maxTokens,
    })

    const description = response.content?.trim()
    if (!description) {
      throw new Error(`No description returned from ${contentProvider}`)
    }

    console.log(`Generated description: ${description.length} characters`)

    // Log successful generation
    if (personaId && personaName) {
      const executionTime = Date.now() - startTime
      const promptExplanation = buildDescriptionPromptExplanation(personaData, taxonomyValues)
      const tokenUsage = response.usage?.total_tokens

      await logAiPrompt({
        functionality: AiPromptFunctionality.PERSONA_DESCRIPTION,
        parentModel: AiPromptParentModel.PERSONA,
        parentObjectId: personaId,
        parentObjectName: personaName,
        aiModel: contentModel,
        prompt: `SYSTEM:\n${systemPrompt}\n\nUSER:\n${userPrompt}`,
        promptExplanation,
        result: description,
        status: AiPromptStatus.SUCCESS,
        executionTimeMs: executionTime,
        tokenUsage,
      })
    }

    return description
  } catch (error) {
    console.error('Error generating persona description:', error)

    // Log failed generation
    if (personaId && personaName) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      await logAiPrompt({
        functionality: AiPromptFunctionality.PERSONA_DESCRIPTION,
        parentModel: AiPromptParentModel.PERSONA,
        parentObjectId: personaId,
        parentObjectName: personaName,
        aiModel: contentModel,
        prompt: characteristicsPrompt || 'Failed before prompt generation',
        promptExplanation: 'Description generation failed',
        result: '',
        status: AiPromptStatus.FAILED,
        executionTimeMs: executionTime,
        errorMessage,
      })
    }

    throw new Error(`Description generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Builds a specialized prompt for teaser generation
 * Prioritizes taxonomy characteristics and quirks over profession
 */
function buildTeaserPrompt(
  personaData: PersonaData,
  taxonomyValues: TaxonomyValue[]
): string {
  const promptParts: string[] = []

  // Add persona name and nickname FIRST
  if (personaData.name && typeof personaData.name === 'string' && personaData.name.trim()) {
    promptParts.push(`Persona name: ${personaData.name.trim()}`)
  }

  if (personaData.nickname && typeof personaData.nickname === 'string' && personaData.nickname.trim()) {
    promptParts.push(`Nickname: ${personaData.nickname.trim()}`)
  }

  // Group taxonomy values by category (most important for teasers)
  const categoriesMap = new Map<string, { category: any; terms: any[] }>()

  taxonomyValues.forEach((tv) => {
    const categorySlug = tv.term.category.slug
    if (!categoriesMap.has(categorySlug)) {
      categoriesMap.set(categorySlug, {
        category: tv.term.category,
        terms: [],
      })
    }
    categoriesMap.get(categorySlug)!.terms.push(tv.term)
  })

  // Add taxonomy characteristics (these define the debate persona)
  categoriesMap.forEach(({ category, terms }) => {
    promptParts.push(`${category.name}:`)
    terms.forEach((term) => {
      // For teaser, use term name and brief description
      promptParts.push(`- ${term.name}`)
    })
  })

  // Add quirks SECOND (personality, debate style)
  if (personaData.quirks && typeof personaData.quirks === 'string' && personaData.quirks.trim()) {
    promptParts.push(`\nPersonality/Style: ${personaData.quirks.trim()}`)
  }

  // Add profession LAST and summarized (context, not focus)
  if (personaData.professionRole && typeof personaData.professionRole === 'string' && personaData.professionRole.trim()) {
    // Truncate very long profession descriptions to avoid overwhelming the prompt
    const profession = personaData.professionRole.trim()
    const professionSummary = profession.length > 150
      ? profession.substring(0, 150) + '...'
      : profession
    promptParts.push(`\nBackground context: ${professionSummary}`)
  }

  return promptParts.join('\n')
}

/**
 * Generates an ultra-short, punchy teaser for a persona card using configured AI provider
 * @returns Generated teaser text (maximum 8 words)
 */
export async function generatePersonaTeaser(
  personaData: PersonaData,
  taxonomyValues: TaxonomyValue[],
  personaId?: string,
  personaName?: string,
  contentProvider: PrismaAiProvider = 'OPENAI',
  contentModel: string = 'gpt-4o',
  temperature: number = 0.5,
  maxTokens: number = 30
): Promise<string> {
  const startTime = Date.now()
  let characteristicsPrompt = ''

  try {
    // Build specialized teaser prompt (prioritizes taxonomy & quirks over profession)
    characteristicsPrompt = buildTeaserPrompt(personaData, taxonomyValues)

    console.log('Generating persona teaser with characteristics:', characteristicsPrompt)
    console.log(`Using content provider: ${contentProvider}, model: ${contentModel}`)

    const systemPrompt = `You are an expert copywriter crafting ultra-short, punchy teasers for VoxArena persona cards. Your task is to capture what makes this persona compelling for DEBATES.

CRITICAL REQUIREMENTS:
- MAXIMUM 8 WORDS
- No filler words or generic phrases
- Focus on DEBATE PERSPECTIVE, not job titles
- Make users want to include this persona in debates
- Make it memorable and intriguing

APPROACH - READ CAREFULLY:
- The characteristics are listed in PRIORITY ORDER
- First listed = most important for the teaser (worldview, ideology, values)
- Last listed = background context only (don't lead with this)
- DON'T just describe what they DO professionally
- DO describe their STANCE, PERSPECTIVE, or DEBATE ANGLE
- Think: "What would they ARGUE in a debate?" not "What's their job?"

FORBIDDEN PATTERNS (DO NOT USE):
❌ "Global strategist doing X"
❌ "Senior professional in Y field"
❌ "Expert leading Z initiative"
❌ Generic job title descriptions

GOOD PATTERNS (USE THESE):
✓ Ideology + specific challenge (e.g., "Anarchist challenging food industry hierarchies")
✓ Perspective + what they defend (e.g., "Traditionalist defending cultural preservation")
✓ Stance + what they question (e.g., "Skeptic questioning digital dependency")
✓ Values + tension they navigate (e.g., "Pragmatist balancing ideals and reality")

Examples of debate-focused teasers:
- "Anarchist chef challenging food industry power"
- "Former teacher defending traditional learning values"
- "Tech skeptic questioning digital dependency"
- "Pragmatic idealist bridging vision and reality"
- "Contrarian economist rethinking market assumptions"

Return ONLY the teaser text, nothing else.`

    const userPrompt = `Create an ultra-short teaser (max 8 words) for a DEBATE persona with these characteristics:

${characteristicsPrompt}

IMPORTANT: The characteristics are listed in priority order. Focus on the TOP characteristics (worldview, values, ideology) to create the teaser. The "Background context" at the bottom is just context - don't make it the focus of the teaser.

What STANCE or PERSPECTIVE do they bring to debates? What would they ARGUE or CHALLENGE?

Remember: Maximum 8 words. Focus on debate perspective, NOT job title.`

    // Get AI provider and generate teaser
    const provider = getAiProvider(contentProvider)
    const response = await provider.generate({
      provider: contentProvider,
      model: contentModel,
      prompt: userPrompt,
      systemPrompt: systemPrompt,
      temperature,
      maxTokens,
    })

    let teaser = response.content?.trim()
    if (!teaser) {
      throw new Error(`No teaser returned from ${contentProvider}`)
    }

    // Remove quotation marks from the teaser (both single and double)
    teaser = teaser.replace(/^["']|["']$/g, '')

    // Validate word count (warn if exceeds 8 words but don't fail)
    const wordCount = teaser.split(/\s+/).length
    if (wordCount > 8) {
      console.warn(`Generated teaser has ${wordCount} words (expected max 8): "${teaser}"`)
    }

    console.log(`Generated teaser: "${teaser}" (${wordCount} words)`)

    // Log successful generation
    if (personaId && personaName) {
      const executionTime = Date.now() - startTime
      const promptExplanation = buildTeaserPromptExplanation(personaData, taxonomyValues)
      const tokenUsage = response.usage?.total_tokens

      await logAiPrompt({
        functionality: AiPromptFunctionality.PERSONA_TEASER,
        parentModel: AiPromptParentModel.PERSONA,
        parentObjectId: personaId,
        parentObjectName: personaName,
        aiModel: contentModel,
        prompt: `SYSTEM:\n${systemPrompt}\n\nUSER:\n${userPrompt}`,
        promptExplanation,
        result: teaser,
        status: AiPromptStatus.SUCCESS,
        executionTimeMs: executionTime,
        tokenUsage,
      })
    }

    return teaser
  } catch (error) {
    console.error('Error generating persona teaser:', error)

    // Log failed generation
    if (personaId && personaName) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      await logAiPrompt({
        functionality: AiPromptFunctionality.PERSONA_TEASER,
        parentModel: AiPromptParentModel.PERSONA,
        parentObjectId: personaId,
        parentObjectName: personaName,
        aiModel: contentModel,
        prompt: characteristicsPrompt || 'Failed before prompt generation',
        promptExplanation: 'Teaser generation failed',
        result: '',
        status: AiPromptStatus.FAILED,
        executionTimeMs: executionTime,
        errorMessage,
      })
    }

    throw new Error(`Teaser generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
