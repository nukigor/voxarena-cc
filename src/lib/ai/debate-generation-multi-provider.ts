/**
 * Multi-Provider Debate Generation
 * Enables personas to use different AI providers and models for debate generation
 */

import { AiProvider } from '@/types/ai-providers';
import { getProviderForPersona } from './providers/factory';
import { logAiPrompt, buildDebatePromptExplanation } from '@/lib/ai/prompt-logger';
import { AiPromptFunctionality, AiPromptParentModel, AiModel } from '@/types/ai-prompt-log';
import { AiPromptStatus } from '@prisma/client';
import prisma from '@/lib/db/prisma';
import { createDocumentPrompt } from '@/lib/ai/document-extractor';

// Types for debate generation (same as original)
interface PersonaProfile {
  id: string
  name: string
  nickname?: string | null
  professionRole?: string | null
  quirks?: string | null
  role: string
  speakingOrder?: number | null

  // AI Provider Configuration
  contentProvider: AiProvider | null
  contentModel: string | null
  aiTemperature?: number | null
  aiMaxTokens?: number | null

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
  reviewDocumentContent?: string | null
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

  // Quirks
  if (persona.quirks) {
    parts.push(`\nQuirks and Habits: ${persona.quirks}`)
  }

  // AI Provider info for transparency
  if (persona.contentProvider) {
    parts.push(`\nAI Model: ${persona.contentProvider} - ${persona.contentModel || 'default'}`)
  }

  // Taxonomy values grouped by category
  const taxonomyByCategory = new Map<string, string[]>()

  persona.taxonomyValues.forEach(({ term }) => {
    const category = term.category.name
    if (!taxonomyByCategory.has(category)) {
      taxonomyByCategory.set(category, [])
    }
    taxonomyByCategory.get(category)!.push(`${term.name}: ${term.description}`)
  })

  if (taxonomyByCategory.size > 0) {
    parts.push('\n**Characteristics & Values:**')

    // Sort categories by prompt weight (higher weight = more important)
    const sortedCategories = Array.from(taxonomyByCategory.entries()).sort((a, b) => {
      const weightA = persona.taxonomyValues.find(tv => tv.term.category.name === a[0])?.term.category.promptWeight || 0
      const weightB = persona.taxonomyValues.find(tv => tv.term.category.name === b[0])?.term.category.promptWeight || 0
      return weightB - weightA
    })

    sortedCategories.forEach(([category, terms]) => {
      const weight = persona.taxonomyValues.find(tv => tv.term.category.name === category)?.term.category.promptWeight || 0
      parts.push(`\n${category} (Weight: ${weight}):`)
      terms.forEach(term => parts.push(`- ${term}`))
    })
  }

  // Previous debate experience
  if (persona.previousDebates && persona.previousDebates.length > 0) {
    parts.push('\n**Previous Debate Experience:**')
    persona.previousDebates.slice(0, 3).forEach(prev => {
      parts.push(`- "${prev.debate.title}" (${prev.role})`)
    })
  }

  return parts.join('\n')
}

/**
 * Determine debate format based on participants
 */
function getDebateFormat(participants: PersonaProfile[]): string {
  const debaters = participants.filter(p => p.role === 'DEBATER' || p.role === 'EXPERT')
  const moderators = participants.filter(p => p.role === 'MODERATOR' || p.role === 'HOST')

  if (moderators.length > 0 && debaters.length === 1) {
    return 'One-on-one interview/discussion'
  } else if (moderators.length > 0 && debaters.length === 2) {
    return 'Moderated debate between two participants'
  } else if (moderators.length > 0 && debaters.length > 2) {
    return `Moderated panel discussion with ${debaters.length} participants`
  } else if (debaters.length === 2) {
    return 'Direct debate between two participants'
  } else {
    return `Multi-participant discussion with ${debaters.length} participants`
  }
}

/**
 * Build context about the debate
 */
