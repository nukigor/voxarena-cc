import { AiPromptLog, AiPromptStatus } from '@prisma/client'

// Re-export Prisma types
export type { AiPromptLog, AiPromptStatus }

// Functionality types (what the AI was used for)
export enum AiPromptFunctionality {
  PERSONA_AVATAR = 'Persona Avatar Generation',
  PERSONA_TEASER = 'Persona Teaser Generation',
  PERSONA_DESCRIPTION = 'Persona Description Generation',
  // Future functionalities
  DEBATE_GENERATION = 'Debate Generation',
  DEBATE_SEGMENT = 'Debate Segment Generation',
}

// Parent model types
export enum AiPromptParentModel {
  PERSONA = 'Persona',
  DEBATE = 'Debate',
  MODE = 'Mode',
  FORMAT_TEMPLATE = 'FormatTemplate',
}

// AI Model identifiers
export enum AiModel {
  GPT_4O = 'gpt-4o',
  GPT_4O_MINI = 'gpt-4o-mini',
  DALL_E_3 = 'dall-e-3',
}

// Extended type with computed properties
export interface AiPromptLogWithMetadata extends AiPromptLog {
  // Add any computed fields here if needed in the future
}

// Filter/query parameters for API
export interface AiPromptLogQueryParams {
  page?: number
  pageSize?: number
  functionality?: string
  parentModel?: string
  status?: AiPromptStatus
  search?: string
  sortBy?: 'createdAt' | 'executionTimeMs' | 'tokenUsage' | 'estimatedCost'
  sortOrder?: 'asc' | 'desc'
}

// API response type
export interface AiPromptLogsResponse {
  logs: AiPromptLog[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  filters: {
    functionalities: string[]
    parentModels: string[]
  }
}

// Helper type for creating a new log entry
export type CreateAiPromptLogInput = Omit<AiPromptLog, 'id' | 'createdAt' | 'createdBy'>
