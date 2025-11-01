import { notFound } from 'next/navigation'
import prisma from '@/lib/db/prisma'
import { PersonaDetailView } from '@/components/personas/persona-detail-view'


export default async function PersonaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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
        orderBy: {
          term: {
            category: {
              sortOrder: 'asc',
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
    notFound()
  }

  // Fetch real debate participations for this persona
  const debateParticipations = await prisma.debateParticipant.findMany({
    where: {
      personaId: id,
    },
    include: {
      debate: {
        include: {
          _count: {
            select: { participants: true },
          },
          formatTemplate: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: {
      debate: {
        createdAt: 'desc',
      },
    },
  })

  // Group taxonomy values by category
  const taxonomyByCategory = persona.taxonomyValues.reduce((acc, tv) => {
    const categoryName = tv.term.category.name
    if (!acc[categoryName]) {
      acc[categoryName] = {
        category: tv.term.category,
        terms: [],
      }
    }
    acc[categoryName].terms.push(tv.term)
    return acc
  }, {} as Record<string, { category: any; terms: any[] }>)

  // Transform debate data for the timeline
  const debateTimeline = debateParticipations.map((participation) => ({
    id: participation.debate.id,
    title: participation.debate.title,
    format: participation.debate.formatTemplate?.name || 'Custom',
    role: participation.role,
    date: participation.debate.createdAt.toISOString().split('T')[0],
    dateTime: participation.debate.createdAt.toISOString(),
    status: participation.debate.status,
    participantCount: participation.debate._count.participants,
  }))

  // Calculate stats from real data
  const totalDebates = debateParticipations.length
  const debaterCount = debateParticipations.filter((p) => p.role === 'DEBATER').length
  const moderatorCount = debateParticipations.filter((p) => p.role === 'MODERATOR' || p.role === 'HOST').length

  return (
    <PersonaDetailView
      persona={persona}
      taxonomyByCategory={taxonomyByCategory}
      debateTimeline={debateTimeline}
      totalDebates={totalDebates}
      debaterCount={debaterCount}
      moderatorCount={moderatorCount}
    />
  )
}
