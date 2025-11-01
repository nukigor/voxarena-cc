import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { PersonaWithTaxonomy } from "../ai/prompt-builder";

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

/**
 * Map persona voice attributes to ElevenLabs voice settings
 */
export function mapPersonaToVoiceSettings(persona: PersonaWithTaxonomy) {
  // Extract voice-related taxonomy values
  const voiceAttributes = persona.taxonomyValues.filter(({ term }) =>
    term.category.name.toLowerCase().includes("voice")
  );

  // Default settings
  const settings = {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.5,
    use_speaker_boost: true,
  };

  // Adjust based on persona attributes
  voiceAttributes.forEach(({ term }) => {
    const categoryName = term.category.name.toLowerCase();
    const termName = term.name.toLowerCase();

    // Adjust stability based on temperament/energy
    if (categoryName.includes("energy") || categoryName.includes("intensity")) {
      if (termName.includes("high") || termName.includes("intense")) {
        settings.stability = 0.3; // More variable
      } else if (termName.includes("low") || termName.includes("calm")) {
        settings.stability = 0.7; // More stable
      }
    }

    // Adjust style based on formality
    if (categoryName.includes("formality")) {
      if (termName.includes("formal")) {
        settings.style = 0.3; // Less expressive
      } else if (termName.includes("casual")) {
        settings.style = 0.7; // More expressive
      }
    }
  });

  return settings;
}

/**
 * Select appropriate ElevenLabs voice based on persona attributes
 */
export function selectVoiceForPersona(persona: PersonaWithTaxonomy): string {
  // Extract gender and age attributes
  const genderTerm = persona.taxonomyValues.find(({ term }) =>
    term.category.name.toLowerCase().includes("gender")
  );

  const ageTerm = persona.taxonomyValues.find(({ term }) =>
    term.category.name.toLowerCase().includes("age")
  );

  const gender = genderTerm?.term.name.toLowerCase() || "";
  const age = ageTerm?.term.name.toLowerCase() || "";

  // Map to ElevenLabs pre-made voices (you'll need to customize these IDs)
  // For now, using generic fallbacks
  if (gender.includes("male") && !gender.includes("female")) {
    if (age.includes("young") || age.includes("18-25")) {
      return "pNInz6obpgDQGcFmaJgB"; // Adam - Young male
    }
    return "ErXwobaYiN019PkySvjV"; // Antoni - Mature male
  } else if (gender.includes("female")) {
    if (age.includes("young") || age.includes("18-25")) {
      return "EXAVITQu4vr4xnSDxMaL"; // Bella - Young female
    }
    return "21m00Tcm4TlvDq8ikWAM"; // Rachel - Mature female
  }

  // Default fallback
  return "pNInz6obpgDQGcFmaJgB"; // Adam
}

/**
 * Generate audio for a text segment using persona's voice
 */
export async function generateAudio(
  text: string,
  persona: PersonaWithTaxonomy
): Promise<Buffer> {
  const voiceId = selectVoiceForPersona(persona);
  const voiceSettings = mapPersonaToVoiceSettings(persona);

  const audio = await elevenlabs.textToSpeech.convert(voiceId, {
    text,
    modelId: "eleven_multilingual_v2",
    voiceSettings: voiceSettings,
  });

  // Convert ReadableStream to buffer
  const reader = audio.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

/**
 * Generate complete debate audio from transcript
 * Parses speaker names and generates audio for each segment
 */
export async function generateDebateAudio(
  transcript: string,
  personasMap: Map<string, PersonaWithTaxonomy>
): Promise<Buffer[]> {
  // Parse transcript into segments
  const segments = parseTranscriptSegments(transcript);

  // Generate audio for each segment
  const audioBuffers: Buffer[] = [];

  for (const segment of segments) {
    const persona = personasMap.get(segment.speaker);
    if (!persona) {
      console.warn(`Persona not found for speaker: ${segment.speaker}`);
      continue;
    }

    const audio = await generateAudio(segment.text, persona);
    audioBuffers.push(audio);
  }

  return audioBuffers;
}

/**
 * Parse transcript into speaker segments
 */
function parseTranscriptSegments(transcript: string): { speaker: string; text: string }[] {
  const segments: { speaker: string; text: string }[] = [];
  const lines = transcript.split("\n");

  for (const line of lines) {
    const match = line.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
    if (match) {
      segments.push({
        speaker: match[1].trim(),
        text: match[2].trim(),
      });
    }
  }

  return segments;
}
