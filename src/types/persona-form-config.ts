export type FieldSource = 'persona_table' | 'persona_taxonomy'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'single_select'
  | 'multi_select'
  | 'slider'
  | 'avatar'

export interface FieldValidation {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  custom?: string // For custom validation function names
}

export interface SelectOption {
  value: string
  label: string
  description?: string // For taxonomy terms
}

export interface FieldConfig {
  source: FieldSource
  name: string // table column name or category slug
  label: string
  type: FieldType
  mandatory: boolean
  description?: string
  helperText?: string
  validation?: FieldValidation
  defaultValue?: any
  options?: SelectOption[] // For persona_table select fields or enriched taxonomy fields
  // Enriched fields (added at runtime for taxonomy fields)
  categoryId?: string
  categoryFieldType?: string
}

export interface FieldGroup {
  id: string
  title: string
  description?: string
  fields: FieldConfig[]
}

export interface PageConfig {
  id: string
  title: string
  description?: string
  fieldGroups: FieldGroup[]
}

export interface PersonaFormConfig {
  pages: PageConfig[]
}
