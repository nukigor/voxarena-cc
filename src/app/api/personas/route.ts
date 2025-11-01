import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { generatePersonaAvatar } from '@/lib/ai/image-generation'
import { generatePersonaDescription, generatePersonaTeaser } from '@/lib/ai/text-generation'
import { processAvatarImage } from '@/lib/utils/image-processing'
import { uploadPersonaAvatar } from '@/lib/storage/r2-client'
import { loadPersonaFormConfig, enrichConfigWithTaxonomyData } from '@/lib/persona-form-config'

// GET /api/personas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || undefined

    const skip = (page - 1) * pageSize

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { nickname: { contains: search, mode: 'insensitive' as const } },
        { professionRole: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    if (status) {
      where.status = status
    }

    const [personas, total] = await Promise.all([
      prisma.persona.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.persona.count({ where }),
    ])

    return NextResponse.json({
      personas,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching personas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    )
  }
}

// POST /api/personas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taxonomyTermIds, generateAvatar, generateTeaser, generateDescription, ...personaData } = body

    // Create the persona with taxonomy values in a transaction
    let persona = await prisma.$transaction(async (tx) => {
      // Create the persona
      const newPersona = await tx.persona.create({
        data: {
          name: personaData.name,
          nickname: personaData.nickname || null,
          teaser: personaData.teaser || null,
          description: personaData.description || null,
          professionRole: personaData.professionRole || null,
          quirks: personaData.quirks || null,
          status: personaData.status || 'DRAFT',
        },
      })

      // Create taxonomy value associations
      if (taxonomyTermIds && Array.isArray(taxonomyTermIds) && taxonomyTermIds.length > 0) {
        await tx.personaTaxonomyValue.createMany({
          data: taxonomyTermIds.map((termId: string) => ({
            personaId: newPersona.id,
            termId,
          })),
        })
      }

      // Fetch the complete persona with relations
      return await tx.persona.findUnique({
        where: { id: newPersona.id },
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
    })

    if (!persona) {
      throw new Error('Failed to create persona')
    }

    // Generate avatar if requested
    if (generateAvatar) {
      try {
        console.log('Generating avatar for persona:', persona.id)

        // Load and enrich config with taxonomy data
        const config = loadPersonaFormConfig()
        const enrichedConfig = await enrichConfigWithTaxonomyData(config)

        // Build taxonomy term IDs map for prompt generation
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

        // Generate avatar image
        const imageBuffer = await generatePersonaAvatar(
          personaData,
          taxonomyTermIdsMap,
          enrichedConfig,
          persona.id,
          persona.name
        )

        // Process image (resize and optimize)
        const processedImage = await processAvatarImage(imageBuffer)

        // Upload to R2
        const avatarUrl = await uploadPersonaAvatar(persona.id, processedImage)

        // Update persona with avatar URL
        persona = await prisma.persona.update({
          where: { id: persona.id },
          data: { avatarUrl },
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

        console.log('Avatar generated and uploaded successfully:', avatarUrl)
      } catch (error) {
        console.error('Avatar generation failed (persona still created):', error)
        // Don't fail the entire persona creation if avatar generation fails
      }
    }

    // Generate teaser if requested
    if (generateTeaser) {
      try {
        console.log('Generating teaser for persona:', persona.id)

        // Generate teaser using taxonomy values
        const teaser = await generatePersonaTeaser(
          personaData,
          persona.taxonomyValues,
          persona.id,
          persona.name
        )

        // Update persona with generated teaser
        persona = await prisma.persona.update({
          where: { id: persona.id },
          data: { teaser },
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

        console.log('Teaser generated successfully:', teaser)
      } catch (error) {
        console.error('Teaser generation failed (persona still created):', error)
        // Don't fail the entire persona creation if teaser generation fails
      }
    }

    // Generate description if requested
    if (generateDescription) {
      try {
        console.log('Generating description for persona:', persona.id)

        // Generate description using taxonomy values
        const description = await generatePersonaDescription(
          personaData,
          persona.taxonomyValues,
          persona.id,
          persona.name
        )

        // Update persona with generated description
        persona = await prisma.persona.update({
          where: { id: persona.id },
          data: { description },
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

        console.log('Description generated successfully:', description.substring(0, 100) + '...')
      } catch (error) {
        console.error('Description generation failed (persona still created):', error)
        // Don't fail the entire persona creation if description generation fails
      }
    }

    return NextResponse.json(persona, { status: 201 })
  } catch (error: any) {
    console.error('Error creating persona:', error)

    return NextResponse.json(
      { error: 'Failed to create persona' },
      { status: 500 }
    )
  }
}
