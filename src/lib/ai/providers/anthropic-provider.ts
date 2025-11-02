/**
 * Anthropic (Claude) Provider Implementation
 */

import Anthropic from "@anthropic-ai/sdk";
import { BaseAiProvider } from "./base";
import { PersonaWithTaxonomy, buildPersonaPrompt } from "../prompt-builder";
import { AiGenerationRequest, AiGenerationResponse, AiProvider } from "@/types/ai-providers";

export class AnthropicProvider extends BaseAiProvider {
  private client: Anthropic | null = null;

  constructor(apiKey?: string) {
    super(apiKey || process.env.ANTHROPIC_API_KEY);

    if (this.apiKey) {
      this.client = new Anthropic({
        apiKey: this.apiKey,
      });
    }
  }

  getProviderName(): string {
    return "Anthropic";
  }

  async generate(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    if (!this.client) {
      throw new Error("Anthropic client not initialized");
    }

    try {
      const messages: Anthropic.MessageParam[] = [];

      if (request.messages) {
        // Convert messages to Anthropic format
        request.messages.forEach((msg) => {
          if (msg.role !== 'system') {
            messages.push({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            });
          }
        });
      } else {
        messages.push({ role: "user", content: request.prompt });
      }

      // Combine system prompts
      const systemPrompts: string[] = [];
      if (request.systemPrompt) {
        systemPrompts.push(request.systemPrompt);
      }
      if (request.messages) {
        const systemMessages = request.messages.filter(m => m.role === 'system');
        systemMessages.forEach(m => systemPrompts.push(m.content));
      }

      const response = await this.client.messages.create({
        model: request.model,
        messages,
        system: systemPrompts.join('\n\n'),
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';

      return {
        content,
        usage: response.usage ? {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        } : undefined,
        model: response.model,
        provider: AiProvider.ANTHROPIC,
      };
    } catch (error) {
      this.handleError(error, "content generation");
    }
  }

  async generateDebateResponse(
    persona: PersonaWithTaxonomy,
    context: {
      topic: string;
      format: string;
      previousMessages: { role: string; content: string; speaker?: string }[];
    },
    model: string = "claude-3-5-sonnet-20241022",
    temperature: number = 0.7,
    maxTokens: number = 500
  ): Promise<string> {
    if (!this.client) {
      throw new Error("Anthropic client not initialized");
    }

    try {
      const personaPrompt = buildPersonaPrompt(persona);

      // Convert previous messages to Anthropic format
      const messages: Anthropic.MessageParam[] = context.previousMessages.map((msg) => ({
        role: msg.role === 'system' ? 'assistant' : msg.role as 'user' | 'assistant',
        content: msg.speaker ? `${msg.speaker}: ${msg.content}` : msg.content,
      }));

      // Add a user message to continue the conversation
      messages.push({
        role: "user",
        content: `Continue the debate as ${persona.name}. Provide your next response in character.`,
      });

      const systemPrompt = `${personaPrompt}

You are participating in a debate about: ${context.topic}
Format: ${context.format}

You are ${persona.name}. Stay in character and respond naturally based on your persona's characteristics, values, and communication style.`;

      const response = await this.client.messages.create({
        model,
        messages,
        system: systemPrompt,
        temperature,
        max_tokens: maxTokens,
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      return content;
    } catch (error) {
      this.handleError(error, "debate response generation");
    }
  }

  async generateAvatar(
    persona: PersonaWithTaxonomy,
    model: string = "claude-3-5-sonnet-20241022"
  ): Promise<string> {
    if (!this.client) {
      throw new Error("Anthropic client not initialized");
    }

    try {
      // Claude doesn't generate images directly, but can create detailed descriptions
      const systemPrompt = this.buildSystemPrompt(
        persona,
        "Generate a detailed visual description for an avatar that represents this persona. Include physical appearance, clothing style, expression, and any distinctive features that reflect their personality and background."
      );

      const response = await this.client.messages.create({
        model,
        messages: [
          {
            role: "user",
            content: "Create a detailed avatar description for this persona that could be used to generate their portrait image."
          },
        ],
        system: systemPrompt,
        temperature: 0.9,
        max_tokens: 300,
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';

      // Return a description that can be used with an image generation service
      return `Portrait of ${persona.name}: ${content}`;
    } catch (error) {
      this.handleError(error, "avatar description generation");
    }
  }

  async generateTeaser(
    persona: PersonaWithTaxonomy,
    model: string = "claude-3-5-sonnet-20241022"
  ): Promise<string> {
    if (!this.client) {
      throw new Error("Anthropic client not initialized");
    }

    try {
      const systemPrompt = this.buildSystemPrompt(
        persona,
        "Generate a compelling 1-2 sentence teaser that captures this persona's unique perspective and personality. Make it engaging, intriguing, and true to their character."
      );

      const response = await this.client.messages.create({
        model,
        messages: [
          {
            role: "user",
            content: "Write a captivating teaser that introduces this persona in 1-2 sentences."
          },
        ],
        system: systemPrompt,
        temperature: 0.8,
        max_tokens: 100,
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      return content;
    } catch (error) {
      this.handleError(error, "teaser generation");
    }
  }

  async generateDescription(
    persona: PersonaWithTaxonomy,
    model: string = "claude-3-5-sonnet-20241022"
  ): Promise<string> {
    if (!this.client) {
      throw new Error("Anthropic client not initialized");
    }

    try {
      const systemPrompt = this.buildSystemPrompt(
        persona,
        "Generate a detailed description (2-3 paragraphs) that brings this persona to life. Include their background story, core motivations, worldview, communication style, and what makes them unique. Make it vivid and engaging."
      );

      const response = await this.client.messages.create({
        model,
        messages: [
          {
            role: "user",
            content: "Write a comprehensive description that fully captures this persona's essence, background, and personality."
          },
        ],
        system: systemPrompt,
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      return content;
    } catch (error) {
      this.handleError(error, "description generation");
    }
  }
}