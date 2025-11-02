/**
 * OpenAI Provider Implementation
 */

import OpenAI from "openai";
import { BaseAiProvider } from "./base";
import { PersonaWithTaxonomy, buildPersonaPrompt, buildAvatarPrompt } from "../prompt-builder";
import { AiGenerationRequest, AiGenerationResponse, AiProvider } from "@/types/ai-providers";

export class OpenAIProvider extends BaseAiProvider {
  private client: OpenAI | null = null;

  constructor(apiKey?: string) {
    super(apiKey || process.env.OPENAI_API_KEY);

    if (this.apiKey) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
      });
    }
  }

  getProviderName(): string {
    return "OpenAI";
  }

  async generate(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    if (!this.client) {
      throw new Error("OpenAI client not initialized");
    }

    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      if (request.systemPrompt) {
        messages.push({ role: "system", content: request.systemPrompt });
      }

      if (request.messages) {
        messages.push(...request.messages.map(msg => ({
          role: msg.role as "system" | "user" | "assistant",
          content: msg.content,
        })));
      } else {
        messages.push({ role: "user", content: request.prompt });
      }

      const response = await this.client.chat.completions.create({
        model: request.model,
        messages,
        temperature: request.temperature || 0.8,
        max_tokens: request.maxTokens || 2000,
      });

      const content = response.choices[0]?.message?.content || "";

      return {
        content,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
        model: response.model,
        provider: AiProvider.OPENAI,
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
    model: string = "gpt-4o",
    temperature: number = 0.8,
    maxTokens: number = 500
  ): Promise<string> {
    if (!this.client) {
      throw new Error("OpenAI client not initialized");
    }

    try {
      const personaPrompt = buildPersonaPrompt(persona);

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: personaPrompt,
        },
        {
          role: "system",
          content: `You are participating in a debate about: ${context.topic}\nFormat: ${context.format}\n\nSpeak as ${persona.name}. Stay in character.`,
        },
        ...context.previousMessages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.speaker ? `${msg.speaker}: ${msg.content}` : msg.content,
        })),
      ];

      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      return response.choices[0]?.message?.content || "";
    } catch (error) {
      this.handleError(error, "debate response generation");
    }
  }

  async generateAvatar(
    persona: PersonaWithTaxonomy,
    model: string = "dall-e-3"
  ): Promise<string> {
    if (!this.client) {
      throw new Error("OpenAI client not initialized");
    }

    try {
      const avatarPrompt = buildAvatarPrompt(persona);

      const response = await this.client.images.generate({
        model: model as any,
        prompt: avatarPrompt,
        n: 1,
        size: "1024x1024",
      });

      return response.data[0]?.url || "";
    } catch (error) {
      this.handleError(error, "avatar generation");
    }
  }

  async generateTeaser(
    persona: PersonaWithTaxonomy,
    model: string = "gpt-4o"
  ): Promise<string> {
    if (!this.client) {
      throw new Error("OpenAI client not initialized");
    }

    try {
      const systemPrompt = this.buildSystemPrompt(
        persona,
        "Generate a compelling 1-2 sentence teaser that captures this persona's unique perspective and personality. Make it engaging and intriguing."
      );

      const response = await this.client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate a teaser for this persona." },
        ],
        temperature: 0.9,
        max_tokens: 100,
      });

      return response.choices[0]?.message?.content || "";
    } catch (error) {
      this.handleError(error, "teaser generation");
    }
  }

  async generateDescription(
    persona: PersonaWithTaxonomy,
    model: string = "gpt-4o"
  ): Promise<string> {
    if (!this.client) {
      throw new Error("OpenAI client not initialized");
    }

    try {
      const systemPrompt = this.buildSystemPrompt(
        persona,
        "Generate a detailed description (2-3 paragraphs) that brings this persona to life. Include their background, motivations, perspectives, and what makes them unique."
      );

      const response = await this.client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate a comprehensive description for this persona." },
        ],
        temperature: 0.8,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || "";
    } catch (error) {
      this.handleError(error, "description generation");
    }
  }
}