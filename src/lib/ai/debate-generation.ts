import OpenAI from 'openai'
import { logAiPrompt, buildDebatePromptExplanation } from '@/lib/ai/prompt-logger'
import { AiPromptFunctionality, AiPromptParentModel, AiModel } from '@/types/ai-prompt-log'
import { AiPromptStatus } from '@prisma/client'
import prisma from '@/lib/db/prisma'
import { createDocumentPrompt } from '@/lib/ai/document-extractor'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Types for debate generation
interface PersonaProfile {
  id: string
  name: string
  nickname?: string | null
  professionRole?: string | null
  quirks?: string | null
  role: string
  speakingOrder?: number | null
  taxonomyValues: Array<{
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
        promptWeight: number
      }
    }
  }>
  previousDebates?: Array<{
    debate: {
      id: string
      title: string
      topic: string
      status: string
    }
    role: string
  }>
}

interface DebateSegment {
  key: string
  title: string
  description?: string
  durationMinutes: number
  participantRoles?: string[]
  orderIndex?: number
}

interface DebateData {
  id: string
  title: string
  topic: string
  description?: string | null
  mode: {
    name: string
    description?: string | null
  }
  formatTemplate?: {
    name: string
    description: string
    category: string
    allowsDocumentUpload?: boolean
  } | null
  totalDurationMinutes?: number | null
  segmentStructure?: any
  participants: PersonaProfile[]
  reviewDocumentUrl?: string | null
  reviewDocumentName?: string | null
  reviewDocumentContent?: string | null  // Will be populated with document content
}

interface GeneratedSegment {
  segmentKey: string
  title: string
  content: string
  orderIndex: number
}

/**
 * Build comprehensive persona context including all characteristics and history
 */
function buildPersonaContext(persona: PersonaProfile): string {
  const parts: string[] = []

  // Core identity
  parts.push(`**${persona.name}** (Role: ${persona.role})`)
  if (persona.nickname) {
    parts.push(`Also known as: ${persona.nickname}`)
  }

  // Professional background
  if (persona.professionRole) {
    parts.push(`\nProfessional Background: ${persona.professionRole}`)
  }

  // Personality and debate style
  if (persona.quirks) {
    parts.push(`\nDebate Style & Personality: ${persona.quirks}`)
  }

  // Taxonomy values grouped by category (sorted by promptWeight)
  const categoriesMap = new Map<string, typeof persona.taxonomyValues>()
  persona.taxonomyValues.forEach((tv) => {
    const categorySlug = tv.term.category.slug
    if (!categoriesMap.has(categorySlug)) {
      categoriesMap.set(categorySlug, [])
    }
    categoriesMap.get(categorySlug)!.push(tv)
  })

  // Sort categories by promptWeight (higher weight = more important)
  const sortedCategories = Array.from(categoriesMap.entries()).sort(
    (a, b) => (b[1][0]?.term.category.promptWeight || 0) - (a[1][0]?.term.category.promptWeight || 0)
  )

  if (sortedCategories.length > 0) {
    parts.push('\nCore Characteristics (in order of debate influence):')
    sortedCategories.forEach(([_categorySlug, terms]) => {
      const category = terms[0].term.category
      parts.push(`\n${category.name} (${category.description}):`)
      terms.forEach((tv) => {
        parts.push(`- ${tv.term.name}: ${tv.term.description}`)
      })
    })
  }

  // Previous debate participation (if available)
  if (persona.previousDebates && persona.previousDebates.length > 0) {
    const relevantDebates = persona.previousDebates
      .filter(pd => pd.debate.status === 'PUBLISHED' || pd.debate.status === 'COMPLETED')
      .slice(0, 3) // Limit to 3 most recent

    if (relevantDebates.length > 0) {
      parts.push('\nPrevious Debate Experience:')
      relevantDebates.forEach((pd) => {
        parts.push(`- "${pd.debate.title}" as ${pd.role} - Topic: ${pd.debate.topic}`)
      })
      parts.push('(Consider referencing these past debates when relevant)')
    }
  }

  return parts.join('\n')
}

/**
 * Determine the debate format based on participant count and roles
 */
function getDebateFormat(participants: PersonaProfile[]): string {
  const debaterCount = participants.filter(p => p.role === 'DEBATER' || p.role === 'EXPERT').length
  const moderatorCount = participants.filter(p => p.role === 'MODERATOR' || p.role === 'HOST').length
  const totalCount = participants.length

  if (totalCount === 1) {
    return 'Solo presentation'
  } else if (moderatorCount === 1 && debaterCount === 1) {
    return 'One-on-one dialogue'
  } else if (moderatorCount >= 1 && debaterCount === 2) {
    return 'Two-person debate with moderator'
  } else if (moderatorCount >= 1 && debaterCount <= 3) {
    return 'Small panel discussion'
  } else if (moderatorCount >= 1 && debaterCount > 3) {
    return 'Large panel debate'
  } else if (debaterCount === 2 && moderatorCount === 0) {
    return 'Direct two-person debate'
  } else {
    return 'Multi-participant discussion'
  }
}

