/**
 * AI Provider Types and Configuration
 */

import { AiProvider as PrismaAiProvider, VoiceProvider as PrismaVoiceProvider, ImageProvider as PrismaImageProvider } from '@prisma/client';

// Re-export Prisma enums for convenience
export { PrismaAiProvider as AiProvider, PrismaVoiceProvider as VoiceProvider, PrismaImageProvider as ImageProvider };

/**
 * Available AI models for each provider
 */
export const AI_MODELS = {
  OPENAI: [
    { value: 'gpt-4o', label: 'GPT-4o (Latest)', description: 'Most capable, multimodal' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'High intelligence, vision capable' },
    { value: 'gpt-4', label: 'GPT-4', description: 'High intelligence, slower' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and cost-effective' },
  ],
  ANTHROPIC: [
    { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5 (Latest)', description: 'Most capable, best for complex tasks' },
    { value: 'claude-opus-4-1-20250805', label: 'Claude Opus 4.1', description: 'High intelligence, premium' },
    { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', description: 'Fast and efficient' },
    { value: 'claude-3-7-sonnet-20250219', label: 'Claude Sonnet 3.7', description: 'Previous generation, still capable' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude Haiku 3.5', description: 'Legacy fast model' },
  ],
  GOOGLE: [
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'Latest pro model with advanced reasoning' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', description: 'Latest flash model - fast and efficient' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', description: 'Previous generation flash model' },
  ],
} as const;

/**
 * Voice models/configurations for each voice provider
 */
export const VOICE_MODELS = {
  ELEVENLABS: [
    { value: 'eleven_monolingual_v1', label: 'Monolingual v1', description: 'English only, fast' },
    { value: 'eleven_multilingual_v2', label: 'Multilingual v2', description: 'Multiple languages' },
    { value: 'eleven_turbo_v2', label: 'Turbo v2', description: 'Lowest latency' },
    { value: 'eleven_turbo_v2_5', label: 'Turbo v2.5', description: 'Latest turbo model' },
  ],
} as const;

/**
 * Image generation models for each image provider
 */
export const IMAGE_MODELS = {
  OPENAI: [
    { value: 'dall-e-3', label: 'DALL-E 3', description: 'Latest, highest quality (1024x1024)' },
    { value: 'dall-e-2', label: 'DALL-E 2', description: 'Previous generation (up to 1024x1024)' },
  ],
} as const;

/**
 * Default configurations for each provider
 */
export const DEFAULT_AI_SETTINGS = {
  OPENAI: {
    model: 'gpt-4o',
    temperature: 0.8,
    maxTokens: 2000,
  },
  ANTHROPIC: {
    model: 'claude-sonnet-4-5-20250929',
    temperature: 0.7,
    maxTokens: 2000,
  },
  GOOGLE: {
    model: 'gemini-2.5-pro',
    temperature: 0.8,
    maxTokens: 2000,
  },
} as const;

export const DEFAULT_VOICE_SETTINGS = {
  ELEVENLABS: {
    model: 'eleven_multilingual_v2',
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.5,
    useSpeakerBoost: true,
  },
} as const;

/**
 * Provider display names
 */
export const PROVIDER_LABELS = {
  AI: {
    OPENAI: 'OpenAI',
    ANTHROPIC: 'Anthropic (Claude)',
    GOOGLE: 'Google (Gemini)',
  },
  VOICE: {
    ELEVENLABS: 'ElevenLabs',
  },
  IMAGE: {
    OPENAI: 'OpenAI (DALL-E)',
  },
} as const;

/**
 * AI generation request structure
 */
export interface AiGenerationRequest {
  provider: PrismaAiProvider;
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  messages?: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

/**
 * AI generation response structure
 */
export interface AiGenerationResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: PrismaAiProvider;
}

/**
 * Voice generation request structure
 */
export interface VoiceGenerationRequest {
  provider: PrismaVoiceProvider;
  model?: string;
  text: string;
  voiceId?: string;
  settings?: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
}

/**
 * Voice generation response structure
 */
export interface VoiceGenerationResponse {
  audioBuffer: Buffer;
  duration?: number;
  provider: PrismaVoiceProvider;
}

/**
 * Persona AI configuration
 */
export interface PersonaAiConfig {
  contentProvider: PrismaAiProvider;
  contentModel: string;
  imageProvider: PrismaImageProvider;
  imageModel: string;
  voiceProvider: PrismaVoiceProvider;
  voiceModel?: string;
  aiTemperature?: number;
  aiMaxTokens?: number;
}