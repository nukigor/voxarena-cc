/**
 * API endpoint to fetch available models from AI providers
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiProvider } from '@/types/ai-providers';

interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  contextWindow?: number;
}

/**
 * Fetch available models from OpenAI
 */
async function fetchOpenAIModels(): Promise<ModelInfo[]> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.models.list();

    // Filter for chat models (gpt-*) and sort by ID
    const chatModels = response.data
      .filter(model => model.id.startsWith('gpt-'))
      .sort((a, b) => b.id.localeCompare(a.id)); // Newest first

    return chatModels.map(model => ({
      id: model.id,
      name: formatModelName(model.id),
      description: getModelDescription(model.id),
    }));
  } catch (error) {
    console.error('Error fetching OpenAI models:', error);
    // Return fallback models if API call fails
    return [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable, multimodal' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High intelligence, vision capable' },
      { id: 'gpt-4', name: 'GPT-4', description: 'High intelligence' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective' },
    ];
  }
}

/**
 * Fetch available models from Anthropic
 * Note: Anthropic doesn't have a public list endpoint, so we use a curated list
 */
async function fetchAnthropicModels(): Promise<ModelInfo[]> {
  try {
    // Anthropic doesn't provide a list endpoint, so we return known models
    // Updated models as of 2025
    return [
      {
        id: 'claude-sonnet-4-5-20250929',
        name: 'Claude Sonnet 4.5 (Latest)',
        description: 'Most capable model, best for complex tasks',
        contextWindow: 200000,
      },
      {
        id: 'claude-opus-4-1-20250805',
        name: 'Claude Opus 4.1',
        description: 'High intelligence, premium quality',
        contextWindow: 200000,
      },
      {
        id: 'claude-haiku-4-5-20251001',
        name: 'Claude Haiku 4.5',
        description: 'Fast and efficient',
        contextWindow: 200000,
      },
      {
        id: 'claude-3-7-sonnet-20250219',
        name: 'Claude Sonnet 3.7',
        description: 'Previous generation, still capable',
        contextWindow: 200000,
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude Haiku 3.5',
        description: 'Legacy fast model',
        contextWindow: 200000,
      },
    ];
  } catch (error) {
    console.error('Error fetching Anthropic models:', error);
    return [];
  }
}

/**
 * Fetch available image models from OpenAI
 */
async function fetchOpenAIImageModels(): Promise<ModelInfo[]> {
  try {
    // DALL-E models don't have a list endpoint, return known models
    return [
      {
        id: 'dall-e-3',
        name: 'DALL-E 3',
        description: 'Latest, highest quality (1024x1024, 1024x1792, 1792x1024)',
      },
      {
        id: 'dall-e-2',
        name: 'DALL-E 2',
        description: 'Previous generation (256x256 to 1024x1024)',
      },
    ];
  } catch (error) {
    console.error('Error fetching OpenAI image models:', error);
    return [];
  }
}

/**
 * Fetch available models from Google
 */
async function fetchGoogleModels(): Promise<ModelInfo[]> {
  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('Google AI API key not configured');
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

    // Google doesn't provide a simple list endpoint in the SDK
    // Return known Gemini 2.x models (as of 2025)
    return [
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'Latest pro model with advanced reasoning (2M tokens)',
        contextWindow: 2000000,
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Latest flash model - fast and efficient (1M tokens)',
        contextWindow: 1000000,
      },
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'Previous generation flash model (1M tokens)',
        contextWindow: 1000000,
      },
    ];
  } catch (error) {
    console.error('Error fetching Google models:', error);
    return [];
  }
}

/**
 * Format model ID into a readable name
 */
function formatModelName(modelId: string): string {
  // Convert gpt-4-0125-preview to GPT-4 (0125)
  // Convert gpt-3.5-turbo-0125 to GPT-3.5 Turbo (0125)
  const parts = modelId.split('-');

  if (modelId.startsWith('gpt-4o')) {
    return 'GPT-4o' + (parts.length > 2 ? ` (${parts.slice(2).join('-')})` : '');
  } else if (modelId.startsWith('gpt-4')) {
    return 'GPT-4' + (parts.length > 2 ? ` ${parts.slice(2).join(' ')}` : '');
  } else if (modelId.startsWith('gpt-3.5')) {
    return 'GPT-3.5 Turbo' + (parts.length > 3 ? ` (${parts.slice(3).join('-')})` : '');
  }

  return modelId;
}

/**
 * Get description for common models
 */
function getModelDescription(modelId: string): string {
  if (modelId.includes('gpt-4o')) {
    return 'Most capable, multimodal';
  } else if (modelId.includes('gpt-4-turbo')) {
    return 'High intelligence, vision capable';
  } else if (modelId.includes('gpt-4')) {
    return 'High intelligence';
  } else if (modelId.includes('gpt-3.5-turbo')) {
    return 'Fast and cost-effective';
  }
  return '';
}

/**
 * GET /api/ai-providers/models?provider=OPENAI&type=text|image
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const provider = searchParams.get('provider') as AiProvider | null;
    const type = (searchParams.get('type') || 'text') as 'text' | 'image';

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider parameter is required' },
        { status: 400 }
      );
    }

    let models: ModelInfo[] = [];

    // Handle image models (only OpenAI DALL-E for now)
    if (type === 'image') {
      switch (provider) {
        case 'OPENAI':
          models = await fetchOpenAIImageModels();
          break;

        case 'ANTHROPIC':
        case 'GOOGLE':
          // Anthropic and Google don't have image generation yet
          return NextResponse.json({ models: [] });

        default:
          return NextResponse.json(
            { error: `Unsupported image provider: ${provider}` },
            { status: 400 }
          );
      }
    } else {
      // Handle text models
      switch (provider) {
        case 'OPENAI':
          models = await fetchOpenAIModels();
          break;

        case 'ANTHROPIC':
          models = await fetchAnthropicModels();
          break;

        case 'GOOGLE':
          models = await fetchGoogleModels();
          break;

        default:
          return NextResponse.json(
            { error: `Unsupported provider: ${provider}` },
            { status: 400 }
          );
      }
    }

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error in models API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}