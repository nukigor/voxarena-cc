import { notFound } from 'next/navigation'
import { loadPersonaFormConfig, enrichConfigWithTaxonomyData } from '@/lib/persona-form-config'
import { PersonaForm } from '@/components/personas/persona-form'
import prisma from '@/lib/db/prisma'

export default async function EditPersonaPage({
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
      },
    },
  })

  if (!persona) {
    notFound()
  }

  const config = loadPersonaFormConfig()
  const enrichedConfig = await enrichConfigWithTaxonomyData(config)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Edit Persona: {persona.name}
        </h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Update persona information across multiple steps
        </p>
      </div>

      <PersonaForm config={enrichedConfig} persona={persona} />
    </div>
  )
}
