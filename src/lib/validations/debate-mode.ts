import { z } from 'zod'

// Helper to generate slug from text
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-')  // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, '')   // Remove leading/trailing hyphens
}

export const debateModeSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  teaser: z
    .string()
    .max(500, 'Teaser must be less than 500 characters')
    .optional()
    .nullable(),
  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .nullable(),
})

export type DebateModeSchema = z.infer<typeof debateModeSchema>
