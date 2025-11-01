import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { generatePersonaAvatar } from '@/lib/ai/image-generation'
import { generatePersonaDescription, generatePersonaTeaser } from '@/lib/ai/text-generation'
import { processAvatarImage } from '@/lib/utils/image-processing'
import { uploadPersonaAvatar } from '@/lib/storage/r2-client'
import { loadPersonaFormConfig, enrichConfigWithTaxonomyData } from '@/lib/persona-form-config'

// GET /api/personas/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
        _count: {
          select: { debateParticipations: true },
        },
      },
    })

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(persona)
  } catch (error) {
    console.error('Error fetching persona:', error)
    return NextResponse.json(
      { error: 'Failed to fetch persona' },
      { status: 500 }
    )
  }
}

// PUT /api/personas/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { taxonomyTermIds, generateAvatar, generateTeaser, generateDescription, ...personaData } = body

    // Update the persona with taxonomy values in a transaction
    let persona = await prisma.$transaction(async (tx) => {
      // Prepare update data - exclude teaser and description if they will be regenerated
      const updateData: any = {
        name: personaData.name,
        nickname: personaData.nickname || null,
        professionRole: personaData.professionRole || null,
        quirks: personaData.quirks || null,
        status: personaData.status,
      }

      // Only update teaser if not regenerating AND teaser is provided in the data
      // If teaser is undefined (not in form), preserve the existing value
      if (!generateTeaser && personaData.teaser !== undefined) {
        updateData.teaser = personaData.teaser || null
      }

      // Only update description if not regenerating AND description is provided in the data
      // If description is undefined (not in form), preserve the existing value
      if (!generateDescription && personaData.description !== undefined) {
        updateData.description = personaData.description || null
      }

      // Update the persona
      const updatedPersona = await tx.persona.update({
        where: { id },
        data: updateData,
      })

      // Delete existing taxonomy values
      await tx.personaTaxonomyValue.deleteMany({
        where: { personaId: id },
      })

      // Create new taxonomy value associations
      if (taxonomyTermIds && Array.isArray(taxonomyTermIds) && taxonomyTermIds.length > 0) {
        await tx.personaTaxonomyValue.createMany({
          data: taxonomyTermIds.map((termId: string) => ({
            personaId: id,
            termId,
          })),
        })
      }

      // Fetch the complete persona with relations
      return await tx.persona.findUnique({
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
    })

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      )
    }

    // Generate avatar if requested
    if (generateAvatar) {
      try {
        console.log('Regenerating avatar for persona:', persona.id)

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

        console.log('Avatar regenerated and uploaded successfully:', avatarUrl)
      } catch (error) {
        console.error('Avatar generation failed (persona still updated):', error)
        // Don't fail the entire persona update if avatar generation fails
      }
    }

    // Regenerate teaser if requested
    if (generateTeaser) {
      try {
        console.log('Regenerating teaser for persona:', persona.id)

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

        console.log('Teaser regenerated successfully:', teaser)
      } catch (error) {
        console.error('Teaser generation failed (persona still updated):', error)
        // Don't fail the entire persona update if teaser generation fails
      }
    }

    // Regenerate description if requested
    if (generateDescription) {
      try {
        console.log('Regenerating description for persona:', persona.id)

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

        console.log('Description regenerated successfully:', description.substring(0, 100) + '...')
      } catch (error) {
        console.error('Description generation failed (persona still updated):', error)
        // Don't fail the entire persona update if description generation fails
      }
    }

    return NextResponse.json(persona)
  } catch (error: any) {
    console.error('Error updating persona:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update persona' },
      { status: 500 }
    )
  }
}

// DELETE /api/personas/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if persona has participated in any debates
    const persona = await prisma.persona.findUnique({
      where: { id },
      include: {
        _count: {
          select: { debateParticipations: true },
        },
      },
    })

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      )
    }

    // Block deletion if persona has debate participations
    if (persona._count.debateParticipations > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete persona with debate history',
          debateCount: persona._count.debateParticipations,
          canArchive: true,
        },
        { status: 409 } // Conflict
      )
    }

    // Safe to delete - no debate participations
    // PersonaTaxonomyValue entries will cascade delete automatically
    await prisma.persona.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting persona:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete persona' },
      { status: 500 }
    )
  }
}