/**
 * Build debate context from configuration
 */
function buildDebateContext(debate: DebateData): string {
  const parts: string[] = []

  parts.push(`DEBATE: ${debate.title}`)
  parts.push(`TOPIC: ${debate.topic}`)

  if (debate.description) {
    parts.push(`DESCRIPTION: ${debate.description}`)
  }

  parts.push(`\nFORMAT: ${debate.mode.name}`)
  if (debate.mode.description) {
    parts.push(`Format Description: ${debate.mode.description}`)
  }

  if (debate.formatTemplate) {
    parts.push(`\nTEMPLATE: ${debate.formatTemplate.name} (${debate.formatTemplate.category})`)
    parts.push(`Template Description: ${debate.formatTemplate.description}`)
  }

  if (debate.totalDurationMinutes) {
    parts.push(`\nTOTAL DURATION: ${debate.totalDurationMinutes} minutes`)
  }

  // Add comprehensive participant information
  const debaterCount = debate.participants.filter(p => p.role === 'DEBATER' || p.role === 'EXPERT').length
  const moderatorCount = debate.participants.filter(p => p.role === 'MODERATOR' || p.role === 'HOST').length

  parts.push(`\n=== PARTICIPANT SUMMARY ===`)
  parts.push(`Total Participants: ${debate.participants.length}`)
  parts.push(`- ${debaterCount} ${debaterCount === 1 ? 'Debater' : 'Debaters'}`)
  parts.push(`- ${moderatorCount} ${moderatorCount === 1 ? 'Moderator/Host' : 'Moderators/Hosts'}`)
  parts.push(`Debate Format: ${getDebateFormat(debate.participants)}`)

  parts.push(`\nFULL PARTICIPANT ROSTER:`)
  const sortedParticipants = [...debate.participants].sort(
    (a, b) => (a.speakingOrder || 0) - (b.speakingOrder || 0)
  )
  sortedParticipants.forEach((p, index) => {
    parts.push(`${index + 1}. ${p.name} (${p.role})`)
  })

  return parts.join('\n')
}

/**
 * Parse and structure debate segments
 */
function parseSegments(segmentStructure: any): DebateSegment[] {
  if (!segmentStructure) return []

  // Handle both array and object formats
  const segments = Array.isArray(segmentStructure) ? segmentStructure : []

  return segments.map((segment, index) => ({
    key: segment.key || `segment_${index}`,
    title: segment.title || `Segment ${index + 1}`,
    description: segment.description,
    durationMinutes: segment.durationMinutes || segment.duration || 5,
    participantRoles: segment.participantRoles || segment.roles,
    orderIndex: index
  }))
}

/**
 * Generate content for a single debate segment
 */
