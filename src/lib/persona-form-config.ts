import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { PersonaFormConfig, FieldConfig } from '@/types/persona-form-config'
import prisma from '@/lib/db/prisma'

let cachedConfig: PersonaFormConfig | null = null

export function loadPersonaFormConfig(): PersonaFormConfig {
  // In development, always reload the config to pick up changes
  // In production, use caching for performance
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (cachedConfig && !isDevelopment) {
    return cachedConfig
  }

  const configPath = path.join(process.cwd(), 'config', 'persona-form.yaml')
  const fileContents = fs.readFileSync(configPath, 'utf8')
  const config = yaml.load(fileContents) as PersonaFormConfig

  if (!isDevelopment) {
    cachedConfig = config
  }

  return config
}

export function getFieldsBySource(config: PersonaFormConfig) {
  const personaFields: string[] = []
  const taxonomyFields: string[] = []

  config.pages.forEach((page) => {
    page.fieldGroups.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.source === 'persona_table') {
          personaFields.push(field.name)
        } else {
          taxonomyFields.push(field.name) // category slugs
        }
      })
    })
  })

  return { personaFields, taxonomyFields }
}

/**
 * Enriches the form configuration with taxonomy data from the database
 * - Fetches categories by slug
 * - Adds category descriptions and terms as options
 */
export async function enrichConfigWithTaxonomyData(
  config: PersonaFormConfig
): Promise<PersonaFormConfig> {
  // Collect all taxonomy field names (category slugs)
  const taxonomySlugs = new Set<string>()

  config.pages.forEach((page) => {
    page.fieldGroups.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.source === 'persona_taxonomy') {
          taxonomySlugs.add(field.name)
        }
      })
    })
  })

  if (taxonomySlugs.size === 0) {
    return config
  }

  // Fetch categories and their terms
  const categories = await prisma.taxonomyCategory.findMany({
    where: {
      slug: { in: Array.from(taxonomySlugs) },
    },
    include: {
      terms: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  // Map categories by slug
  const categoryMap = new Map(categories.map((cat) => [cat.slug, cat]))

  // Deep clone the config to avoid mutations
  const enriched: PersonaFormConfig = JSON.parse(JSON.stringify(config))

  // Enrich the config with taxonomy data
  enriched.pages.forEach((page) => {
    page.fieldGroups.forEach((group) => {
      group.fields.forEach((field) => {
        if (field.source === 'persona_taxonomy') {
          const category = categoryMap.get(field.name)
          if (category) {
            // Override description with category description
            field.description = category.description
            // Add terms as options with descriptions
            field.options = category.terms.map((term) => ({
              value: term.id,
              label: term.name,
              description: term.description,
            }))
            // Add category metadata
            field.categoryId = category.id
            field.categoryFieldType = category.fieldType
          }
        }
      })
    })
  })

  return enriched
}