function buildDebateContext(debate: DebateData): string {
  const parts: string[] = []

  parts.push(`DEBATE TITLE: ${debate.title}`)
  parts.push(`\nTOPIC: ${debate.topic}`)

  if (debate.description) {
    parts.push(`\nDESCRIPTION: ${debate.description}`)
  }

  parts.push(`\nFORMAT TYPE: ${debate.mode.name}`)
  if (debate.mode.description) {
    parts.push(`FORMAT DETAILS: ${debate.mode.description}`)
  }

  if (debate.formatTemplate) {
    parts.push(`\nDEBATE STYLE: ${debate.formatTemplate.name}`)
    parts.push(`STYLE CATEGORY: ${debate.formatTemplate.category}`)
    parts.push(`STYLE DESCRIPTION: ${debate.formatTemplate.description}`)
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
    const provider = p.contentProvider || 'OPENAI'
    const model = p.contentModel || 'default'
    parts.push(`${index + 1}. ${p.name} (${p.role}) - Using ${provider}/${model}`)
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
 * Generate content for a single debate segment using multiple AI providers
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
      const recentSegments = previousSegments.slice(-2)
      recentSegments.forEach(prev => {
        const summary = prev.content.substring(0, 500).replace(/\*\*\[.*?\]\*\*:/g, '')
        previousContext += `${prev.title}: ${summary}...\n`
      })
    }

    // Determine which participants speak in this segment
    const activeParticipants = segment.participantRoles
      ? participants.filter(p => segment.participantRoles!.includes(p.role))
      : participants

    // Generate dialogue for each participant using their specific AI provider
    const dialogueParts: string[] = []

    for (const participant of activeParticipants) {
      // Get the provider and model for this participant
      const { provider, model, temperature, maxTokens } = getProviderForPersona(participant)

      // Build participant-specific context
      const participantContext = buildPersonaContext(participant)
      const documentContext = createDocumentPrompt(debate.reviewDocumentName, debate.reviewDocumentContent)

      const systemPrompt = `You are ${participant.name}, a ${participant.role} in a debate about: ${debate.topic}

Your characteristics:
${participantContext}

Current segment: ${segment.title}
${segment.description ? `Focus: ${segment.description}` : ''}

${previousContext}

Instructions:
- Stay completely in character as ${participant.name}
- Reflect your values, expertise, and communication style
- Engage authentically with the topic and other participants
- Keep responses focused and relevant to the segment
- Be natural and conversational, not overly formal`

      const userPrompt = `${buildDebateContext(debate)}

${documentContext || ''}

Generate your contribution to the "${segment.title}" segment as ${participant.name}.
Make it engaging, authentic to your character, and about ${Math.floor(segment.durationMinutes * 150 / activeParticipants.length)} words.`

      // Generate response using the persona's preferred AI provider
      const response = await provider.generate({
        provider: participant.contentProvider || AiProvider.OPENAI,
        model,
        systemPrompt,
        prompt: userPrompt,
        temperature,
        maxTokens: Math.min(maxTokens, Math.floor(segment.durationMinutes * 400 / activeParticipants.length))
      })

      // Format the response with speaker name
      dialogueParts.push(`**[${participant.name}]:** ${response.content}`)

      // Log the generation
      const executionTime = Date.now() - startTime
      await logAiPrompt({
        functionality: AiPromptFunctionality.DEBATE_SEGMENT,
        parentModel: AiPromptParentModel.DEBATE,
        parentObjectId: debateId,
        parentObjectName: `${debate.title} - ${segment.title} - ${participant.name}`,
        aiModel: model as AiModel,
        prompt: `SYSTEM:\n${systemPrompt}\n\nUSER:\n${userPrompt}`,
        promptExplanation: `Segment: ${segment.title}\nParticipant: ${participant.name} (${participant.role})\nProvider: ${participant.contentProvider || 'OPENAI'}\nModel: ${model}`,
        result: response.content,
        status: AiPromptStatus.SUCCESS,
        executionTimeMs: executionTime,
        tokenUsage: response.usage?.totalTokens,
      })
    }

    // Combine all dialogue parts into a coherent segment
    return dialogueParts.join('\n\n')

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
 * Main function to generate complete debate content with multiple AI providers
 */
export async function generateMultiProviderDebateContent(debateData: DebateData): Promise<string> {
  const startTime = Date.now()

  try {
    console.log(`Starting multi-provider debate generation for: ${debateData.title}`)

    // Log provider usage
    const providerSummary = debateData.participants.map(p => {
      const provider = p.contentProvider || 'OPENAI'
      const model = p.contentModel || 'default'
      return `${p.name}: ${provider}/${model}`
    }).join(', ')
    console.log(`Provider configuration: ${providerSummary}`)

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
              status: { in: ['DRAFT', 'GENERATED', 'PUBLISHED'] }
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

    // Update debate data with history
    const enrichedDebateData = {
      ...debateData,
      participants: participantsWithHistory
    }

    // Generate content for each segment
    const generatedSegments: GeneratedSegment[] = []
    let fullContent = `# ${debateData.title}\n\n`
    fullContent += `## Topic: ${debateData.topic}\n\n`

    if (debateData.description) {
      fullContent += `${debateData.description}\n\n`
    }

    fullContent += `---\n\n`

    for (const segment of debateSegments) {
      console.log(`Generating segment: ${segment.title}`)

      const segmentContent = await generateSegmentContent(
        segment,
        enrichedDebateData,
        participantsWithHistory,
        generatedSegments,
        debateData.id
      )

      generatedSegments.push({
        segmentKey: segment.key,
        title: segment.title,
        content: segmentContent,
        orderIndex: segment.orderIndex || 0
      })

      fullContent += `## ${segment.title}\n\n${segmentContent}\n\n`
    }

    // Log overall generation success
    const totalExecutionTime = Date.now() - startTime
    console.log(`Debate generation completed in ${totalExecutionTime}ms`)

    await logAiPrompt({
      functionality: AiPromptFunctionality.DEBATE_SEGMENT,
      parentModel: AiPromptParentModel.DEBATE,
      parentObjectId: debateData.id,
      parentObjectName: debateData.title,
      aiModel: AiModel.GPT_4O,
      prompt: 'Multi-provider debate generation',
      promptExplanation: buildDebatePromptExplanation(debateData),
      result: `Generated ${generatedSegments.length} segments using multiple AI providers`,
      status: AiPromptStatus.SUCCESS,
      executionTimeMs: totalExecutionTime,
    })

    return fullContent

  } catch (error) {
    console.error('Error in multi-provider debate generation:', error)

    // Log overall generation failure
    const totalExecutionTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await logAiPrompt({
      functionality: AiPromptFunctionality.DEBATE_SEGMENT,
      parentModel: AiPromptParentModel.DEBATE,
      parentObjectId: debateData.id,
      parentObjectName: debateData.title,
      aiModel: AiModel.GPT_4O,
      prompt: 'Multi-provider debate generation failed',
      promptExplanation: 'Generation failed during processing',
      result: '',
      status: AiPromptStatus.FAILED,
      executionTimeMs: totalExecutionTime,
      errorMessage,
    })

    throw error
  }
}