async function generateSegmentContent(
  segment: DebateSegment,
  debate: DebateData,
  participants: PersonaProfile[],
  previousSegments: GeneratedSegment[],
  debateId: string
): Promise<string> {
  const startTime = Date.now()

  try {
    // Build context from previous segments
    let previousContext = ''
    if (previousSegments.length > 0) {
      previousContext = '\n\nPREVIOUS SEGMENT SUMMARY:\n'
      // Include last 2 segments for context
      const recentSegments = previousSegments.slice(-2)
      recentSegments.forEach(prev => {
        // Extract key points (first 500 chars)
        const summary = prev.content.substring(0, 500).replace(/\*\*\[.*?\]\*\*:/g, '')
        previousContext += `${prev.title}: ${summary}...\n`
      })
    }

    // Calculate participant counts for awareness
    const totalParticipants = participants.length
    const debaterCount = participants.filter(p => p.role === 'DEBATER' || p.role === 'EXPERT').length
    const moderatorCount = participants.filter(p => p.role === 'MODERATOR' || p.role === 'HOST').length

    // Determine which participants speak in this segment
    const activeParticipants = segment.participantRoles
      ? participants.filter(p => segment.participantRoles!.includes(p.role))
      : participants

    // Build participant contexts
    const participantContexts = activeParticipants.map(p => buildPersonaContext(p)).join('\n\n---\n\n')

    // Build document context if available
    const documentContext = createDocumentPrompt(debate.reviewDocumentName, debate.reviewDocumentContent)

    const systemPrompt = `You are an expert debate moderator and dialogue writer creating authentic, engaging debate content.

CRITICAL PARTICIPANT AWARENESS:
- This debate has EXACTLY ${totalParticipants} total participants
- There ${debaterCount === 1 ? 'is' : 'are'} ${debaterCount} ${debaterCount === 1 ? 'debater' : 'debaters'}
- There ${moderatorCount === 1 ? 'is' : 'are'} ${moderatorCount} ${moderatorCount === 1 ? 'moderator/host' : 'moderators/hosts'}
- Format: ${getDebateFormat(participants)}

ESSENTIAL RULES FOR PARTICIPANT REFERENCES:
${debaterCount === 1 ? `
- This is a ONE-ON-ONE dialogue with only ONE debater
- The host MUST address THE single debater directly
- NO references to "other speakers", "next speaker", or plural participants
- Use singular pronouns and direct address (e.g., "Let's hear your thoughts" not "Let's hear from our speakers")
- Avoid phrases that imply multiple debaters exist
` : `
- This debate has ${debaterCount} debaters
- The host can appropriately reference multiple participants
- Use plural forms when addressing all debaters collectively
`}

Your task is to generate natural dialogue that:
1. Reflects each participant's unique worldview, expertise, and communication style
2. Addresses the debate topic with substantive arguments
3. Shows genuine intellectual engagement between participants
4. Maintains consistency with previous segments
5. Uses natural speech patterns, not overly formal language

CRITICAL REQUIREMENTS:
- Each speaker MUST stay true to their characterized personality and values
- Arguments should reflect their taxonomy characteristics (worldview, ideology, values)
- Reference specific expertise from professional backgrounds when relevant
- Show authentic disagreement and tension where worldviews clash
- Include natural verbal habits from their "Debate Style & Personality" traits
- When participants have previous debate experience, occasionally reference it

SEGMENT TYPE: ${segment.title}
${segment.description ? `SEGMENT FOCUS: ${segment.description}` : ''}
DURATION: ${segment.durationMinutes} minutes (aim for proportional content length)

OUTPUT FORMAT:
Use **[Speaker Name]:** for each speaker
Write natural, conversational dialogue
Include gestures, pauses, or emphasis where appropriate
Vary sentence structure and length`

    const userPrompt = `Generate authentic dialogue for this debate segment.

${buildDebateContext(debate)}

${documentContext ? documentContext : ''}

CRITICAL REMINDER:
${debaterCount === 1 ?
  `⚠️ ONE-ON-ONE FORMAT: The host is speaking with ONLY ONE debater (${participants.find(p => p.role === 'DEBATER')?.name}).
   Do NOT reference multiple speakers or use phrases like "our next speaker" or "let's hear from others".` :
  `This debate has ${debaterCount} debaters participating. The host can reference them collectively or individually as appropriate.`}

CURRENT SEGMENT: ${segment.title}
${previousContext}

ACTIVE PARTICIPANTS IN THIS SEGMENT (${activeParticipants.length} of ${totalParticipants} total):
${participantContexts}

Generate ${segment.durationMinutes} minutes of engaging debate content for "${segment.title}".
Focus on ${segment.description || 'advancing the debate with substantive arguments'}.

Remember:
- Stay true to each persona's characterized values and style
- Create genuine intellectual exchange, not just polite agreement
- Reference previous points when relevant
- Show how different worldviews lead to different conclusions
- MAINTAIN ACCURATE PARTICIPANT COUNT AWARENESS THROUGHOUT`

    // Generate segment content
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.85, // Higher for more creative, varied dialogue
      max_tokens: Math.min(2000, segment.durationMinutes * 400), // Roughly 400 tokens per minute
    })

    const content = response.choices[0]?.message?.content?.trim()
    if (!content) {
      throw new Error('No content returned from OpenAI')
    }

    // Log successful generation
    const executionTime = Date.now() - startTime
    const tokenUsage = response.usage?.total_tokens

    await logAiPrompt({
      functionality: AiPromptFunctionality.DEBATE_SEGMENT,
      parentModel: AiPromptParentModel.DEBATE,
      parentObjectId: debateId,
      parentObjectName: `${debate.title} - ${segment.title}`,
      aiModel: AiModel.GPT_4O,
      prompt: `SYSTEM:\n${systemPrompt}\n\nUSER:\n${userPrompt}`,
      promptExplanation: `Segment: ${segment.title}\nParticipants: ${activeParticipants.map(p => p.name).join(', ')}\nDuration: ${segment.durationMinutes} minutes`,
      result: content,
      status: AiPromptStatus.SUCCESS,
      executionTimeMs: executionTime,
      tokenUsage,
    })

    return content
  } catch (error) {
    console.error(`Error generating segment "${segment.title}":`, error)

    // Log failed generation
    const executionTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await logAiPrompt({
      functionality: AiPromptFunctionality.DEBATE_SEGMENT,
      parentModel: AiPromptParentModel.DEBATE,
      parentObjectId: debateId,
      parentObjectName: `${debate.title} - ${segment.title}`,
      aiModel: AiModel.GPT_4O,
      prompt: 'Failed before prompt generation',
      promptExplanation: 'Segment generation failed',
      result: '',
      status: AiPromptStatus.FAILED,
      executionTimeMs: executionTime,
      errorMessage,
    })

    throw new Error(`Segment generation failed: ${errorMessage}`)
  }
}

