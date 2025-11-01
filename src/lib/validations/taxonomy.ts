import { z } from 'zod'
import { FieldType } from '@prisma/client'

// Helper to generate slug from text
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-')  // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, '')   // Remove leading/trailing hyphens
}

export const taxonomyCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable(),
  fieldType: z.nativeEnum(FieldType),
  isMandatory: z.boolean().default(false),
  promptWeight: z
    .number()
    .min(1, 'Prompt weight must be at least 1')
    .max(10, 'Prompt weight must be at most 10')
    .default(5),
  sortOrder: z
    .number()
    .min(0, 'Sort order must be at least 0')
    .default(0),
})

export const taxonomyTermSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable(),
  sortOrder: z
    .number()
    .min(0, 'Sort order must be at least 0')
    .default(0),
  categoryId: z.string().min(1, 'Category is required'),
})

export type TaxonomyCategorySchema = z.infer<typeof taxonomyCategorySchema>
export type TaxonomyTermSchema = z.infer<typeof taxonomyTermSchema>