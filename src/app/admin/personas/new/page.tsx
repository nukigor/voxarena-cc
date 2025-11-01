import { loadPersonaFormConfig, enrichConfigWithTaxonomyData } from '@/lib/persona-form-config'
import { PersonaForm } from '@/components/personas/persona-form'

export default async function NewPersonaPage() {
  const config = loadPersonaFormConfig()
  const enrichedConfig = await enrichConfigWithTaxonomyData(config)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Create New Persona
        </h1>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Fill in the information across multiple steps to create a comprehensive persona
        </p>
      </div>

      <PersonaForm config={enrichedConfig} />
    </div>
  )
}
