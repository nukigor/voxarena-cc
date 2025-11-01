import { Persona, TaxonomyCategory, TaxonomyTerm } from "@prisma/client";

export type PersonaWithTaxonomy = Persona & {
  taxonomyValues: {
    term: TaxonomyTerm & {
      category: TaxonomyCategory;
    };
  }[];
};

/**
 * Build a comprehensive AI prompt from a persona's attributes
 * Uses multi-layered approach: system context + personality traits + free-text
 */
export function buildPersonaPrompt(persona: PersonaWithTaxonomy): string {
  // Group taxonomy values by category
  const categoriesMap = new Map<string, { category: TaxonomyCategory; terms: TaxonomyTerm[] }>();

  persona.taxonomyValues.forEach(({ term }) => {
    const existing = categoriesMap.get(term.category.id);
    if (existing) {
      existing.terms.push(term);
    } else {
      categoriesMap.set(term.category.id, {
        category: term.category,
        terms: [term],
      });
    }
  });

  // Sort categories by prompt weight (descending)
  const sortedCategories = Array.from(categoriesMap.values()).sort(
    (a, b) => b.category.promptWeight - a.category.promptWeight
  );

  // Build system context layer
  const systemContext = sortedCategories
    .map(({ category }) => `${category.name}: ${category.description}`)
    .join("\n\n");

  // Build personality traits layer
  const personalityTraits = sortedCategories
    .map(({ category, terms }) => {
      const termDescriptions = terms
        .map((term) => `  - ${term.name}: ${term.description}`)
        .join("\n");
      return `${category.name}:\n${termDescriptions}`;
    })
    .join("\n\n");

  // Build free-text context layer
  const freeTextContext = [
    `Name: ${persona.name}${persona.nickname ? ` (${persona.nickname})` : ""}`,
    persona.professionRole && `Profession: ${persona.professionRole}`,
    persona.quirks && `Quirks: ${persona.quirks}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Combine all layers
  return `
# System Context

${systemContext}

# Personality Traits

${personalityTraits}

# Identity

${freeTextContext}

---

You are embodying this persona in a debate. Speak, argue, and interact authentically according to these characteristics. Your communication style, vocabulary, reasoning approach, and emotional responses should all align with the traits described above.
`.trim();
}

/**
 * Build a prompt for generating a persona avatar using DALL-E
 */
export function buildAvatarPrompt(persona: PersonaWithTaxonomy): string {
  const attributes: string[] = [];

  // Extract relevant visual attributes from taxonomy
  persona.taxonomyValues.forEach(({ term }) => {
    const categoryName = term.category.name.toLowerCase();

    // Include categories that contribute to visual appearance
    if (
      categoryName.includes("age") ||
      categoryName.includes("gender") ||
      categoryName.includes("culture") ||
      categoryName.includes("region") ||
      categoryName.includes("archetype") ||
      categoryName.includes("temperament")
    ) {
      attributes.push(term.name);
    }
  });

  const profession = persona.professionRole || "professional";
  const basePrompt = `Professional portrait headshot of ${persona.name}, ${attributes.join(", ")}, ${profession}`;

  return `${basePrompt}, neutral background, photorealistic, professional lighting, high quality`;
}

/**
 * Build context for debate generation including multiple personas
 */
export function buildDebateContext(params: {
  topic: string;
  format: string;
  debaters: PersonaWithTaxonomy[];
  moderator?: PersonaWithTaxonomy;
}): string {
  const { topic, format, debaters, moderator } = params;

  const debatersSection = debaters
    .map((persona, index) => {
      return `
## Debater ${index + 1}: ${persona.name}

${buildPersonaPrompt(persona)}
`;
    })
    .join("\n\n");

  const moderatorSection = moderator
    ? `
## Moderator: ${moderator.name}

${buildPersonaPrompt(moderator)}

Your role is to moderate this debate fairly, ensure balanced speaking time, ask clarifying questions, and maintain civility while allowing passionate discourse.
`
    : "";

  return `
# Debate Context

Topic: ${topic}
Format: ${format}

${debatersSection}

${moderatorSection}

Generate a structured, engaging debate on this topic with these personas. Each persona should speak authentically according to their characteristics. ${moderator ? "The moderator should guide the discussion appropriately." : ""}
`.trim();
}
