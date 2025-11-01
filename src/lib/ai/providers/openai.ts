import OpenAI from "openai";
import { PersonaWithTaxonomy, buildPersonaPrompt, buildAvatarPrompt } from "../prompt-builder";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface DebateContext {
  topic: string;
  format: string;
  previousMessages: { role: string; content: string; speaker?: string }[];
}

/**
 * Generate a debate response from a persona using OpenAI
 */
export async function generateDebateResponse(
  persona: PersonaWithTaxonomy,
  context: DebateContext
): Promise<string> {
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

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.8,
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content || "";
}

/**
 * Generate a persona avatar using DALL-E
 */
export async function generateAvatar(persona: PersonaWithTaxonomy): Promise<string> {
  const prompt = buildAvatarPrompt(persona);

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  return response.data?.[0]?.url || "";
}

/**
 * Generate a complete debate transcript
 */
export async function generateDebateTranscript(params: {
  topic: string;
  format: string;
  debaters: PersonaWithTaxonomy[];
  moderator?: PersonaWithTaxonomy;
  rounds?: number;
}): Promise<{ transcript: string; duration: number }> {
  const { topic, format, debaters, moderator, rounds = 3 } = params;

  const messages: { role: string; content: string; speaker: string }[] = [];
  let transcript = "";

  // Opening by moderator
  if (moderator) {
    const opening = await generateDebateResponse(moderator, {
      topic,
      format,
      previousMessages: [
        {
          role: "user",
          content: "Please open the debate and introduce the topic.",
        },
      ],
    });

    messages.push({ role: "assistant", content: opening, speaker: moderator.name });
    transcript += `**${moderator.name}**: ${opening}\n\n`;
  }

  // Debate rounds
  for (let round = 0; round < rounds; round++) {
    for (const debater of debaters) {
      const response = await generateDebateResponse(debater, {
        topic,
        format,
        previousMessages: messages,
      });

      messages.push({ role: "assistant", content: response, speaker: debater.name });
      transcript += `**${debater.name}**: ${response}\n\n`;
    }

    // Moderator interjection
    if (moderator && round < rounds - 1) {
      const interjection = await generateDebateResponse(moderator, {
        topic,
        format,
        previousMessages: messages,
      });

      messages.push({ role: "assistant", content: interjection, speaker: moderator.name });
      transcript += `**${moderator.name}**: ${interjection}\n\n`;
    }
  }

  // Closing by moderator
  if (moderator) {
    const closing = await generateDebateResponse(moderator, {
      topic,
      format,
      previousMessages: [
        ...messages,
        {
          role: "user",
          content: "Please provide a closing summary of the debate.",
        },
      ],
    });

    transcript += `**${moderator.name}**: ${closing}\n\n`;
  }

  // Estimate duration (rough approximation: 150 words per minute speaking)
  const wordCount = transcript.split(/\s+/).length;
  const estimatedDuration = Math.ceil((wordCount / 150) * 60); // in seconds

  return {
    transcript,
    duration: estimatedDuration,
  };
}
