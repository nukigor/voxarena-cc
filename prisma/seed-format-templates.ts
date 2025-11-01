import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding format templates...");

  // Check if templates already exist
  const existingCount = await prisma.formatTemplate.count();
  if (existingCount > 0) {
    console.log(`✅ ${existingCount} format templates already exist. Skipping.`);
    return;
  }

  const panelDiscussion = await prisma.formatTemplate.create({
    data: {
      name: "Panel Discussion",
      slug: "panel-discussion",
      description: "A multi-participant debate format featuring 3-5 AI personas and a moderator discussing complex topics from diverse perspectives. Ideal for exploring nuanced issues with multiple viewpoints.",
      category: "ACADEMIC",
      mode: "DEBATE",
      isPreset: true,
      minParticipants: 4,
      maxParticipants: 6,
      requiresModerator: true,
      durationMinutes: 30,
      flexibleTiming: true,
      segmentStructure: [
        {
          key: "introduction",
          title: "Introduction",
          description: "Moderator introduces the topic and participants",
          durationMinutes: 2,
          required: true,
          allowsReordering: false,
        },
        {
          key: "opening_perspectives",
          title: "Opening Perspectives",
          description: "Each participant shares their initial position (1-2 min each)",
          durationMinutes: 8,
          required: true,
          allowsReordering: false,
        },
        {
          key: "moderated_discussion",
          title: "Moderated Discussion",
          description: "Open discussion with moderator guidance",
          durationMinutes: 15,
          required: true,
          allowsReordering: false,
        },
        {
          key: "audience_qa",
          title: "Audience Q&A",
          description: "Optional audience questions segment",
          durationMinutes: 3,
          required: false,
          allowsReordering: true,
        },
        {
          key: "closing_thoughts",
          title: "Closing Thoughts",
          description: "Each participant shares final reflections",
          durationMinutes: 2,
          required: true,
          allowsReordering: false,
        },
      ],
      bestFor: "Complex policy debates, interdisciplinary topics, issues with multiple valid perspectives, topics requiring diverse expertise, exploring grey areas",
      personaRecommendations: "Select personas with complementary but distinct perspectives. Include at least one analytical archetype, one charismatic voice, and ensure diversity in cultural background, professional expertise, or philosophical stance. The moderator should have strong facilitation skills.",
    },
  });

  const twoPersonDialogue = await prisma.formatTemplate.create({
    data: {
      name: "Two-Person Dialogue",
      slug: "two-person-dialogue",
      description: "An intimate debate format between two AI personas, optionally moderated. Perfect for deep dives into contrasting viewpoints or exploring a topic through dialogue.",
      category: "PROFESSIONAL",
      mode: "DEBATE",
      isPreset: true,
      minParticipants: 2,
      maxParticipants: 3,
      requiresModerator: false,
      durationMinutes: 30,
      flexibleTiming: true,
      segmentStructure: [
        {
          key: "introduction",
          title: "Introduction",
          description: "Set the stage and introduce participants",
          durationMinutes: 2,
          required: true,
          allowsReordering: false,
        },
        {
          key: "opening_statements",
          title: "Opening Statements",
          description: "Each participant presents their position",
          durationMinutes: 6,
          required: true,
          allowsReordering: false,
        },
        {
          key: "main_dialogue",
          title: "Main Dialogue",
          description: "Back-and-forth discussion between participants",
          durationMinutes: 12,
          required: true,
          allowsReordering: false,
        },
        {
          key: "deep_dive",
          title: "Deep Dive",
          description: "Explore a specific contentious point in detail",
          durationMinutes: 5,
          required: false,
          allowsReordering: true,
        },
        {
          key: "common_ground",
          title: "Finding Common Ground",
          description: "Identify areas of agreement or synthesis",
          durationMinutes: 3,
          required: false,
          allowsReordering: true,
        },
        {
          key: "closing_reflections",
          title: "Closing Reflections",
          description: "Final thoughts from each participant",
          durationMinutes: 2,
          required: true,
          allowsReordering: false,
        },
      ],
      bestFor: "Philosophical debates, expert vs expert discussions, contrasting ideologies, topics requiring deep exploration, intimate conversations on complex subjects",
      personaRecommendations: "Choose two personas with clear contrasting positions but mutual respect. Consider pairing different archetypes (e.g., Analytical vs Charismatic, Pragmatist vs Idealist). If using a moderator, select one with a neutral facilitation style.",
    },
  });

  const expertReviewPanel = await prisma.formatTemplate.create({
    data: {
      name: "Expert Review Panel",
      slug: "expert-review-panel",
      description: "A structured format where 2-4 AI expert personas and a moderator review and critique a user-submitted document, proposal, or idea. Experts provide assessments and recommendations.",
      category: "PROFESSIONAL",
      mode: "DEBATE",
      isPreset: true,
      minParticipants: 3,
      maxParticipants: 5,
      requiresModerator: true,
      durationMinutes: 25,
      flexibleTiming: true,
      segmentStructure: [
        {
          key: "introduction",
          title: "Introduction",
          description: "Moderator introduces the panel and document under review",
          durationMinutes: 2,
          required: true,
          allowsReordering: false,
        },
        {
          key: "document_summary",
          title: "Document Summary",
          description: "Brief overview of the submitted material",
          durationMinutes: 3,
          required: true,
          allowsReordering: false,
        },
        {
          key: "individual_assessments",
          title: "Individual Assessments",
          description: "Each expert provides their evaluation (2-3 min each)",
          durationMinutes: 10,
          required: true,
          allowsReordering: false,
        },
        {
          key: "panel_discussion",
          title: "Panel Discussion",
          description: "Experts discuss points of agreement and disagreement",
          durationMinutes: 6,
          required: true,
          allowsReordering: false,
        },
        {
          key: "recommendations",
          title: "Recommendations",
          description: "Specific suggestions for improvement or next steps",
          durationMinutes: 3,
          required: true,
          allowsReordering: false,
        },
        {
          key: "final_verdict",
          title: "Final Verdict",
          description: "Overall assessment and conclusion",
          durationMinutes: 1,
          required: true,
          allowsReordering: false,
        },
      ],
      bestFor: "Business plan reviews, academic paper critiques, policy proposal evaluations, pitch assessments, design reviews, research methodology critiques",
      personaRecommendations: "Select personas with relevant domain expertise for the document being reviewed. Include diverse professional backgrounds (e.g., technical expert, business strategist, ethicist). Ensure at least one critical/analytical archetype and one constructive/solution-oriented persona.",
    },
  });

  const crossCulturalExchange = await prisma.formatTemplate.create({
    data: {
      name: "Cross-Cultural Exchange",
      slug: "cross-cultural-exchange",
      description: "A dialogue format featuring 3-5 AI personas from different cultural backgrounds discussing how their cultures approach a shared topic. Moderated for respectful exploration of cultural differences.",
      category: "CULTURAL",
      mode: "PODCAST",
      isPreset: true,
      minParticipants: 4,
      maxParticipants: 6,
      requiresModerator: true,
      durationMinutes: 30,
      flexibleTiming: true,
      segmentStructure: [
        {
          key: "introduction",
          title: "Introduction",
          description: "Moderator introduces the cultural exchange format and participants",
          durationMinutes: 2,
          required: true,
          allowsReordering: false,
        },
        {
          key: "cultural_context",
          title: "Cultural Context Setting",
          description: "Each participant briefly shares their cultural background",
          durationMinutes: 5,
          required: true,
          allowsReordering: false,
        },
        {
          key: "topic_exploration",
          title: "Topic Exploration",
          description: "Discuss how each culture views/approaches the topic",
          durationMinutes: 10,
          required: true,
          allowsReordering: false,
        },
        {
          key: "comparative_discussion",
          title: "Comparative Discussion",
          description: "Explore similarities and differences between cultural approaches",
          durationMinutes: 8,
          required: true,
          allowsReordering: false,
        },
        {
          key: "learning_moments",
          title: "Learning Moments",
          description: "Participants share what they learned from other perspectives",
          durationMinutes: 3,
          required: false,
          allowsReordering: true,
        },
        {
          key: "synthesis",
          title: "Synthesis",
          description: "Moderator synthesizes insights and closing reflections",
          durationMinutes: 2,
          required: true,
          allowsReordering: false,
        },
      ],
      bestFor: "Cross-cultural business practices, global approaches to social issues, cultural values exploration, international perspectives on technology/innovation, comparing worldviews on universal topics",
      personaRecommendations: "Select personas from genuinely different cultural regions (e.g., East Asian, Middle Eastern, Latin American, Northern European, Sub-Saharan African). Ensure all personas have respectful and curious archetypes. Avoid stereotypical representations—emphasize authentic cultural nuances.",
    },
  });

  console.log("✅ Created 4 preset format templates:");
  console.log(`   - ${panelDiscussion.name}`);
  console.log(`   - ${twoPersonDialogue.name}`);
  console.log(`   - ${expertReviewPanel.name}`);
  console.log(`   - ${crossCulturalExchange.name}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding format templates:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
