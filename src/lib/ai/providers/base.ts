/**
 * Base AI Provider Interface
 */

import { AiGenerationRequest, AiGenerationResponse } from '@/types/ai-providers';
import { PersonaWithTaxonomy } from '../prompt-builder';

/**
 * Base interface that all AI providers must implement
 */
export interface IAiProvider {
  /**
   * Generate content based on a simple prompt
   */
  generate(request: AiGenerationRequest): Promise<AiGenerationResponse>;

  /**
   * Generate debate content for a persona
   */
  generateDebateResponse(
    persona: PersonaWithTaxonomy,
    context: {
      topic: string;
      format: string;
      previousMessages: { role: string; content: string; speaker?: string }[];
    },
    model?: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<string>;

  /**
   * Generate a persona avatar description/image
   */
  generateAvatar(
    persona: PersonaWithTaxonomy,
    model?: string
  ): Promise<string>;

  /**
   * Generate a persona teaser text
   */
  generateTeaser(
    persona: PersonaWithTaxonomy,
    model?: string
  ): Promise<string>;

  /**
   * Generate a persona description
   */
  generateDescription(
    persona: PersonaWithTaxonomy,
    model?: string
  ): Promise<string>;

  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean;

  /**
   * Get the provider name
   */
  getProviderName(): string;
}

/**
 * Base abstract class with common functionality
 */
export abstract class BaseAiProvider implements IAiProvider {
  protected apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  abstract generate(request: AiGenerationRequest): Promise<AiGenerationResponse>;

  abstract generateDebateResponse(
    persona: PersonaWithTaxonomy,
    context: {
      topic: string;
      format: string;
      previousMessages: { role: string; content: string; speaker?: string }[];
    },
    model?: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<string>;

  abstract generateAvatar(
    persona: PersonaWithTaxonomy,
    model?: string
  ): Promise<string>;

  abstract generateTeaser(
    persona: PersonaWithTaxonomy,
    model?: string
  ): Promise<string>;

  abstract generateDescription(
    persona: PersonaWithTaxonomy,
    model?: string
  ): Promise<string>;

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  abstract getProviderName(): string;

  /**
   * Common error handling
   */
  protected handleError(error: any, operation: string): never {
    const message = error?.message || 'Unknown error';
    const providerName = this.getProviderName();

    console.error(`[${providerName}] Error during ${operation}:`, error);

    if (error?.response?.status === 401) {
      throw new Error(`${providerName} API key is invalid or missing`);
    }

    if (error?.response?.status === 429) {
      throw new Error(`${providerName} rate limit exceeded. Please try again later.`);
    }

    if (error?.response?.status === 400) {
      throw new Error(`Invalid request to ${providerName}: ${message}`);
    }

    throw new Error(`${providerName} ${operation} failed: ${message}`);
  }

  /**
   * Build a consistent system prompt for persona-based generation
   */
  protected buildSystemPrompt(
    persona: PersonaWithTaxonomy,
    taskDescription: string
  ): string {
    const taxonomyContext = persona.taxonomyValues
      .map(({ term }) => `- ${term.category.name}: ${term.name} - ${term.description}`)
      .join('\n');

    return `You are helping to generate content for a persona with the following characteristics:

Name: ${persona.name}
${persona.nickname ? `Nickname: ${persona.nickname}` : ''}
${persona.professionRole ? `Profession/Role: ${persona.professionRole}` : ''}
${persona.quirks ? `Quirks: ${persona.quirks}` : ''}

Taxonomy Characteristics:
${taxonomyContext}

Task: ${taskDescription}

Generate content that reflects this persona's unique perspective, values, and communication style.`;
  }
}