import { BaseAiProvider } from "./base";
import {
  AiGenerationRequest,
  AiGenerationResponse,
  AiProvider,
} from "@/types/ai-providers";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { buildPersonaPrompt } from "../prompt-builder";

// Type alias for persona with taxonomy - using any for now as the full type is not exported
type PersonaWithTaxonomy = any;

export class GoogleProvider extends BaseAiProvider {
  private client: GoogleGenerativeAI | null = null;

  // Map old model names to new Gemini 2.x models (as of 2025)
  private modelMapping: Record<string, string> = {
    // Map old 1.5 models to new 2.x models
    'gemini-1.5-pro': 'gemini-2.5-pro',
    'gemini-1.5-pro-002': 'gemini-2.5-pro',
    'gemini-1.5-flash': 'gemini-2.5-flash',
    'gemini-1.5-flash-002': 'gemini-2.5-flash',
    'gemini-1.5-flash-8b': 'gemini-2.0-flash',
    'gemini-1.5-flash-8b-001': 'gemini-2.0-flash',
    // Legacy names
    'gemini-pro': 'gemini-2.5-pro',
    'gemini-flash': 'gemini-2.5-flash',
  };

  constructor(apiKey?: string) {
    super(apiKey || process.env.GOOGLE_AI_API_KEY);
    if (this.apiKey) {
      this.client = new GoogleGenerativeAI(this.apiKey);
    }
  }

  getProviderName(): string {
    return "Google";
  }

  private normalizeModelName(modelName: string): string {
    // If the model name exists in our mapping, use the mapped value
    // Otherwise, return the original model name (it might already have a version suffix)
    return this.modelMapping[modelName] || modelName;
  }

  private getModel(modelName: string): GenerativeModel {
    if (!this.client) {
      throw new Error("Google AI client not initialized");
    }
    const normalizedModel = this.normalizeModelName(modelName);
    console.log(`[Google Provider] Normalizing model: ${modelName} -> ${normalizedModel}`);
    return this.client.getGenerativeModel({ model: normalizedModel });
  }

  async generate(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    try {
      const model = this.getModel(request.model);

      // Build chat history with proper structure
      const chatHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      // Add system prompt as a user message if provided
      if (request.systemPrompt) {
        chatHistory.push({
          role: "user",
          parts: [{ text: `System: ${request.systemPrompt}` }]
        });
        chatHistory.push({
          role: "model",
          parts: [{ text: "Understood. I'll follow these instructions." }]
        });
      }

      // Add messages if provided
      if (request.messages) {
        request.messages.forEach((msg) => {
          const role = msg.role === 'assistant' ? 'model' : 'user';
          chatHistory.push({
            role,
            parts: [{ text: msg.content }]
          });
        });
      }

      // Start chat with history
      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: request.temperature || 0.8,
          maxOutputTokens: request.maxTokens || 2000,
        },
      });

      // Send the main prompt
      const result = await chat.sendMessage(request.prompt);
      const response = await result.response;
      const content = response.text();

      // Get usage metadata if available
      const usage = response.usageMetadata ? {
        promptTokens: response.usageMetadata.promptTokenCount || 0,
        completionTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0,
      } : undefined;

      return {
        content,
        usage,
        model: request.model,
        provider: AiProvider.GOOGLE,
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
    modelName: string = "gemini-1.5-pro-002",
    temperature: number = 0.8,
    maxTokens: number = 500
  ): Promise<string> {
    try {
      const model = this.getModel(modelName);
      const personaPrompt = buildPersonaPrompt(persona);

      // Build chat history
      const chatHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [
        {
          role: "user",
          parts: [{
            text: `${personaPrompt}

You are participating in a debate about: ${context.topic}
Format: ${context.format}

You are ${persona.name}. Stay in character and respond based on your persona's characteristics.`
          }]
        },
        {
          role: "model",
          parts: [{ text: "I understand. I am now embodying " + persona.name + " and will participate in this debate according to their characteristics." }]
        }
      ];

      // Add previous messages
      context.previousMessages.forEach((msg) => {
        const content = msg.speaker ? `${msg.speaker}: ${msg.content}` : msg.content;
        chatHistory.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: content }]
        });
      });

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      const result = await chat.sendMessage(`Continue the debate as ${persona.name}. Provide your next response.`);
      const response = await result.response;

      return response.text();
    } catch (error) {
      this.handleError(error, "debate response generation");
    }
  }

  async generateAvatar(
    persona: PersonaWithTaxonomy,
    modelName: string = "gemini-1.5-pro-002"
  ): Promise<string> {
    try {
      const model = this.getModel(modelName);

      // Gemini doesn't generate images directly, but can create detailed descriptions
      const systemPrompt = this.buildSystemPrompt(
        persona,
        "Generate a detailed visual description for an avatar portrait. Include physical appearance, facial features, expression, clothing style, and any distinctive characteristics that reflect their personality."
      );

      const chat = model.startChat({
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      });

      const result = await chat.sendMessage(systemPrompt + "\n\nCreate a detailed avatar description for this persona that captures their essence visually.");
      const response = await result.response;
      const content = response.text();

      // Return a description that can be used with an image generation service
      return `Portrait of ${persona.name}: ${content}`;
    } catch (error) {
      this.handleError(error, "avatar description generation");
    }
  }

  async generateTeaser(
    persona: PersonaWithTaxonomy,
    modelName: string = "gemini-1.5-pro-002"
  ): Promise<string> {
    try {
      const model = this.getModel(modelName);
      const systemPrompt = this.buildSystemPrompt(
        persona,
        "Generate an ultra-short teaser (maximum 8 words) that captures this persona's essence. Be punchy and memorable."
      );

      const chat = model.startChat({
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 20,
        },
      });

      const result = await chat.sendMessage(systemPrompt);
      const response = await result.response;

      return response.text().trim();
    } catch (error) {
      this.handleError(error, "teaser generation");
    }
  }

  async generateDescription(
    persona: PersonaWithTaxonomy,
    modelName: string = "gemini-1.5-pro-002"
  ): Promise<string> {
    try {
      const model = this.getModel(modelName);
      const systemPrompt = this.buildSystemPrompt(
        persona,
        "Write a compelling 2-3 paragraph description (200-300 words) that brings this persona to life. Make them feel real and interesting for potential debate participants."
      );

      const chat = model.startChat({
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 500,
        },
      });

      const result = await chat.sendMessage(systemPrompt);
      const response = await result.response;

      return response.text();
    } catch (error) {
      this.handleError(error, "description generation");
    }
  }
}