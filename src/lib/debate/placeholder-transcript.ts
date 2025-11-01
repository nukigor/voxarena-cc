/**
 * Generates a realistic placeholder transcript for debates
 * until actual AI generation is implemented
 */

interface PlaceholderDebateData {
  title: string;
  topic: string;
  participants: Array<{
    persona: {
      name: string;
    };
    role: string;
    speakingOrder: number | null;
  }>;
  segmentStructure?: any;
}

export function generatePlaceholderTranscript(debate: PlaceholderDebateData): string {
  // Sort participants by speaking order
  const sortedParticipants = [...debate.participants].sort(
    (a, b) => (a.speakingOrder || 0) - (b.speakingOrder || 0)
  );

  // Identify moderator and debaters
  const moderator = sortedParticipants.find(
    (p) => p.role === 'MODERATOR' || p.role === 'HOST'
  );
  const debaters = sortedParticipants.filter(
    (p) => p.role === 'DEBATER' || p.role === 'EXPERT'
  );

  // Get segment structure if available
  const segments = debate.segmentStructure as any[] || [];

  // Build transcript
  let transcript = `╔════════════════════════════════════════════════════════════════╗
║           PLACEHOLDER TRANSCRIPT - PREVIEW MODE                ║
╚════════════════════════════════════════════════════════════════╝

This is a placeholder transcript for preview purposes only.
Actual AI-generated debate content will replace this when the
generation system is fully implemented.

────────────────────────────────────────────────────────────────

`;

  // Title and Topic
  transcript += `# ${debate.title}\n\n`;
  transcript += `**Topic:** ${debate.topic}\n\n`;

  // Participants list
  transcript += `**Participants:**\n`;
  if (moderator) {
    transcript += `- ${moderator.persona.name} (${moderator.role})\n`;
  }
  debaters.forEach((d) => {
    transcript += `- ${d.persona.name} (${d.role})\n`;
  });
  transcript += `\n────────────────────────────────────────────────────────────────\n\n`;

  // Generate content based on segments or default structure
  if (segments.length > 0) {
    segments.forEach((segment, index) => {
      transcript += `## ${segment.title}\n\n`;

      if (index === 0) {
        // Opening segment
        if (moderator) {
          transcript += `**[${moderator.persona.name}]:** Welcome to today's debate on "${debate.topic}". `;
          transcript += `We have ${debaters.length} distinguished ${debaters.length === 1 ? 'participant' : 'participants'} joining us today. `;
          transcript += `Let's begin with opening statements.\n\n`;
        }

        debaters.forEach((debater, i) => {
          transcript += `**[${debater.persona.name}]:** Thank you for the opportunity to discuss this important topic. `;
          transcript += `I believe this issue deserves our careful attention, and I look forward to presenting my perspective.\n\n`;
        });
      } else if (index === segments.length - 1) {
        // Closing segment
        debaters.forEach((debater, i) => {
          transcript += `**[${debater.persona.name}]:** In conclusion, I want to emphasize the key points I've made today. `;
          transcript += `This issue requires thoughtful consideration, and I hope I've contributed meaningfully to this discussion.\n\n`;
        });

        if (moderator) {
          transcript += `**[${moderator.persona.name}]:** Thank you both for this engaging and enlightening discussion. `;
          transcript += `You've given our audience much to think about.\n\n`;
        }
      } else {
        // Middle segments - alternate between debaters
        debaters.forEach((debater, i) => {
          transcript += `**[${debater.persona.name}]:** Regarding this aspect of the ${debate.topic.toLowerCase()}, `;
          transcript += `I'd like to present my analysis and reasoning. The evidence suggests that we should carefully evaluate all perspectives.\n\n`;

          // Response from other debater(s)
          const responder = debaters[(i + 1) % debaters.length];
          if (responder && responder !== debater) {
            transcript += `**[${responder.persona.name}]:** I appreciate that point, but I'd like to offer a different perspective. `;
            transcript += `When we consider the broader implications, we might reach a different conclusion.\n\n`;
          }
        });

        if (moderator && index % 2 === 0) {
          transcript += `**[${moderator.persona.name}]:** These are excellent points from both sides. `;
          transcript += `Let's continue exploring this topic.\n\n`;
        }
      }
    });
  } else {
    // Default structure if no segments defined
    transcript += `## Opening Statements\n\n`;

    if (moderator) {
      transcript += `**[${moderator.persona.name}]:** Welcome to today's debate on "${debate.topic}". `;
      transcript += `Let's hear opening statements from our participants.\n\n`;
    }

    debaters.forEach((debater) => {
      transcript += `**[${debater.persona.name}]:** Thank you for having me. `;
      transcript += `I'm looking forward to discussing this important topic and sharing my perspective with everyone here today.\n\n`;
    });

    transcript += `\n## Main Discussion\n\n`;

    // Generate a few exchanges
    for (let round = 0; round < 3; round++) {
      debaters.forEach((debater, i) => {
        transcript += `**[${debater.persona.name}]:** `;

        if (round === 0) {
          transcript += `Let me present my main argument regarding ${debate.topic.toLowerCase()}. `;
          transcript += `The evidence strongly supports the position that careful consideration is needed.\n\n`;
        } else if (round === 1) {
          transcript += `I'd like to respond to the previous points and add additional context. `;
          transcript += `When we examine this from multiple angles, we can see the complexity of the issue.\n\n`;
        } else {
          transcript += `To build on what's been discussed, I want to emphasize the importance of `;
          transcript += `understanding all the nuances involved in ${debate.topic.toLowerCase()}.\n\n`;
        }
      });

      if (moderator && round < 2) {
        transcript += `**[${moderator.persona.name}]:** Excellent points. Let's continue the discussion.\n\n`;
      }
    }

    transcript += `\n## Closing Statements\n\n`;

    debaters.forEach((debater) => {
      transcript += `**[${debater.persona.name}]:** In conclusion, I want to reiterate my main points. `;
      transcript += `This has been a valuable discussion, and I hope the audience takes away the importance of thoughtful engagement with this topic.\n\n`;
    });

    if (moderator) {
      transcript += `**[${moderator.persona.name}]:** Thank you to all our participants for this thoughtful and engaging debate. `;
      transcript += `You've given us all much to consider.\n\n`;
    }
  }

  // Footer
  transcript += `────────────────────────────────────────────────────────────────\n\n`;
  transcript += `End of placeholder transcript.\n`;
  transcript += `Actual debate content will be generated by AI in a future update.\n`;

  return transcript;
}
