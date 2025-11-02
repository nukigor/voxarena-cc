/**
 * AI Provider Factory
 * Creates and manages AI provider instances based on configuration
 */

import { AiProvider } from '@/types/ai-providers';
import { IAiProvider } from './base';
import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';
import { GoogleProvider } from './google-provider';

// Cache for provider instances to avoid recreating them
const providerCache = new Map<string, IAiProvider>();

/**
 * Get or create an AI provider instance
 */
export function getAiProvider(
  provider: AiProvider,
  apiKey?: string
): IAiProvider {
  // Create cache key based on provider and API key
  const cacheKey = `${provider}-${apiKey || 'default'}`;

  // Check cache first
  if (providerCache.has(cacheKey)) {
    return providerCache.get(cacheKey)!;
  }

  // Create new provider instance
  let providerInstance: IAiProvider;

  switch (provider) {
    case AiProvider.OPENAI:
      providerInstance = new OpenAIProvider(apiKey);
      break;

    case AiProvider.ANTHROPIC:
      providerInstance = new AnthropicProvider(apiKey);
      break;

    case AiProvider.GOOGLE:
      providerInstance = new GoogleProvider(apiKey);
      break;

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }

  // Verify the provider is configured
  if (!providerInstance.isConfigured()) {
    throw new Error(
      `${providerInstance.getProviderName()} is not properly configured. Please check the API key.`
    );
  }

  // Cache the instance
  providerCache.set(cacheKey, providerInstance);

  return providerInstance;
}

/**
 * Clear the provider cache (useful for testing or when API keys change)
 */
export function clearProviderCache(): void {
  providerCache.clear();
}

/**
 * Get a provider for a persona's AI configuration
 */
export function getProviderForPersona(persona: {
  contentProvider: AiProvider | null;
  contentModel: string | null;
  aiTemperature?: number | null;
  aiMaxTokens?: number | null;
}): {
  provider: IAiProvider;
  model: string;
  temperature: number;
  maxTokens: number;
} {
  const provider = persona.contentProvider || AiProvider.OPENAI;
  const model = persona.contentModel || getDefaultModel(provider);
  const temperature = persona.aiTemperature || 0.8;
  const maxTokens = persona.aiMaxTokens || 2000;

  return {
    provider: getAiProvider(provider),
    model,
    temperature,
    maxTokens,
  };
}

/**
 * Get the default model for a provider
 */
function getDefaultModel(provider: AiProvider): string {
  switch (provider) {
    case AiProvider.OPENAI:
      return 'gpt-4o';
    case AiProvider.ANTHROPIC:
      return 'claude-3-5-sonnet-20241022';
    case AiProvider.GOOGLE:
      return 'gemini-1.5-pro';
    default:
      return 'gpt-4o';
  }
}

/**
 * Check if all required API keys are configured
 */
export function checkProviderConfiguration(): {
  openai: boolean;
  anthropic: boolean;
  google: boolean;
  elevenlabs: boolean;
} {
  return {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    google: !!process.env.GOOGLE_AI_API_KEY,
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
  };
}

/**
 * Get available providers based on API key configuration
 */
export function getAvailableProviders(): AiProvider[] {
  const available: AiProvider[] = [];
  const config = checkProviderConfiguration();

  if (config.openai) available.push(AiProvider.OPENAI);
  if (config.anthropic) available.push(AiProvider.ANTHROPIC);
  if (config.google) available.push(AiProvider.GOOGLE);

  return available;
}