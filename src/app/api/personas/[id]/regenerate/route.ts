import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { generatePersonaAvatar } from '@/lib/ai/image-generation'
import { generatePersonaDescription, generatePersonaTeaser } from '@/lib/ai/text-generation'
import { processAvatarImage } from '@/lib/utils/image-processing'
import { uploadPersonaAvatar } from '@/lib/storage/r2-client'
import { loadPersonaFormConfig, enrichConfigWithTaxonomyData } from '@/lib/persona-form-config'

// POST /api/personas/:id/regenerate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch persona with taxonomy values
    const persona = await prisma.persona.findUnique({
      where: { id },
      include: {
        taxonomyValues: {
          include: {
            term: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      )
    }

    // Prepare persona data for AI generation
    const personaData = {
      name: persona.name,
      nickname: persona.nickname,
      professionRole: persona.professionRole,
      quirks: persona.quirks,
    }

    // Load and enrich config with taxonomy data
    const config = loadPersonaFormConfig()
    const enrichedConfig = await enrichConfigWithTaxonomyData(config)

    // Build taxonomy term IDs map for avatar prompt generation
    const taxonomyTermIdsMap: Record<string, string | string[]> = {}
    persona.taxonomyValues.forEach((tv) => {
      const categorySlug = tv.term.category.slug
      if (!taxonomyTermIdsMap[categorySlug]) {
        taxonomyTermIdsMap[categorySlug] = []
      }
      if (Array.isArray(taxonomyTermIdsMap[categorySlug])) {
        (taxonomyTermIdsMap[categorySlug] as string[]).push(tv.term.id)
      }
    })

    // Generate avatar
    console.log('Regenerating avatar for persona:', persona.id)
    const imageBuffer = await generatePersonaAvatar(
      personaData,
      taxonomyTermIdsMap,
      enrichedConfig,
      persona.id,
      persona.name,
      persona.imageProvider || 'OPENAI',
      persona.imageModel || 'dall-e-3'
    )

    // Process image (resize and optimize)
    const processedImage = await processAvatarImage(imageBuffer)

    // Upload to R2
    const avatarUrl = await uploadPersonaAvatar(persona.id, processedImage)
    console.log('Avatar regenerated and uploaded successfully:', avatarUrl)

    // Generate teaser
    console.log('Regenerating teaser for persona:', persona.id)
    const teaser = await generatePersonaTeaser(
      personaData,
      persona.taxonomyValues,
      persona.id,
      persona.name,
      persona.contentProvider || 'OPENAI',
      persona.contentModel || 'gpt-4o',
      persona.aiTemperature || 0.5,
      2500  // Optimized for Gemini 2.x: ~1800 thinking tokens + ~700 output buffer
    )
    console.log('Teaser regenerated successfully:', teaser)

    // Generate description
    console.log('Regenerating description for persona:', persona.id)
    const description = await generatePersonaDescription(
      personaData,
      persona.taxonomyValues,
      persona.id,
      persona.name,
      persona.contentProvider || 'OPENAI',
      persona.contentModel || 'gpt-4o',
      persona.aiTemperature || 0.8,
      Math.max(persona.aiMaxTokens || 500, 3000)  // Use persona setting or 3000 minimum for Gemini 2.x thinking tokens
    )
    console.log('Description regenerated successfully:', description.substring(0, 100) + '...')

    // Update persona with all regenerated content
    const updatedPersona = await prisma.persona.update({
      where: { id },
      data: {
        avatarUrl,
        teaser,
        description,
      },
      include: {
        taxonomyValues: {
          include: {
            term: {
              include: {
                category: true,
              },
            },
          },
        },
        _count: {
          select: { debateParticipations: true },
        },
      },
    })

    return NextResponse.json(updatedPersona)
  } catch (error: any) {
    console.error('Error regenerating AI content:', error)

    // Return more specific error messages
    if (error.message?.includes('OpenAI')) {
      return NextResponse.json(
        { error: 'AI service error. Please try again later.' },
        { status: 503 }
      )
    }

    if (error.message?.includes('R2') || error.message?.includes('upload')) {
      return NextResponse.json(
        { error: 'Image upload failed. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to regenerate AI content' },
      { status: 500 }
    )
  }
}
