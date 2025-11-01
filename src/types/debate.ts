import {
  Debate,
  DebateStatus,
  DebateMode,
  ParticipantRole,
  FormatTemplate,
  FormatCategory,
  DebateSegment,
} from "@prisma/client";
import { PersonaWithRelations } from "./persona";

// Re-export Prisma types for convenience
export { DebateStatus, DebateMode, ParticipantRole, FormatCategory };

// ============================================================================
// Segment Structure Types
// ============================================================================

export interface SegmentDefinition {
  key: string;
  title: string;
  description: string;
  durationMinutes: number;
  required: boolean;
  allowsReordering: boolean;
}

export type SegmentStructure = SegmentDefinition[];

// ============================================================================
// Format Template Types
// ============================================================================

export type FormatTemplateWithRelations = FormatTemplate & {
  _count?: {
    debates: number;
  };
};

export interface FormatTemplateFormData {
  name: string;
  description: string;
  category: FormatCategory;
  mode: DebateMode;
  minParticipants: number;
  maxParticipants: number;
  requiresModerator: boolean;
  durationMinutes: number;
  flexibleTiming: boolean;
  segmentStructure: SegmentStructure;
  bestFor?: string;
  personaRecommendations?: string;
}

export interface FormatTemplateCreateInput extends FormatTemplateFormData {
  slug: string;
  isPreset?: boolean;
  createdBy?: string;
}

// ============================================================================
// Debate Types
// ============================================================================

export interface DebateParticipantWithPersona {
  id: string;
  role: ParticipantRole;
  speakingOrder: number | null;
  persona: PersonaWithRelations;
}

export type DebateWithRelations = Debate & {
  debateMode: {
    id: string;
    name: string;
    slug: string;
    teaser: string | null;
  };
  formatTemplate?: FormatTemplateWithRelations | null;
  participants: DebateParticipantWithPersona[];
  segments?: DebateSegment[];
  analytics?: {
    viewCount: number;
    playCount: number;
    completionCount: number;
    avgCompletionRate: number;
  } | null;
};

export interface DebateFormData {
  title: string;
  topic: string;
  modeId: string;
  formatTemplateId?: string;
  description?: string;
  segmentStructure?: SegmentStructure; // Custom segment structure (overrides template)
  totalDurationMinutes?: number;
  flexibleTiming: boolean;
  participants: {
    personaId: string;
    role: ParticipantRole;
    speakingOrder?: number;
  }[];
}

export interface DebateCreateInput {
  title: string;
  slug: string;
  topic: string;
  modeId: string;
  formatTemplateId?: string;
  description?: string;
  segmentStructure?: SegmentStructure;
  totalDurationMinutes?: number;
  flexibleTiming: boolean;
  participants: {
    personaId: string;
    role: ParticipantRole;
    speakingOrder?: number;
  }[];
  createdBy?: string;
}

export interface DebateUpdateInput {
  title?: string;
  topic?: string;
  description?: string;
  segmentStructure?: SegmentStructure;
  totalDurationMinutes?: number;
  flexibleTiming?: boolean;
  status?: DebateStatus;
  errorMessage?: string;
}

export interface DebateGenerationResult {
  debateId: string;
  transcript?: string;
  audioUrl?: string;
  duration?: number;
  segments: {
    segmentKey: string;
    title: string;
    content: string;
    audioUrl?: string;
    duration?: number;
  }[];
}

// ============================================================================
// Debate Builder Wizard Types
// ============================================================================

export interface DebateBuilderStep1Data {
  formatTemplateId: string;
}

export interface DebateBuilderStep2Data {
  title: string;
  topic: string;
  description?: string;
}

export interface DebateBuilderStep3Data {
  modeId: string;
  segments: SegmentStructure;
  flexibleTiming: boolean;
  // Custom format configuration (only used when no template selected)
  minParticipants?: number;
  maxParticipants?: number;
  requiresModerator?: boolean;
  totalDurationMinutes?: number;
}

export interface DebateBuilderStep4Data {
  participants: {
    personaId: string;
    role: ParticipantRole;
    speakingOrder?: number;
  }[];
}

export interface DebateBuilderStep5Data {
  // Review step - no additional data
}

export interface DebateBuilderData {
  step1?: DebateBuilderStep1Data;
  step2?: DebateBuilderStep2Data;
  step3?: DebateBuilderStep3Data;
  step4?: DebateBuilderStep4Data;
  step5?: DebateBuilderStep5Data;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface DebateListResponse {
  debates: DebateWithRelations[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface DebateFilters {
  status?: DebateStatus;
  modeId?: string;
  formatTemplateId?: string;
  search?: string;
}

export interface FormatTemplateListResponse {
  templates: FormatTemplateWithRelations[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface FormatTemplateFilters {
  category?: FormatCategory;
  mode?: DebateMode;
  isPreset?: boolean;
  search?: string;
}

// ============================================================================
// Format Drift Detection Types
// ============================================================================

export type DriftChangeType = 'added' | 'removed' | 'modified';

export interface DriftChange {
  type: DriftChangeType;
  segmentKey: string;
  field?: 'title' | 'description' | 'durationMinutes' | 'required' | 'allowsReordering';
  oldValue?: any;
  newValue?: any;
  description: string; // Human-readable description
}

export interface FormatDriftAnalysis {
  isDrifted: boolean;
  driftPercentage: number; // 0-100, where 100 = perfect match
  hasTemplate: boolean;
  templateName?: string;
  changes: DriftChange[];
  addedSegments: SegmentDefinition[];
  removedSegments: SegmentDefinition[];
  modifiedSegments: SegmentDefinition[];
}