/**
 * Main function to generate complete debate content
 */
export async function generateDebateContent(debateData: DebateData): Promise<string> {
  const startTime = Date.now()

  try {
    console.log(`Starting debate generation for: ${debateData.title}`)

    // Parse segment structure
    const segments = parseSegments(debateData.segmentStructure)

    // If no segments defined, create default structure
    const debateSegments = segments.length > 0 ? segments : [
      { key: 'opening', title: 'Opening Statements', durationMinutes: 5, orderIndex: 0 },
      { key: 'main_arguments', title: 'Main Arguments', durationMinutes: 10, orderIndex: 1 },
      { key: 'rebuttals', title: 'Rebuttals and Responses', durationMinutes: 8, orderIndex: 2 },
      { key: 'closing', title: 'Closing Statements', durationMinutes: 5, orderIndex: 3 },
    ]

    // Fetch previous debates for each participant
    const participantsWithHistory = await Promise.all(
      debateData.participants.map(async (participant) => {
        const previousDebates = await prisma.debateParticipant.findMany({
          where: {
            personaId: participant.id,
            debate: {
              id: { not: debateData.id },
              status: { in: ['COMPLETED', 'PUBLISHED'] }
            }
          },
          include: {
            debate: {
              select: { id: true, title: true, topic: true, status: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        })

        return {
          ...participant,
          previousDebates
        }
      })
    )

    // Generate content for each segment
    const generatedSegments: GeneratedSegment[] = []
    let fullTranscript = ''

    // Generate each segment
    for (const segment of debateSegments) {
      console.log(`Generating segment: ${segment.title}`)

      const segmentContent = await generateSegmentContent(
        segment,
        debateData,
        participantsWithHistory,
        generatedSegments,
        debateData.id
      )

      generatedSegments.push({
        segmentKey: segment.key,
        title: segment.title,
        content: segmentContent,
        orderIndex: segment.orderIndex
      })

      // Add to full transcript
      fullTranscript += `## ${segment.title}\n\n`
      fullTranscript += segmentContent
      fullTranscript += '\n\n'

      // Add a small delay between segments to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Add footer
    fullTranscript += '---\n\n'
    fullTranscript += `*End of debate: "${debateData.title}"*\n`

    // Log overall debate generation
    const executionTime = Date.now() - startTime
    const promptExplanation = buildDebatePromptExplanation(
      debateData,
      participantsWithHistory,
      debateSegments
    )

    await logAiPrompt({
      functionality: AiPromptFunctionality.DEBATE_GENERATION,
      parentModel: AiPromptParentModel.DEBATE,
      parentObjectId: debateData.id,
      parentObjectName: debateData.title,
      aiModel: AiModel.GPT_4O,
      prompt: `Generated ${debateSegments.length} segments`,
      promptExplanation,
      result: `Successfully generated ${fullTranscript.length} characters of debate content`,
      status: AiPromptStatus.SUCCESS,
      executionTimeMs: executionTime,
    })

    console.log(`Debate generation completed in ${executionTime}ms`)
    return fullTranscript

  } catch (error) {
    const executionTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('Debate generation failed:', error)

    // Log failed generation
    await logAiPrompt({
      functionality: AiPromptFunctionality.DEBATE_GENERATION,
      parentModel: AiPromptParentModel.DEBATE,
      parentObjectId: debateData.id,
      parentObjectName: debateData.title,
      aiModel: AiModel.GPT_4O,
      prompt: 'Failed during generation',
      promptExplanation: 'Debate generation failed',
      result: '',
      status: AiPromptStatus.FAILED,
      executionTimeMs: executionTime,
      errorMessage,
    })

    throw new Error(`Debate generation failed: ${errorMessage}`)
  }
}

/**
 * Generate debate content with retry logic
 */
export async function generateDebateWithRetry(
  debateData: DebateData,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Debate generation attempt ${attempt}/${maxRetries}`)
      return await generateDebateContent(debateData)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      console.error(`Attempt ${attempt} failed:`, lastError.message)

      if (attempt < maxRetries) {
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.pow(2, attempt) * 1000
        console.log(`Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Failed to generate debate after maximum retries')
}