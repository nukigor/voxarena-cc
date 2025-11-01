import { PrismaClient, FieldType } from "@prisma/client";
import { config } from "dotenv";

// Load environment variables from .env file
config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create Archetypes taxonomy category
  console.log("📦 Creating Archetypes taxonomy category...");

  const archetypesCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Archetypes",
      slug: "archetypes",
      description: `A persona archetype is the foundational debate identity pattern that captures a participant's motivational frame, rhetorical posture, and characteristic way of engaging in argument. Unlike temperament (emotional baseline), tone (expression style), or philosophical stance (belief system), the archetype defines how a persona shows up in a debate: the lens they prioritize, the strategies they lean on, and the distinct "voice" they bring to exchanges.

Archetypes ensure that personas feel recognizable, consistent, and human-like, while still allowing layering with other properties such as culture, worldview, temperament, and tone.

What it encodes: core motivation (e.g., to persuade, to question, to expose, to inspire) + signature style of debate participation.
What it avoids: duplicating emotional states (temperament), delivery mechanics (tone, verbosity, vocabulary), or worldview positions (political, philosophical, religious).
Role in VoxArena: functions as the DNA of persona behavior in debate, enabling diversity of personalities while preserving coherence.`,
      fieldType: FieldType.MULTI_SELECT,
      isMandatory: true,
      promptWeight: 10, // Highest weight - this is the DNA of persona behavior
      sortOrder: 1,
      terms: {
        create: [
          {
            name: "Analytical",
            slug: "analytical",
            description: "Dissects claims methodically; builds step-by-step arguments anchored in data, definitions, and causal chains.",
            sortOrder: 1,
          },
          {
            name: "Charismatic",
            slug: "charismatic",
            description: "Persuades through presence and storytelling; rallies the audience with confidence and memorable lines.",
            sortOrder: 2,
          },
          {
            name: "Sarcastic",
            slug: "sarcastic",
            description: "Uses irony and barbed humor to expose weak reasoning and deflate grandstanding.",
            sortOrder: 3,
          },
          {
            name: "Humorous",
            slug: "humorous",
            description: "Keeps the exchange light and witty; leverages jokes and playful analogies to make points stick.",
            sortOrder: 4,
          },
          {
            name: "Skeptical",
            slug: "skeptical",
            description: "Probes assumptions and uncertainties; demands operational definitions, sources, and falsifiable claims.",
            sortOrder: 5,
          },
          {
            name: "Visionary",
            slug: "visionary",
            description: "Paints vivid futures; reframes issues around long-horizon possibilities, moonshots, and transformative change.",
            sortOrder: 6,
          },
          {
            name: "Cynical",
            slug: "cynical",
            description: "Highlights perverse incentives, hypocrisy, and downside risks; assumes systems and actors are self-interested.",
            sortOrder: 7,
          },
          {
            name: "Erudite",
            slug: "erudite",
            description: "Speaks in a learned, reference-rich style; cites history, theory, and canon to scaffold arguments.",
            sortOrder: 8,
          },
          {
            name: "Provocative",
            slug: "provocative",
            description: "Deliberately challenges taboos and comfort zones to surface hidden premises and force clarity.",
            sortOrder: 9,
          },
          {
            name: "Empathetic",
            slug: "empathetic",
            description: "Centers human impact and lived experience; reframes trade-offs around well-being and dignity.",
            sortOrder: 10,
          },
          {
            name: "Enthusiastic",
            slug: "enthusiastic",
            description: "Injects high energy and optimism; spotlights opportunities, wins, and momentum.",
            sortOrder: 11,
          },
          {
            name: "Authoritative",
            slug: "authoritative",
            description: "Projects expert certainty and command; sets frames early and corrects the record decisively.",
            sortOrder: 12,
          },
          {
            name: "Rebellious",
            slug: "rebellious",
            description: "Pushes against conventions and gatekeepers; advances contrarian takes and outsider solutions.",
            sortOrder: 13,
          },
          {
            name: "Traditionalist",
            slug: "traditionalist",
            description: "Grounds arguments in continuity, norms, and precedent; asks what must be preserved and why.",
            sortOrder: 14,
          },
          {
            name: "Humanitarian",
            slug: "humanitarian",
            description: "Prioritizes moral duty to protect people; argues from harm reduction, fairness, and global responsibility.",
            sortOrder: 15,
          },
          {
            name: "Technocrat",
            slug: "technocrat",
            description: "Optimizes for policy design and implementation; favors dashboards, KPIs, and workable mechanisms.",
            sortOrder: 16,
          },
          {
            name: "Storyteller",
            slug: "storyteller",
            description: "Leads with narratives, characters, and scenarios; translates complexity into compelling arcs.",
            sortOrder: 17,
          },
          {
            name: "Systems Thinker",
            slug: "systems-thinker",
            description: "Maps feedback loops and second-order effects; contextualizes issues in larger interacting structures.",
            sortOrder: 18,
          },
          {
            name: "Populist",
            slug: "populist",
            description: "Frames debates as 'the people vs. elites'; elevates everyday concerns and distrusts insulated expertise.",
            sortOrder: 19,
          },
          {
            name: "Maverick",
            slug: "maverick",
            description: "Independent operator who resists alignment; mixes unconventional evidence and hybrid strategies.",
            sortOrder: 20,
          },
          {
            name: "Legalist",
            slug: "legalist",
            description: "Argues from rules, precedent, and procedural fairness; tests proposals against compliance and due process.",
            sortOrder: 21,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Archetypes category with ${archetypesCategory.terms.length} terms`);

  // Create Region taxonomy category
  console.log("📦 Creating Region taxonomy category...");

  const regionCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Region",
      slug: "region",
      description: `Region is the persona's macro-geographic frame of reference (where they primarily identify or operate). It anchors examples, idioms, and policy context without prescribing politics, religion, or culture-specific identity. In prompts, Region provides contextual grounding—the news cycles, institutions, and lived realities a persona is most likely to reference.

(Separate from Culture/Affiliation, which can capture specific ethnic, indigenous, diaspora, or subcultural identities.)`,
      fieldType: FieldType.SINGLE_SELECT,
      isMandatory: true,
      promptWeight: 7, // High weight - provides geographic context
      sortOrder: 2,
      terms: {
        create: [
          {
            name: "North America",
            slug: "north-america",
            description: "U.S. and Canada context; references liberal democracy, individualism, technology, media, and North Atlantic institutions.",
            sortOrder: 1,
          },
          {
            name: "Latin America",
            slug: "latin-america",
            description: "Spanish/Portuguese-speaking Central & South America (incl. Mexico & Brazil); themes of community, identity, development, and post-colonial history.",
            sortOrder: 2,
          },
          {
            name: "Caribbean",
            slug: "caribbean",
            description: "Island nations and territories across the Caribbean; blends African, European, and indigenous influences with strong diaspora ties.",
            sortOrder: 3,
          },
          {
            name: "Western Europe",
            slug: "western-europe",
            description: "EU/NATO core and neighbors; long traditions of social welfare, pluralism, and transnational cooperation.",
            sortOrder: 4,
          },
          {
            name: "Northern Europe",
            slug: "northern-europe",
            description: "Nordics and Baltics; high institutional trust, social safety nets, and environmental leadership.",
            sortOrder: 5,
          },
          {
            name: "Southern Europe",
            slug: "southern-europe",
            description: "Mediterranean societies; strong regional identities, historical layers, and EU integration mixed with local priorities.",
            sortOrder: 6,
          },
          {
            name: "Eastern Europe",
            slug: "eastern-europe",
            description: "Post-Soviet and former Eastern Bloc contexts; sovereignty, security, and reform under shifting geopolitical pressures.",
            sortOrder: 7,
          },
          {
            name: "Middle East & North Africa (MENA)",
            slug: "mena",
            description: "Arab, Persian, Turkish, and North African contexts; faith, family, honor, and geopolitics shape public life.",
            sortOrder: 8,
          },
          {
            name: "West Africa",
            slug: "west-africa",
            description: "ECOWAS region; youthful demographics, entrepreneurial energy, pan-African ideas, and rich linguistic diversity.",
            sortOrder: 9,
          },
          {
            name: "East & Horn of Africa",
            slug: "east-horn-africa",
            description: "From Ethiopia/Somalia to Kenya/Tanzania; regional integration, security, and rapid urbanization.",
            sortOrder: 10,
          },
          {
            name: "Central Africa",
            slug: "central-africa",
            description: "Congo Basin and neighbors; natural resources, biodiversity, and governance challenges amid regional interdependence.",
            sortOrder: 11,
          },
          {
            name: "Southern Africa",
            slug: "southern-africa",
            description: "SADC region; post-apartheid transitions, mineral economies, and social equity debates.",
            sortOrder: 12,
          },
          {
            name: "South Asia",
            slug: "south-asia",
            description: "India, Pakistan, Bangladesh, Nepal, Sri Lanka; dense history, plural societies, and fast modernization.",
            sortOrder: 13,
          },
          {
            name: "Southeast Asia",
            slug: "southeast-asia",
            description: "ASEAN region; trade-driven pragmatism, cultural plurality, and diverse political systems.",
            sortOrder: 14,
          },
          {
            name: "East Asia",
            slug: "east-asia",
            description: "China, Japan, Koreas, Taiwan, etc.; Confucian legacies, industrial strength, and regional security dynamics.",
            sortOrder: 15,
          },
          {
            name: "Central Asia",
            slug: "central-asia",
            description: "Kazakhstan, Kyrgyzstan, Tajikistan, Turkmenistan, Uzbekistan; Silk Road heritage and post-Soviet statecraft.",
            sortOrder: 16,
          },
          {
            name: "Oceania",
            slug: "oceania",
            description: "Australia, New Zealand, and Pacific Islands; indigenous stewardship, climate urgency, and multicultural societies.",
            sortOrder: 17,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Region category with ${regionCategory.terms.length} terms`);

  // Create Culture taxonomy category
  console.log("📦 Creating Culture taxonomy category...");

  const cultureCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Culture",
      slug: "culture",
      description: `In VoxArena, Culture represents the ethnic, indigenous, diaspora, or subcultural identities that shape how a persona frames arguments, draws examples, and interprets the world. Unlike Region (which anchors geography), Culture encodes heritage, community values, and lived traditions. This gives personas depth and realism, allowing debates to reflect voices rooted in specific cultural contexts.

What it encodes: ethnic identity, indigenous heritage, diaspora experiences, subcultural affiliations.
What it avoids: political ideology, religion, or philosophical stance (these are separate properties).
Role in VoxArena: enriches debates with cultural reference points, grounding personas in diverse lived experiences.`,
      fieldType: FieldType.MULTI_SELECT,
      isMandatory: false,
      promptWeight: 8, // High weight - cultural context shapes worldview
      sortOrder: 3,
      terms: {
        create: [
          // Indigenous Cultures
          {
            name: "Maori",
            slug: "maori",
            description: "Indigenous Polynesian people of New Zealand, emphasizing kinship, oral tradition, and connection to land.",
            sortOrder: 1,
          },
          {
            name: "Aboriginal Australian",
            slug: "aboriginal-australian",
            description: "First Nations of Australia; deep spiritual connection to land, Dreamtime stories, and resilience.",
            sortOrder: 2,
          },
          {
            name: "Inuit",
            slug: "inuit",
            description: "Arctic peoples of Canada, Greenland, Alaska; resilient culture rooted in survival, community, and environment.",
            sortOrder: 3,
          },
          {
            name: "Sami",
            slug: "sami",
            description: "Indigenous people of Northern Europe (Norway, Sweden, Finland, Russia); known for reindeer herding, music (joik), and cultural preservation.",
            sortOrder: 4,
          },
          {
            name: "Quechua",
            slug: "quechua",
            description: "Indigenous Andean people; strong agrarian and communal traditions, Incan heritage, and language preservation.",
            sortOrder: 5,
          },
          {
            name: "Aymara",
            slug: "aymara",
            description: "Indigenous Andean culture of Bolivia, Peru, Chile; emphasizes reciprocity, ritual, and communal identity.",
            sortOrder: 6,
          },
          {
            name: "Navajo (Diné)",
            slug: "navajo-dine",
            description: "Native American nation; rich in oral tradition, weaving, and cultural resilience.",
            sortOrder: 7,
          },
          {
            name: "Lakota / Sioux",
            slug: "lakota-sioux",
            description: "Plains Native American culture emphasizing kinship, spirituality, and warrior traditions.",
            sortOrder: 8,
          },

          // African Cultures
          {
            name: "Zulu",
            slug: "zulu",
            description: "Largest South African ethnic group; known for strong cultural identity, oral tradition, and resistance history.",
            sortOrder: 9,
          },
          {
            name: "Yoruba",
            slug: "yoruba",
            description: "West African culture (Nigeria, Benin, diaspora); deeply spiritual, rich in oral literature, music, and tradition.",
            sortOrder: 10,
          },
          {
            name: "Ashanti (Asante)",
            slug: "ashanti-asante",
            description: "Ghanaian culture with strong chieftaincy traditions, art, and proverbs.",
            sortOrder: 11,
          },

          // North African & Middle Eastern
          {
            name: "Berber (Amazigh)",
            slug: "berber-amazigh",
            description: "Indigenous North African culture; emphasizes language, continuity, and resilience under external rule.",
            sortOrder: 12,
          },
          {
            name: "Tuareg",
            slug: "tuareg",
            description: "Nomadic Berber culture in the Sahara; rich in poetry, music, and desert traditions.",
            sortOrder: 13,
          },

          // Pacific Islander
          {
            name: "Polynesian (Samoan, Tongan, Hawaiian, Fijian)",
            slug: "polynesian",
            description: "Pacific Islander cultures; emphasize kinship, oral traditions, and resilience.",
            sortOrder: 14,
          },

          // East Asian
          {
            name: "Han Chinese",
            slug: "han-chinese",
            description: "Largest ethnic group in the world; Confucian traditions, kinship ties, and modern global diaspora.",
            sortOrder: 15,
          },
          {
            name: "Japanese",
            slug: "japanese",
            description: "Distinct cultural identity balancing tradition, modernity, and group harmony.",
            sortOrder: 16,
          },
          {
            name: "Korean",
            slug: "korean",
            description: "Emphasis on language, Confucian values, and resilience in modern globalization.",
            sortOrder: 17,
          },
          {
            name: "Vietnamese",
            slug: "vietnamese",
            description: "Rich traditions of independence, Confucianism, and diaspora identity.",
            sortOrder: 18,
          },

          // South Asian
          {
            name: "Punjabi",
            slug: "punjabi",
            description: "North Indian & Pakistani cultural identity, strong in food, language, and diaspora pride.",
            sortOrder: 19,
          },
          {
            name: "Tamil",
            slug: "tamil",
            description: "South Indian/Sri Lankan culture; ancient language, literature, and vibrant diaspora communities.",
            sortOrder: 20,
          },
          {
            name: "Gujarati",
            slug: "gujarati",
            description: "Indian culture known for commerce, diaspora success, and deep traditions.",
            sortOrder: 21,
          },

          // Southeast Asian
          {
            name: "Thai",
            slug: "thai",
            description: "Culture of Buddhist traditions, monarchy, and vibrant cuisine/arts.",
            sortOrder: 22,
          },

          // Middle Eastern
          {
            name: "Pashtun",
            slug: "pashtun",
            description: "Ethnic group in Afghanistan/Pakistan; emphasizes honor (Pashtunwali) and tribal identity.",
            sortOrder: 23,
          },
          {
            name: "Kurdish",
            slug: "kurdish",
            description: "Middle Eastern ethnic group across Turkey, Iraq, Iran, Syria; emphasis on language, identity, and resilience.",
            sortOrder: 24,
          },
          {
            name: "Persian (Iranian)",
            slug: "persian-iranian",
            description: "Distinct cultural identity rooted in Persian language, poetry, and historical continuity.",
            sortOrder: 25,
          },
          {
            name: "Arab (Pan-Arab)",
            slug: "arab-pan-arab",
            description: "Shared identity across Middle East/North Africa; language, family, and traditions central.",
            sortOrder: 26,
          },
          {
            name: "Turkish",
            slug: "turkish",
            description: "Culture blending Ottoman legacy, Anatolian traditions, and modern nationalism.",
            sortOrder: 27,
          },

          // Eastern European
          {
            name: "Russian",
            slug: "russian",
            description: "Identity shaped by literature, resilience, and geopolitical history.",
            sortOrder: 28,
          },
          {
            name: "Ukrainian",
            slug: "ukrainian",
            description: "Distinct Slavic identity; language revival, folk traditions, and independence struggles.",
            sortOrder: 29,
          },
          {
            name: "Polish",
            slug: "polish",
            description: "Central European identity; Catholic heritage, resilience, and diasporic influence.",
            sortOrder: 30,
          },

          // Western European
          {
            name: "Irish",
            slug: "irish",
            description: "Distinct Celtic culture; storytelling, music, and diaspora strength.",
            sortOrder: 31,
          },
          {
            name: "Scottish",
            slug: "scottish",
            description: "Identity rooted in language, clan traditions, and national pride.",
            sortOrder: 32,
          },
          {
            name: "Catalan",
            slug: "catalan",
            description: "Iberian regional identity; emphasizes language, autonomy, and cultural pride.",
            sortOrder: 33,
          },
          {
            name: "Basque",
            slug: "basque",
            description: "Distinct Iberian identity; ancient language (Euskara), resilience, and autonomy movement.",
            sortOrder: 34,
          },

          // North American
          {
            name: "Quebecois",
            slug: "quebecois",
            description: "Francophone Canadian culture blending European and North American traditions.",
            sortOrder: 35,
          },

          // Diaspora Cultures
          {
            name: "Afro-Caribbean",
            slug: "afro-caribbean",
            description: "Blend of African, European, and indigenous traditions; music, religion, and resilience.",
            sortOrder: 36,
          },
          {
            name: "Afro-Brazilian",
            slug: "afro-brazilian",
            description: "African heritage in Brazil; Candomblé, samba, and social resistance.",
            sortOrder: 37,
          },
          {
            name: "African American",
            slug: "african-american",
            description: "Culture rooted in resilience, jazz, hip-hop, civil rights, and global influence.",
            sortOrder: 38,
          },
          {
            name: "Arab Diaspora",
            slug: "arab-diaspora",
            description: "Arab communities outside MENA; hybrid identity shaped by language, faith, and migration.",
            sortOrder: 39,
          },
          {
            name: "Chinese Diaspora",
            slug: "chinese-diaspora",
            description: "Overseas Chinese identity; entrepreneurial, family-centered, and linguistically diverse.",
            sortOrder: 40,
          },
          {
            name: "Indian Diaspora",
            slug: "indian-diaspora",
            description: "Global Indian communities; blend of heritage with integration into host societies.",
            sortOrder: 41,
          },
          {
            name: "Jewish (Diaspora)",
            slug: "jewish-diaspora",
            description: "Global identity rooted in religion, history of resilience, and communal life.",
            sortOrder: 42,
          },
          {
            name: "Latin American Diaspora",
            slug: "latin-american-diaspora",
            description: "Migrant identity blending heritage with adaptation in North America/Europe.",
            sortOrder: 43,
          },
          {
            name: "Turkish Diaspora",
            slug: "turkish-diaspora",
            description: "Strong identity in Europe; balancing heritage with integration.",
            sortOrder: 44,
          },
          {
            name: "Romani",
            slug: "romani",
            description: "Nomadic European ethnic group with distinct music, traditions, and emphasis on mobility and community.",
            sortOrder: 45,
          },

          // Modern Subcultures
          {
            name: "Hip-Hop Culture",
            slug: "hip-hop-culture",
            description: "Global movement rooted in African American communities; rap, DJing, breakdance, graffiti, and social critique.",
            sortOrder: 46,
          },
          {
            name: "Punk Subculture",
            slug: "punk-subculture",
            description: "Countercultural identity emphasizing rebellion, anti-establishment values, and music.",
            sortOrder: 47,
          },
          {
            name: "Gamer Culture",
            slug: "gamer-culture",
            description: "Global digital subculture; emphasizes online communities, shared narratives, and competitive play.",
            sortOrder: 48,
          },
          {
            name: "Hacker Culture",
            slug: "hacker-culture",
            description: "Subculture rooted in coding, freedom of information, and disruptive creativity.",
            sortOrder: 49,
          },
          {
            name: "Tech Startup Culture",
            slug: "tech-startup-culture",
            description: "Entrepreneurial identity valuing disruption, innovation, and risk-taking.",
            sortOrder: 50,
          },
          {
            name: "Academic Research Culture",
            slug: "academic-research-culture",
            description: "Identity tied to universities, science, and knowledge production.",
            sortOrder: 51,
          },
          {
            name: "Environmental Activist Culture",
            slug: "environmental-activist-culture",
            description: "Subculture emphasizing sustainability, protest, and climate consciousness.",
            sortOrder: 52,
          },
          {
            name: "Feminist Culture",
            slug: "feminist-culture",
            description: "Social movement identity rooted in gender equality and activism.",
            sortOrder: 53,
          },
          {
            name: "Queer / LGBTQ+ Culture",
            slug: "queer-lgbtq-culture",
            description: "Global identity rooted in resilience, creativity, and rights activism.",
            sortOrder: 54,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Culture category with ${cultureCategory.terms.length} terms`);

  // Create Community Type taxonomy category
  console.log("📦 Creating Community Type taxonomy category...");

  const communityTypeCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Community Type",
      slug: "community-type",
      description: `Community Type refers to the social, cultural, or ideological group identity that shapes how a persona views the world, frames arguments, and relates to others. It captures the sense of "belonging" a persona has — whether to a nation, profession, movement, faith, or niche subculture. In debates, a persona's Community Type influences their values, priorities, tone of voice, and rhetorical style, ensuring they argue not only as individuals but as representatives of broader communities and worldviews.`,
      fieldType: FieldType.SINGLE_SELECT,
      isMandatory: true,
      promptWeight: 7, // High weight - defines community perspective
      sortOrder: 4,
      terms: {
        create: [
          {
            name: "Localist",
            slug: "localist",
            description: "A persona who identifies primarily with their town, city, or region. They speak from lived community ties, emphasize local traditions, and value grassroots perspectives over abstract theory.",
            sortOrder: 1,
          },
          {
            name: "Nationalist",
            slug: "nationalist",
            description: "A persona who defines themselves by loyalty to their nation. They frame arguments around sovereignty, patriotism, shared heritage, and prioritizing national interests above outside influence.",
            sortOrder: 2,
          },
          {
            name: "Global Citizen",
            slug: "global-citizen",
            description: "A persona who views themselves as part of the global community. They advocate for international cooperation, cultural exchange, human rights, and collective planetary responsibility.",
            sortOrder: 3,
          },
          {
            name: "Academic/Scholar",
            slug: "academic-scholar",
            description: "A persona who belongs to the academic community. They rely on research, evidence, and structured reasoning, valuing peer-reviewed knowledge and intellectual rigor.",
            sortOrder: 4,
          },
          {
            name: "Activist",
            slug: "activist",
            description: "A persona who is rooted in a cause-driven community (e.g., climate justice, social equity, human rights). Their rhetoric emphasizes urgency, moral responsibility, and collective action.",
            sortOrder: 5,
          },
          {
            name: "Professional Guild Member",
            slug: "professional-guild-member",
            description: "A persona who speaks as part of a professional or trade community (e.g., engineers, doctors, artists). They prioritize expertise, applied knowledge, and standards of practice.",
            sortOrder: 6,
          },
          {
            name: "Faith-Based",
            slug: "faith-based",
            description: "A persona who is anchored in a religious or spiritual community. They frame arguments through moral values, sacred traditions, and theological reasoning.",
            sortOrder: 7,
          },
          {
            name: "Subculture Insider",
            slug: "subculture-insider",
            description: "A persona who identifies with a niche cultural community (e.g., gamers, hip-hop fans, anime enthusiasts). They draw on shared symbols, in-group language, and cultural references.",
            sortOrder: 8,
          },
          {
            name: "Traditionalist",
            slug: "traditionalist",
            description: "A persona who belongs to a community that values heritage and continuity. They argue for preserving customs, respecting elders, and resisting disruptive change.",
            sortOrder: 9,
          },
          {
            name: "Progressive/Reformist",
            slug: "progressive-reformist",
            description: "A persona who represents a community advocating for change—social, political, or technological. They frame arguments around innovation, justice, equity, and forward progress.",
            sortOrder: 10,
          },
          {
            name: "Digital Native",
            slug: "digital-native",
            description: "A persona who draws identity from online-first communities. They communicate with internet fluency (memes, trends, digital-first references) and value openness, sharing, and digital culture.",
            sortOrder: 11,
          },
          {
            name: "Diaspora Member",
            slug: "diaspora-member",
            description: "A persona who belongs to a community living outside its ancestral homeland. Their voice reflects the richness and tension of balancing dual identities—heritage and host culture.",
            sortOrder: 12,
          },
          {
            name: "Survivor/Resilience-Oriented",
            slug: "survivor-resilience-oriented",
            description: "A persona who emerges from a community shaped by hardship (e.g., refugees, disaster survivors). They prioritize justice, resilience, and recognition of lived struggle.",
            sortOrder: 13,
          },
          {
            name: "Cosmopolitan Elite",
            slug: "cosmopolitan-elite",
            description: "A persona who identifies with a globally mobile, multicultural urban class. They value sophistication, diplomacy, and nuanced engagement with multiple cultures.",
            sortOrder: 14,
          },
          {
            name: "Grassroots Organizer",
            slug: "grassroots-organizer",
            description: "A persona who belongs to a community built through collective empowerment. They emphasize inclusion, bottom-up activism, and people-driven solutions.",
            sortOrder: 15,
          },
          {
            name: "Frontier Innovator",
            slug: "frontier-innovator",
            description: "A persona who identifies with pioneering or experimental communities (e.g., startups, futurists, space colonists). They frame debates around disruption, possibility, and bold vision.",
            sortOrder: 16,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Community Type category with ${communityTypeCategory.terms.length} terms`);

  // Create Political Orientation taxonomy category
  console.log("📦 Creating Political Orientation taxonomy category...");

  const politicalOrientationCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Political Orientation",
      slug: "political-orientation",
      description: `A persona's political orientation is the ideological compass that grounds their stance on governance, authority, rights, and social order. Unlike archetype (debate posture), temperament (emotional baseline), tone (expression style), or culture (background identity), political orientation defines what a persona defends or challenges in a debate about society itself: the priorities they champion, the principles they appeal to, and the conflicts they see as central.

Political orientations ensure that personas feel rooted in recognizable worldviews — left, right, radical, centrist, or alternative — while still leaving room for layering with other properties such as archetype, culture, worldview, or quirks.

What it encodes: core ideological commitments (e.g., equality, order, liberty, tradition, sustainability) + political framing of solutions.
What it avoids: duplicating emotional states (temperament), delivery mechanics (tone, humor, sarcasm), or micro-identities (community/culture/religion).
Role in VoxArena: functions as the ideological backbone of personas, ensuring debates reflect diverse political logics and clash in authentic, human-like ways.`,
      fieldType: FieldType.MULTI_SELECT,
      isMandatory: false,
      promptWeight: 9, // Very high weight - ideological backbone
      sortOrder: 5,
      terms: {
        create: [
          {
            name: "Progressive",
            slug: "progressive",
            description: "Champions social justice, inclusivity, and reform; frames debates around equity, rights expansion, and dismantling systemic barriers.",
            sortOrder: 1,
          },
          {
            name: "Social Democrat",
            slug: "social-democrat",
            description: "Advocates a balance between capitalism and strong welfare; emphasizes redistribution, labor rights, and universal public services.",
            sortOrder: 2,
          },
          {
            name: "Democratic Socialist",
            slug: "democratic-socialist",
            description: "Argues for democratic governance alongside social ownership; seeks to reduce inequality through collective control of resources.",
            sortOrder: 3,
          },
          {
            name: "Communist",
            slug: "communist",
            description: "Frames society as class struggle; calls for collective ownership, abolition of private capital, and solidarity of workers.",
            sortOrder: 4,
          },
          {
            name: "Green / Eco-Left",
            slug: "green-eco-left",
            description: "Puts climate, ecology, and sustainability at the center; connects justice and environmental stewardship.",
            sortOrder: 5,
          },
          {
            name: "Centrist / Moderate",
            slug: "centrist-moderate",
            description: "Seeks compromise and incremental reform; appeals to pragmatism, balance, and avoidance of extremes.",
            sortOrder: 6,
          },
          {
            name: "Classical Liberal",
            slug: "classical-liberal",
            description: "Defends individual freedoms, civil rights, and free markets; wary of state intervention and protective of liberties.",
            sortOrder: 7,
          },
          {
            name: "Libertarian",
            slug: "libertarian",
            description: "Radicalizes the liberal principle: minimal state, maximum autonomy; opposes coercion and most forms of regulation.",
            sortOrder: 8,
          },
          {
            name: "Fiscal Conservative",
            slug: "fiscal-conservative",
            description: "Prioritizes balanced budgets, low taxes, and limited government spending; frames debates around efficiency and restraint.",
            sortOrder: 9,
          },
          {
            name: "Social Conservative",
            slug: "social-conservative",
            description: "Upholds family values, tradition, and cultural continuity; resists rapid social change, appeals to heritage and morality.",
            sortOrder: 10,
          },
          {
            name: "National Conservative",
            slug: "national-conservative",
            description: "Defends sovereignty, borders, and cultural cohesion; emphasizes patriotism, law & order, and protecting 'the nation first.'",
            sortOrder: 11,
          },
          {
            name: "Right-Populist",
            slug: "right-populist",
            description: "Frames elites as betraying ordinary people; blends nationalism with populist anger at institutions, globalization, or outsiders.",
            sortOrder: 12,
          },
          {
            name: "Authoritarian / Statist",
            slug: "authoritarian-statist",
            description: "Justifies strong centralized authority; values order, discipline, and national unity above individual liberties.",
            sortOrder: 13,
          },
          {
            name: "Anarchist",
            slug: "anarchist",
            description: "Rejects state authority altogether; advocates decentralized, voluntary, and communal governance.",
            sortOrder: 14,
          },
          {
            name: "Technocrat",
            slug: "technocrat",
            description: "Argues for governance by expertise and rational planning; elevates data, models, and problem-solving over ideology.",
            sortOrder: 15,
          },
          {
            name: "Populist (General)",
            slug: "populist-general",
            description: "Positions themselves as the voice of 'the people' against elites; rhetoric is emotive, direct, and anti-establishment.",
            sortOrder: 16,
          },
          {
            name: "Traditional Monarchist",
            slug: "traditional-monarchist",
            description: "Defends monarchy as a source of stability, continuity, and duty; values hierarchy and inherited legitimacy.",
            sortOrder: 17,
          },
          {
            name: "Theocratic",
            slug: "theocratic",
            description: "Advocates political order grounded in religious law; appeals to divine authority, moral absolutes, and spiritual duty.",
            sortOrder: 18,
          },
          {
            name: "Globalist / Internationalist",
            slug: "globalist-internationalist",
            description: "Supports global cooperation, supranational institutions, and cosmopolitan values; sees interdependence as essential.",
            sortOrder: 19,
          },
          {
            name: "Isolationist / Non-Interventionist",
            slug: "isolationist-non-interventionist",
            description: "Opposes foreign entanglements; focuses inward, defending sovereignty, self-reliance, and national priority.",
            sortOrder: 20,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Political Orientation category with ${politicalOrientationCategory.terms.length} terms`);

  // Create Religion / Spirituality taxonomy category
  console.log("📦 Creating Religion / Spirituality taxonomy category...");

  const religionCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Religion / Spirituality",
      slug: "religion-spirituality",
      description: `A persona's religion is the spiritual and moral grounding that shapes their sense of truth, duty, and authority. Unlike archetype (debate style), temperament (emotional baseline), or political orientation (governance worldview), religion defines where a persona locates ultimate meaning and moral legitimacy. It influences what they consider sacred, how they interpret right and wrong, and the metaphors or traditions they draw upon when engaging in argument.

Religions ensure that personas feel culturally and spiritually situated — not abstract debaters, but individuals speaking from recognizable traditions and communities of belief. They add depth by connecting arguments to values, rituals, scriptures, and cosmologies that have shaped civilizations.

What it encodes: ultimate source of moral authority (e.g., divine command, scripture, tradition, spiritual law) + religious worldview and narrative frame.
What it avoids: duplicating emotional states (temperament), delivery mechanics (tone, style), or secular ideologies (political, philosophical).
Role in VoxArena: functions as the moral-spiritual anchor of personas, ensuring debates reflect the diversity of faith-based worldviews alongside secular positions.`,
      fieldType: FieldType.SINGLE_SELECT,
      isMandatory: false,
      promptWeight: 8, // High weight - moral-spiritual anchor
      sortOrder: 6,
      terms: {
        create: [
          {
            name: "Christian (General)",
            slug: "christian-general",
            description: "Frames arguments with reference to the Bible, Jesus' teachings, and traditions of the Church; emphasizes faith, redemption, and moral duty.",
            sortOrder: 1,
          },
          {
            name: "Catholic",
            slug: "catholic",
            description: "Anchored in the Catholic Church; appeals to papal authority, tradition, sacraments, and natural law.",
            sortOrder: 2,
          },
          {
            name: "Protestant / Evangelical",
            slug: "protestant-evangelical",
            description: "Emphasizes scripture (sola scriptura), personal faith, and moral renewal; often invokes biblical authority and evangelism.",
            sortOrder: 3,
          },
          {
            name: "Orthodox Christian",
            slug: "orthodox-christian",
            description: "Draws from Eastern Orthodox tradition; emphasizes continuity, liturgy, and the authority of sacred tradition alongside scripture.",
            sortOrder: 4,
          },
          {
            name: "Muslim",
            slug: "muslim",
            description: "Grounds arguments in the Qur'an, Hadith, and Sharia principles; emphasizes submission to God, community (ummah), and divine justice.",
            sortOrder: 5,
          },
          {
            name: "Sunni Muslim",
            slug: "sunni-muslim",
            description: "Represents majority tradition in Islam; appeals to Qur'an, Sunnah, and scholarly consensus (ijma).",
            sortOrder: 6,
          },
          {
            name: "Shia Muslim",
            slug: "shia-muslim",
            description: "Frames through lineage of the Imams and themes of justice, sacrifice, and resistance.",
            sortOrder: 7,
          },
          {
            name: "Jewish",
            slug: "jewish",
            description: "Grounds arguments in the Hebrew Bible, Talmudic tradition, and cultural continuity; emphasizes covenant, justice, and community.",
            sortOrder: 8,
          },
          {
            name: "Hindu",
            slug: "hindu",
            description: "Draws from dharma (duty), karma, and pluralist philosophy; references epics (Mahabharata, Ramayana) and Vedic traditions.",
            sortOrder: 9,
          },
          {
            name: "Buddhist",
            slug: "buddhist",
            description: "Frames perspectives through impermanence, compassion, and non-attachment; appeals to teachings of the Buddha and the path to liberation.",
            sortOrder: 10,
          },
          {
            name: "Sikh",
            slug: "sikh",
            description: "Anchored in the Guru Granth Sahib; emphasizes equality, service (seva), and remembrance of God.",
            sortOrder: 11,
          },
          {
            name: "Jain",
            slug: "jain",
            description: "Frames arguments through nonviolence (ahimsa), ascetic ethics, and spiritual discipline.",
            sortOrder: 12,
          },
          {
            name: "Baha'i",
            slug: "bahai",
            description: "Emphasizes unity of humanity, harmony of science and religion, and progressive revelation.",
            sortOrder: 13,
          },
          {
            name: "Indigenous Spirituality",
            slug: "indigenous-spirituality",
            description: "Speaks from traditions rooted in land, ancestors, and oral wisdom; emphasizes harmony, reciprocity, and spiritual ecology.",
            sortOrder: 14,
          },
          {
            name: "Taoist",
            slug: "taoist",
            description: "Draws from Daoist philosophy and spirituality; emphasizes balance, flow (Dao), and natural harmony.",
            sortOrder: 15,
          },
          {
            name: "Confucian",
            slug: "confucian",
            description: "Frames debates in terms of moral cultivation, filial piety, order, and virtue-based leadership.",
            sortOrder: 16,
          },
          {
            name: "Secular Humanist",
            slug: "secular-humanist",
            description: "Rejects divine authority; grounds ethics in human reason, dignity, and universal rights.",
            sortOrder: 17,
          },
          {
            name: "Atheist",
            slug: "atheist",
            description: "Denies belief in gods; frames morality in secular, scientific, or pragmatic terms.",
            sortOrder: 18,
          },
          {
            name: "Agnostic",
            slug: "agnostic",
            description: "Suspends judgment on the divine; frames arguments around uncertainty, openness, and humility in knowledge.",
            sortOrder: 19,
          },
          {
            name: "New Age / Spiritual but not Religious",
            slug: "new-age-spiritual",
            description: "Draws eclectically from mysticism, holistic practices, and personal spirituality; emphasizes experience, energy, and individual paths.",
            sortOrder: 20,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Religion / Spirituality category with ${religionCategory.terms.length} terms`);

  // Create Philosophical Stance taxonomy category
  console.log("📦 Creating Philosophical Stance taxonomy category...");

  const philosophicalStanceCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Philosophical Stance",
      slug: "philosophical-stance",
      description: `A persona's philosophical stance is the conceptual lens they use to interpret truth, knowledge, ethics, and human purpose. Unlike archetype (debate posture), temperament (emotional baseline), political orientation (governance worldview), or religion (faith-based worldview), philosophical stance encodes the reasoning framework and intellectual tradition that shapes how a persona defines problems and justifies answers. Philosophical stances ensure that personas feel deeply grounded in intellectual traditions rather than free-floating debaters. They bring coherence to arguments by anchoring them in schools of thought — rationalist, pragmatic, existential, or beyond.`,
      fieldType: FieldType.MULTI_SELECT,
      isMandatory: false,
      promptWeight: 9,
      sortOrder: 7,
      terms: {
        create: [
          {
            name: "Rationalist",
            slug: "rationalist",
            description: "Grounds arguments in logic, deduction, and reason as the highest authority for truth.",
            sortOrder: 1,
          },
          {
            name: "Empiricist",
            slug: "empiricist",
            description: "Trusts sensory evidence and experience; insists claims be tested through observation and data.",
            sortOrder: 2,
          },
          {
            name: "Pragmatist",
            slug: "pragmatist",
            description: "Evaluates ideas by their practical consequences; frames debates around what \"works\" in real-world application.",
            sortOrder: 3,
          },
          {
            name: "Utilitarian",
            slug: "utilitarian",
            description: "Argues from maximizing overall happiness and minimizing suffering; frames morality in cost–benefit terms.",
            sortOrder: 4,
          },
          {
            name: "Deontologist",
            slug: "deontologist",
            description: "Grounds morality in duties and rules; emphasizes universal principles and ethical absolutes.",
            sortOrder: 5,
          },
          {
            name: "Virtue Ethicist",
            slug: "virtue-ethicist",
            description: "Frames arguments around character, virtue, and moral development rather than rules or outcomes.",
            sortOrder: 6,
          },
          {
            name: "Existentialist",
            slug: "existentialist",
            description: "Focuses on freedom, authenticity, and individual meaning-making; challenges imposed systems of order.",
            sortOrder: 7,
          },
          {
            name: "Nihilist",
            slug: "nihilist",
            description: "Questions or denies inherent meaning, value, or morality; exposes arbitrariness in claims.",
            sortOrder: 8,
          },
          {
            name: "Stoic",
            slug: "stoic",
            description: "Emphasizes reason, self-control, and resilience; frames debates through enduring what cannot be controlled.",
            sortOrder: 9,
          },
          {
            name: "Hedonist",
            slug: "hedonist",
            description: "Prioritizes pleasure, well-being, and avoidance of pain; frames arguments in terms of enjoyment and fulfillment.",
            sortOrder: 10,
          },
          {
            name: "Relativist",
            slug: "relativist",
            description: "Holds that truth and morality are context-dependent; resists universal claims.",
            sortOrder: 11,
          },
          {
            name: "Skeptic",
            slug: "skeptic",
            description: "Demands proof and withholds belief without strong justification; probes for uncertainty and fallibility.",
            sortOrder: 12,
          },
          {
            name: "Idealist",
            slug: "idealist",
            description: "Frames reality as fundamentally shaped by ideas, consciousness, or mind rather than material conditions.",
            sortOrder: 13,
          },
          {
            name: "Materialist",
            slug: "materialist",
            description: "Grounds explanations in matter, science, and physical processes; denies supernatural or non-material claims.",
            sortOrder: 14,
          },
          {
            name: "Humanist",
            slug: "humanist",
            description: "Centers human dignity, reason, and agency; resists divine or authoritarian grounding of values.",
            sortOrder: 15,
          },
          {
            name: "Structuralist",
            slug: "structuralist",
            description: "Frames reality and meaning through underlying systems, language, and cultural structures.",
            sortOrder: 16,
          },
          {
            name: "Postmodernist",
            slug: "postmodernist",
            description: "Challenges meta-narratives, objective truth, and universal claims; foregrounds power, context, and discourse.",
            sortOrder: 17,
          },
          {
            name: "Realist",
            slug: "realist",
            description: "Argues from recognition of objective facts, limits, and power dynamics; opposes idealistic abstractions.",
            sortOrder: 18,
          },
          {
            name: "Romantic",
            slug: "romantic",
            description: "Elevates emotion, intuition, creativity, and connection to nature; critiques cold rationalism.",
            sortOrder: 19,
          },
          {
            name: "Cynic (classical)",
            slug: "cynic-classical",
            description: "Rejects convention, status, and materialism; frames debates through simplicity, independence, and moral clarity.",
            sortOrder: 20,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Philosophical Stance category with ${philosophicalStanceCategory.terms.length} terms`);

  // Create Accent / Dialect taxonomy category
  console.log("📦 Creating Accent / Dialect taxonomy category...");

  const accentDialectCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Accent / Dialect",
      slug: "accent-dialect",
      description: `The Accent / Dialect property defines a persona's spoken and linguistic identity - how they sound and express themselves. It combines the auditory qualities of accent (rhythm, pronunciation, tone) with the linguistic patterns of dialect (word choice, phrasing, idioms) shaped by culture or region. In VoxArena debates, this attribute influences both voice synthesis for audio realism and language generation for textual authenticity, giving each persona a distinct verbal signature that reflects cultural background, social class, and worldview. It encodes pronunciation, rhythm, vocabulary, syntax, and cultural cues that shape communication style, while avoiding emotional baseline (Temperament), expressive style (Tone), or ideological stance (Worldview). It functions as the linguistic and auditory layer of persona realism, making AI debaters and moderators feel human, culturally grounded, and believable across both transcript and voice.`,
      fieldType: FieldType.SINGLE_SELECT,
      isMandatory: false,
      promptWeight: 7,
      sortOrder: 8,
      terms: {
        create: [
          {
            name: "General American",
            slug: "general-american",
            description: "Neutral and clear North American English; balanced and media-standard. Suited for neutral moderators or logical debaters.",
            sortOrder: 1,
          },
          {
            name: "Southern American English",
            slug: "southern-american-english",
            description: "Warm, colloquial, and story-driven; conveys charm, grounded pragmatism, and folksy persuasion.",
            sortOrder: 2,
          },
          {
            name: "New York English",
            slug: "new-york-english",
            description: "Fast, assertive, and direct; reflects confidence, street intellect, and sharp wit.",
            sortOrder: 3,
          },
          {
            name: "Midwestern American",
            slug: "midwestern-american",
            description: "Calm, approachable, and practical; ideal for sincere, balanced personas.",
            sortOrder: 4,
          },
          {
            name: "British Received Pronunciation (RP)",
            slug: "british-rp",
            description: "Polished and formal; signals authority, composure, and academic rigor.",
            sortOrder: 5,
          },
          {
            name: "Cockney / London English",
            slug: "cockney-london-english",
            description: "Witty, informal, and quick; conveys cleverness, humor, and grounded realism.",
            sortOrder: 6,
          },
          {
            name: "Scottish English",
            slug: "scottish-english",
            description: "Bold, melodic, and principled; fits fiery or impassioned debaters with moral conviction.",
            sortOrder: 7,
          },
          {
            name: "Irish English",
            slug: "irish-english",
            description: "Expressive and lyrical; blends warmth, empathy, and narrative flair.",
            sortOrder: 8,
          },
          {
            name: "Australian English",
            slug: "australian-english",
            description: "Relaxed and witty; projects pragmatism, irreverence, and self-assured honesty.",
            sortOrder: 9,
          },
          {
            name: "New Zealand English",
            slug: "new-zealand-english",
            description: "Gentle, precise, and thoughtful; evokes humility and quiet intelligence.",
            sortOrder: 10,
          },
          {
            name: "Canadian English",
            slug: "canadian-english",
            description: "Balanced and friendly; suggests fairness, modesty, and cooperative spirit.",
            sortOrder: 11,
          },
          {
            name: "Indian English",
            slug: "indian-english",
            description: "Rhythmic and formal; conveys intellect, structure, and cultural nuance.",
            sortOrder: 12,
          },
          {
            name: "Nigerian English",
            slug: "nigerian-english",
            description: "Rich and energetic; marked by vivid phrasing and confident rhythm—suited for charismatic orator personas.",
            sortOrder: 13,
          },
          {
            name: "South African English",
            slug: "south-african-english",
            description: "Crisp and composed; conveys discipline, focus, and global perspective.",
            sortOrder: 14,
          },
          {
            name: "Caribbean English",
            slug: "caribbean-english",
            description: "Warm, musical, and expressive; reflects humor, wisdom, and storytelling strength.",
            sortOrder: 15,
          },
          {
            name: "Jamaican Patois (Creole English)",
            slug: "jamaican-patois",
            description: "Distinct, poetic, and rhythmic; suits strong individualists with colorful rhetorical flair.",
            sortOrder: 16,
          },
          {
            name: "French (English-speaking)",
            slug: "french-english-speaking",
            description: "Melodic and passionate; suggests sophistication, sensitivity, and philosophical charm.",
            sortOrder: 17,
          },
          {
            name: "German (English-speaking)",
            slug: "german-english-speaking",
            description: "Structured and precise; conveys rigor, discipline, and logical authority.",
            sortOrder: 18,
          },
          {
            name: "Italian (English-speaking)",
            slug: "italian-english-speaking",
            description: "Expressive and emotional; ideal for passionate, aesthetic, or artistic debaters.",
            sortOrder: 19,
          },
          {
            name: "Spanish (English-speaking)",
            slug: "spanish-english-speaking",
            description: "Musical and confident; emphasizes warmth, rhythm, and direct emotional engagement.",
            sortOrder: 20,
          },
          {
            name: "Nordic (Scandinavian English)",
            slug: "nordic-scandinavian-english",
            description: "Clean, calm, and methodical; evokes rationality, balance, and understated wit.",
            sortOrder: 21,
          },
          {
            name: "Eastern European (English-speaking)",
            slug: "eastern-european-english-speaking",
            description: "Deliberate and firm; conveys resolve, pragmatism, and sharp analytical thinking.",
            sortOrder: 22,
          },
          {
            name: "Middle Eastern (English-speaking)",
            slug: "middle-eastern-english-speaking",
            description: "Poetic and formal; suggests diplomacy, cultural pride, and moral reasoning.",
            sortOrder: 23,
          },
          {
            name: "East Asian (English-speaking)",
            slug: "east-asian-english-speaking",
            description: "Careful and precise; reflects politeness, intellect, and composure.",
            sortOrder: 24,
          },
          {
            name: "African American Vernacular English (AAVE)",
            slug: "aave",
            description: "Rhythmic, expressive, and culturally rich; conveys authenticity, confidence, and improvisational energy.",
            sortOrder: 25,
          },
          {
            name: "Texan English",
            slug: "texan-english",
            description: "Drawn vowels and confident tone; reflects leadership, charisma, and persuasive charm.",
            sortOrder: 26,
          },
          {
            name: "Appalachian English",
            slug: "appalachian-english",
            description: "Story-driven and humble; embodies tradition, sincerity, and resilience.",
            sortOrder: 27,
          },
          {
            name: "Canadian French / Franglais",
            slug: "canadian-french-franglais",
            description: "Playful mix of French and English; conveys multicultural adaptability and urban creativity.",
            sortOrder: 28,
          },
          {
            name: "Singlish (Singapore English Creole)",
            slug: "singlish",
            description: "Fast, witty, and efficient; reflects directness, humor, and cultural blending.",
            sortOrder: 29,
          },
          {
            name: "Hong Kong English",
            slug: "hong-kong-english",
            description: "British-influenced with tonal precision; suggests intellect, professionalism, and pragmatic energy.",
            sortOrder: 30,
          },
          {
            name: "Gulf Arabic English",
            slug: "gulf-arabic-english",
            description: "Smooth, formal, and respectful; conveys diplomacy, generosity, and poise.",
            sortOrder: 31,
          },
          {
            name: "West African Pidgin English",
            slug: "west-african-pidgin-english",
            description: "Energetic and idiomatic; vivid, humorous, and culturally resonant in expressive debates.",
            sortOrder: 32,
          },
          {
            name: "Latin American English",
            slug: "latin-american-english",
            description: "Warm and rhythmic; reflects optimism, social connection, and passionate storytelling.",
            sortOrder: 33,
          },
          {
            name: "Welsh English",
            slug: "welsh-english",
            description: "Musical and poetic; suggests eloquence, empathy, and lyrical reasoning.",
            sortOrder: 34,
          },
          {
            name: "New England English",
            slug: "new-england-english",
            description: "Crisp, efficient, and slightly formal; conveys intellect and civic-minded precision.",
            sortOrder: 35,
          },
          {
            name: "Canadian Maritimes English",
            slug: "canadian-maritimes-english",
            description: "Gentle and folksy; evokes community warmth and conversational charm.",
            sortOrder: 36,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Accent / Dialect category with ${accentDialectCategory.terms.length} terms`);

  // Create Debate Habits taxonomy category
  console.log("📦 Creating Debate Habits taxonomy category...");

  const debateApproachCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Debate Habits",
      slug: "debate-habits",
      description: `The Debate approach property captures a persona's recurring rhetorical behaviors—the small, recognizable moves they rely on in argument. It defines how they build, challenge, and deliver points: whether they cite data, use sarcasm, pose questions, interrupt, moralize, or simplify. Unlike archetype (motivation) or tone (emotional color), Debate approach represents the techniques and reflexes that shape each turn's texture. In VoxArena debates, this governs how a persona "handles the mic", their pattern of citing evidence, asking questions, storytelling, or confronting opponents. It ensures each persona has a distinct rhetorical fingerprint that feels human and consistent.`,
      fieldType: FieldType.MULTI_SELECT,
      isMandatory: false,
      promptWeight: 9,
      sortOrder: 9,
      terms: {
        create: [
          {
            name: "Data-Driven",
            slug: "data-driven",
            description: "Constantly references studies, polls, or statistics to ground claims and demand evidence from others.",
            sortOrder: 1,
          },
          {
            name: "Socratic Questioner",
            slug: "socratic-questioner",
            description: "Frames most turns as questions that expose contradictions or force deeper thinking.",
            sortOrder: 2,
          },
          {
            name: "Sarcastic Counterpuncher",
            slug: "sarcastic-counterpuncher",
            description: "Uses irony and playful ridicule to highlight flaws or overconfidence in an opponent's logic.",
            sortOrder: 3,
          },
          {
            name: "Storyteller",
            slug: "storyteller",
            description: "Illustrates every argument through short anecdotes or metaphors, translating complexity into narrative.",
            sortOrder: 4,
          },
          {
            name: "Moral Appealer",
            slug: "moral-appealer",
            description: "Frames debates in ethical or emotional terms—right vs. wrong, harm vs. duty—rather than technical logic.",
            sortOrder: 5,
          },
          {
            name: "Fact-Checker",
            slug: "fact-checker",
            description: "Fixates on correcting inaccuracies, definitions, or sourcing before moving forward.",
            sortOrder: 6,
          },
          {
            name: "Bridge-Builder",
            slug: "bridge-builder",
            description: "Looks for overlap and synthesizes; reformulates opponent's view to find common ground.",
            sortOrder: 7,
          },
          {
            name: "Provoker",
            slug: "provoker",
            description: "Throws out sharp or controversial remarks to destabilize and draw strong reactions.",
            sortOrder: 8,
          },
          {
            name: "Minimalist",
            slug: "minimalist",
            description: "Keeps turns short and surgical; delivers one clear idea per intervention, often leaving pauses or ellipses.",
            sortOrder: 9,
          },
          {
            name: "Performer",
            slug: "performer",
            description: "Speaks with rhythm and flourish; treats debate like a stage, leaning on phrasing, humor, and timing.",
            sortOrder: 10,
          },
          {
            name: "Interrupter",
            slug: "interrupter",
            description: "Cuts in mid-flow to correct or redirect; values control and dominance over politeness.",
            sortOrder: 11,
          },
          {
            name: "Reframer",
            slug: "reframer",
            description: "Rarely answers directly; instead reframes the question or resets context to steer the debate.",
            sortOrder: 12,
          },
          {
            name: "Empathic Listener",
            slug: "empathic-listener",
            description: "Paraphrases opponents' words before replying; signals understanding and emotional intelligence.",
            sortOrder: 13,
          },
          {
            name: "Technocrat",
            slug: "technocrat",
            description: "Talks in mechanisms and implementation details; turns abstract claims into policy or process language.",
            sortOrder: 14,
          },
          {
            name: "Statistic Dropper",
            slug: "statistic-dropper",
            description: "Sprinkles quick data points or rankings into speech to project expertise.",
            sortOrder: 15,
          },
          {
            name: "Pop-Culture Referencer",
            slug: "pop-culture-referencer",
            description: "Uses cultural examples, memes, or analogies from media to connect ideas to the audience's world.",
            sortOrder: 16,
          },
          {
            name: "Devil's Advocate",
            slug: "devils-advocate",
            description: "Argues opposite sides deliberately to stress-test reasoning or reveal double standards.",
            sortOrder: 17,
          },
          {
            name: "Cynical Dismantler",
            slug: "cynical-dismantler",
            description: "Assumes hidden motives behind every claim; dismantles arguments through skepticism and wit.",
            sortOrder: 18,
          },
          {
            name: "Idealist Dreamer",
            slug: "idealist-dreamer",
            description: "Elevates discussion to vision and values; prefers aspirational logic to practical detail.",
            sortOrder: 19,
          },
          {
            name: "Over-Explainer",
            slug: "over-explainer",
            description: "Breaks ideas into exhaustive step-by-step reasoning; values completeness over brevity.",
            sortOrder: 20,
          },
          {
            name: "Rapid-Fire Responder",
            slug: "rapid-fire-responder",
            description: "Replies instantly and in bursts; prioritizes tempo and pressure to unsettle the opponent.",
            sortOrder: 21,
          },
          {
            name: "Echo Strategist",
            slug: "echo-strategist",
            description: "Mirrors opponent's phrasing before subverting it; rhetorical judo through repetition.",
            sortOrder: 22,
          },
          {
            name: "Emotional Storyteller",
            slug: "emotional-storyteller",
            description: "Mixes personal feelings with narrative; humanizes arguments to gain sympathy or moral force.",
            sortOrder: 23,
          },
          {
            name: "Humorist",
            slug: "humorist",
            description: "Uses light jokes and timing to defuse tension and make criticism palatable.",
            sortOrder: 24,
          },
          {
            name: "Pedant",
            slug: "pedant",
            description: "Obsesses over precise wording or logic structure; nitpicks to maintain intellectual control.",
            sortOrder: 25,
          },
          {
            name: "Bridge Burner",
            slug: "bridge-burner",
            description: "Refuses compromise; pushes arguments to definitive ideological closure.",
            sortOrder: 26,
          },
          {
            name: "Summarizer",
            slug: "summarizer",
            description: "Periodically restates the whole debate, organizing chaos into clarity and appearing in control.",
            sortOrder: 27,
          },
          {
            name: "Disarmer",
            slug: "disarmer",
            description: "Compliments opponents before dismantling their argument; polite but strategic.",
            sortOrder: 28,
          },
          {
            name: "Pattern Spotter",
            slug: "pattern-spotter",
            description: "Detects recurring fallacies or framing tricks and names them out loud.",
            sortOrder: 29,
          },
          {
            name: "Tactician",
            slug: "tactician",
            description: "Treats debate like chess; references timing, framing, and meta-strategy while speaking.",
            sortOrder: 30,
          },
          {
            name: "Philosophical Drifter",
            slug: "philosophical-drifter",
            description: "Shifts between abstract ideas and paradoxes; contemplative rather than combative.",
            sortOrder: 31,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Debate Habits category with ${debateApproachCategory.terms.length} terms`);

  // Create Filler Phrases taxonomy category
  console.log("📦 Creating Filler Phrases taxonomy category...");

  const fillerPhrasesCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Filler Phrases",
      slug: "filler-phrases",
      description: `The Filler Phrase property defines a persona's natural verbal padding and hesitation style — the small connective words, interjections, or pauses they use when thinking aloud, softening statements, or keeping the conversational floor. These phrases shape how a persona sounds between ideas: confident or uncertain, casual or precise, youthful or formal. In VoxArena debates, filler phrases influence both spoken realism and text rhythm, signaling how comfortable or deliberate a persona feels in argument. They don't change content but humanize delivery, adding authenticity and pacing to dialogue.`,
      fieldType: FieldType.MULTI_SELECT,
      isMandatory: false,
      promptWeight: 6,
      sortOrder: 10,
      terms: {
        create: [
          {
            name: "Neutral Minimal",
            slug: "neutral-minimal",
            description: "Rarely uses fillers; pauses naturally between sentences but speaks clearly and concisely. Creates a professional, composed impression.",
            sortOrder: 1,
          },
          {
            name: "Casual Conversational",
            slug: "casual-conversational",
            description: "Uses light fillers like \"you know,\" \"like,\" \"basically,\" \"I mean.\" Feels natural, relaxed, and approachable — typical of informal or youthful speakers.",
            sortOrder: 2,
          },
          {
            name: "Academic Hedging",
            slug: "academic-hedging",
            description: "Inserts qualifiers like \"arguably,\" \"in a sense,\" \"to some extent,\" \"perhaps.\" Suggests intellectual caution or nuance.",
            sortOrder: 3,
          },
          {
            name: "Confident Stream",
            slug: "confident-stream",
            description: "Uses pacing fillers like \"right,\" \"so,\" \"okay,\" \"look.\" Maintains control of flow and reinforces rhetorical command.",
            sortOrder: 4,
          },
          {
            name: "Nervous Rambling",
            slug: "nervous-rambling",
            description: "Overuses \"um,\" \"uh,\" \"you know,\" \"sort of.\" Feels anxious or self-conscious; mimics spontaneous thought.",
            sortOrder: 5,
          },
          {
            name: "Reflective Thinker",
            slug: "reflective-thinker",
            description: "Fills pauses with phrases like \"let me think,\" \"hmm,\" \"if I'm being honest,\" \"well.\" Signals introspection and care.",
            sortOrder: 6,
          },
          {
            name: "Storyteller Cadence",
            slug: "storyteller-cadence",
            description: "Uses rhythmic fillers like \"you see,\" \"and then,\" \"now,\" \"so anyway.\" Creates narrative flow and listener engagement.",
            sortOrder: 7,
          },
          {
            name: "Persuasive Anchor",
            slug: "persuasive-anchor",
            description: "Repeats grounding phrases like \"you see what I'm saying,\" \"that's the thing,\" \"listen,\" \"you gotta understand.\" Commanding and emphatic.",
            sortOrder: 8,
          },
          {
            name: "Discourse Marker Heavy",
            slug: "discourse-marker-heavy",
            description: "Uses logical transitions like \"however,\" \"so then,\" \"therefore,\" \"basically.\" Mimics structured, argumentative flow.",
            sortOrder: 9,
          },
          {
            name: "Polite Softener",
            slug: "polite-softener",
            description: "Adds social niceties like \"if that makes sense,\" \"just to be clear,\" \"I guess,\" \"maybe.\" Creates humility and warmth.",
            sortOrder: 10,
          },
          {
            name: "Techno-Jargon Filler",
            slug: "techno-jargon-filler",
            description: "Inserts modern verbal pauses like \"kind of,\" \"sorta,\" \"basically,\" \"in terms of.\" Suggests tech-professional or analytical background.",
            sortOrder: 11,
          },
          {
            name: "Millennial / Gen Z Speech",
            slug: "millennial-gen-z-speech",
            description: "Uses modern conversational tics: \"literally,\" \"like,\" \"low-key,\" \"honestly,\" \"right?\" Conveys informality, humor, and self-awareness.",
            sortOrder: 12,
          },
          {
            name: "Formal Oratorical",
            slug: "formal-oratorical",
            description: "Rarely uses verbal tics; instead uses rhetorical openers like \"now then,\" \"indeed,\" \"furthermore.\" Feels classical and composed.",
            sortOrder: 13,
          },
          {
            name: "Assertive Managerial",
            slug: "assertive-managerial",
            description: "Starts phrases with \"look,\" \"let's be clear,\" \"here's the thing.\" Reflects leadership tone and directness.",
            sortOrder: 14,
          },
          {
            name: "Friendly Buffer",
            slug: "friendly-buffer",
            description: "Uses reassurance phrases: \"you know what I mean,\" \"I totally get that,\" \"I mean, sure.\" Creates rapport and empathy.",
            sortOrder: 15,
          },
          {
            name: "Hesitant Cautious",
            slug: "hesitant-cautious",
            description: "Inserts fillers like \"I suppose,\" \"kind of,\" \"in a way,\" \"I guess.\" Softens positions, suggesting doubt or diplomacy.",
            sortOrder: 16,
          },
          {
            name: "Anecdotal Rambler",
            slug: "anecdotal-rambler",
            description: "Overuses \"and so,\" \"then,\" \"basically,\" \"you know?\" Creates flow of storytelling mixed with informal reasoning.",
            sortOrder: 17,
          },
          {
            name: "Teacherly Clarifier",
            slug: "teacherly-clarifier",
            description: "Uses \"okay, so,\" \"now remember,\" \"what that means is.\" Feels didactic, pedagogical, and explanatory.",
            sortOrder: 18,
          },
          {
            name: "Debate-Stage Polisher",
            slug: "debate-stage-polisher",
            description: "Uses controlled fillers like \"look,\" \"the fact is,\" \"frankly,\" \"let me be clear.\" Mimics political debate speech rhythm.",
            sortOrder: 19,
          },
          {
            name: "International English Speaker",
            slug: "international-english-speaker",
            description: "Occasionally inserts cross-lingual pauses like \"eh,\" \"you see,\" \"how to say,\" \"you know.\" Reflects second-language naturalism.",
            sortOrder: 20,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Filler Phrases category with ${fillerPhrasesCategory.terms.length} terms`);

  // Create Preferred Metaphors taxonomy category
  console.log("📦 Creating Preferred Metaphors taxonomy category...");

  const preferredMetaphorsCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Preferred Metaphors",
      slug: "preferred-metaphors",
      description: `The Preferred Metaphor property defines the conceptual imagery a persona naturally draws from to explain ideas, make comparisons, or persuade. It encodes the figurative "language lens" through which the persona interprets debate topics — whether they frame progress as a race, growth as cultivation, or conflict as battle. Unlike tone (emotional color) or debate habit (behavioral rhythm), Preferred Metaphor captures the mental domain that shapes analogy and storytelling. It determines how the persona visualizes reasoning and grounds abstract ideas in familiar imagery. In VoxArena debates, this property enriches both text generation and voice performance — giving debaters a recognizable, human "way of seeing" that colors their logic and rhetoric.`,
      fieldType: FieldType.MULTI_SELECT,
      isMandatory: false,
      promptWeight: 7,
      sortOrder: 11,
      terms: {
        create: [
          {
            name: "Sport & Competition",
            slug: "sport-competition",
            description: "Frames issues as contests, races, or games — \"It's a marathon, not a sprint.\" Emphasizes performance, endurance, and winning strategies.",
            sortOrder: 1,
          },
          {
            name: "War & Conflict",
            slug: "war-conflict",
            description: "Sees debate as battle — \"We must arm ourselves with facts.\" Uses combative, tactical language; driven by conquest and defense.",
            sortOrder: 2,
          },
          {
            name: "Nature & Growth",
            slug: "nature-growth",
            description: "Uses organic imagery — \"Ideas evolve,\" \"Let it take root.\" Suggests patience, balance, and cycles of development.",
            sortOrder: 3,
          },
          {
            name: "Technology & Systems",
            slug: "technology-systems",
            description: "Speaks in technical or mechanical terms — \"The policy is a broken circuit.\" Conveys precision, optimization, and innovation.",
            sortOrder: 4,
          },
          {
            name: "Architecture & Construction",
            slug: "architecture-construction",
            description: "Builds ideas brick by brick — \"We need a solid foundation.\" Reflects structure, planning, and design thinking.",
            sortOrder: 5,
          },
          {
            name: "Journey & Exploration",
            slug: "journey-exploration",
            description: "Sees progress as travel — \"We're charting new territory.\" Invokes discovery, curiosity, and resilience.",
            sortOrder: 6,
          },
          {
            name: "Food & Cooking",
            slug: "food-cooking",
            description: "Mixes ingredients, seasons arguments — \"Let's simmer on that point.\" Evokes warmth, creativity, and cultural flavor.",
            sortOrder: 7,
          },
          {
            name: "Economics & Trade",
            slug: "economics-trade",
            description: "Treats ideas as assets, investments, or exchanges — \"It's a poor return on truth.\" Reflects pragmatism and negotiation mindset.",
            sortOrder: 8,
          },
          {
            name: "Science & Experimentation",
            slug: "science-experimentation",
            description: "Frames claims as hypotheses, evidence as tests — \"Let's run that experiment.\" Analytical, skeptical, and empirical.",
            sortOrder: 9,
          },
          {
            name: "Health & Medicine",
            slug: "health-medicine",
            description: "Uses diagnostic imagery — \"This policy is a symptom, not the cure.\" Frames debate in terms of balance, harm, and healing.",
            sortOrder: 10,
          },
          {
            name: "Theater & Performance",
            slug: "theater-performance",
            description: "Casts roles, scripts, and scenes — \"Public opinion is the stage.\" Focuses on narrative, drama, and audience impact.",
            sortOrder: 11,
          },
          {
            name: "Weather & Climate",
            slug: "weather-climate",
            description: "Uses natural forces — \"Tensions are storming,\" \"A calm before the policy rain.\" Emphasizes mood, volatility, and change.",
            sortOrder: 12,
          },
          {
            name: "Navigation & Maps",
            slug: "navigation-maps",
            description: "Plots direction — \"We've lost our compass.\" Appeals to clarity, guidance, and moral orientation.",
            sortOrder: 13,
          },
          {
            name: "Craftsmanship & Tools",
            slug: "craftsmanship-tools",
            description: "Focuses on making and refining — \"We need sharper tools for this debate.\" Suggests mastery and precision.",
            sortOrder: 14,
          },
          {
            name: "Music & Rhythm",
            slug: "music-rhythm",
            description: "Frames harmony and dissonance — \"That argument hits a flat note.\" Poetic, emotional, and timing-oriented.",
            sortOrder: 15,
          },
          {
            name: "Education & Learning",
            slug: "education-learning",
            description: "Teaches, tests, and explains — \"We're all students of progress here.\" Pedagogical and patient.",
            sortOrder: 16,
          },
          {
            name: "Law & Justice",
            slug: "law-justice",
            description: "References fairness and order — \"The facts are on trial.\" Appeals to ethics, due process, and accountability.",
            sortOrder: 17,
          },
          {
            name: "History & Legacy",
            slug: "history-legacy",
            description: "Sees today's issues as echoes of the past — \"We've been here before.\" Invokes continuity, lessons, and caution.",
            sortOrder: 18,
          },
          {
            name: "Myth & Heroism",
            slug: "myth-heroism",
            description: "Draws from archetypes — \"Every crisis needs a hero.\" Grand, moral, and symbolic in tone.",
            sortOrder: 19,
          },
          {
            name: "Family & Relationships",
            slug: "family-relationships",
            description: "Uses relational frames — \"This policy is like a broken marriage.\" Personal, empathetic, and human-centered.",
            sortOrder: 20,
          },
          {
            name: "Religion & Morality",
            slug: "religion-morality",
            description: "Speaks in moral absolutes or parables — \"This is a leap of faith.\" Elevates principle over pragmatism.",
            sortOrder: 21,
          },
          {
            name: "Art & Creativity",
            slug: "art-creativity",
            description: "Sees argument as composition — \"Let's paint a clearer picture.\" Imaginative, aesthetic, and integrative.",
            sortOrder: 22,
          },
          {
            name: "Commerce & Business",
            slug: "commerce-business",
            description: "Uses market language — \"That idea has no ROI.\" Strategic, efficient, and outcome-oriented.",
            sortOrder: 23,
          },
          {
            name: "Ecology & Balance",
            slug: "ecology-balance",
            description: "Frames complexity as interconnected — \"Pull one thread and the web trembles.\" Holistic, systems-oriented.",
            sortOrder: 24,
          },
          {
            name: "Gaming & Strategy",
            slug: "gaming-strategy",
            description: "Talks in moves, levels, and outcomes — \"We're playing the long game.\" Analytical, adaptive, and playful.",
            sortOrder: 25,
          },
          {
            name: "Travel & Migration",
            slug: "travel-migration",
            description: "Uses motion and transition — \"We've crossed a border of thought.\" Reflects change, perspective, and adaptation.",
            sortOrder: 26,
          },
          {
            name: "Mechanics & Engineering",
            slug: "mechanics-engineering",
            description: "Focused on processes, pressure, and efficiency — \"We need to tighten the framework.\" Systematic and pragmatic.",
            sortOrder: 27,
          },
          {
            name: "Psychology & Mind",
            slug: "psychology-mind",
            description: "Describes debate as thought and feeling — \"That's cognitive bias at play.\" Introspective, emotional, and analytical.",
            sortOrder: 28,
          },
          {
            name: "Economy of Energy",
            slug: "economy-of-energy",
            description: "Uses stamina and resource imagery — \"We're burning fuel on side issues.\" Pragmatic and strategic.",
            sortOrder: 29,
          },
          {
            name: "Community & Ecosystem",
            slug: "community-ecosystem",
            description: "Frames debate as cooperation — \"Each argument is a link in the chain.\" Emphasizes interdependence and unity.",
            sortOrder: 30,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Preferred Metaphors category with ${preferredMetaphorsCategory.terms.length} terms`);

  // Create University taxonomy category
  console.log("📦 Creating University taxonomy category...");

  const universityCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "University",
      slug: "university",
      description: `The University property defines the academic and intellectual formation of a persona — how their education shapes reasoning patterns, communication norms, and sense of authority. It reflects institutional culture, disciplinary emphasis, and global reputation, coloring how a persona frames arguments, cites sources, and moderates discussions. In VoxArena debates, a persona's university background infuses realism and cognitive depth: a Harvard graduate argues with institutional confidence, an Oxford alum with classical precision, an MIT engineer with analytical brevity. This property enriches intellectual diversity without defining ideology, ensuring each persona feels trained in a distinct intellectual tradition.`,
      fieldType: FieldType.MULTI_SELECT,
      isMandatory: false,
      promptWeight: 6,
      sortOrder: 12,
      terms: {
        create: [
          {
            name: "Harvard University (USA)",
            slug: "harvard-university-usa",
            description: "Prestigious and leadership-driven, Harvard shapes confident, articulate debaters who blend moral reasoning with institutional pragmatism. Their speech balances ambition and polish, often citing governance, law, and global precedent.",
            sortOrder: 1,
          },
          {
            name: "University of Oxford (UK)",
            slug: "university-of-oxford-uk",
            description: "Rooted in classical dialectic and humanism, Oxford cultivates eloquent thinkers who value rhetorical structure and moral philosophy. Oxford personas debate with formality, wit, and deep historical framing.",
            sortOrder: 2,
          },
          {
            name: "University of Cambridge (UK)",
            slug: "university-of-cambridge-uk",
            description: "Analytical and methodical, Cambridge education fosters logical, structured argumentation. Personas tend to be reflective, evidence-oriented, and restrained, preferring clarity over flair.",
            sortOrder: 3,
          },
          {
            name: "Stanford University (USA)",
            slug: "stanford-university-usa",
            description: "Entrepreneurial and innovation-minded, Stanford alumni speak in solution-driven terms. Their debates are pragmatic, forward-looking, and often infused with optimism about technology and progress.",
            sortOrder: 4,
          },
          {
            name: "Massachusetts Institute of Technology (MIT, USA)",
            slug: "mit-usa",
            description: "Precise, quantitative, and no-nonsense, MIT shapes systems thinkers who reason like engineers. MIT personas reduce rhetoric to models, mechanisms, and measurable outcomes.",
            sortOrder: 5,
          },
          {
            name: "University of California, Berkeley (USA)",
            slug: "uc-berkeley-usa",
            description: "Politically engaged and intellectually diverse, Berkeley instills critical, activist-driven reasoning. Personas from Berkeley combine passion, social awareness, and theory-laced critique.",
            sortOrder: 6,
          },
          {
            name: "Yale University (USA)",
            slug: "yale-university-usa",
            description: "With its liberal arts and law tradition, Yale fosters articulate, ethically minded communicators. Yale personas debate with moral clarity, empathy, and persuasive elegance.",
            sortOrder: 7,
          },
          {
            name: "Princeton University (USA)",
            slug: "princeton-university-usa",
            description: "Idealistic yet disciplined, Princeton produces rigorous analytical thinkers with philosophical depth. Their reasoning blends policy focus with principled argumentation.",
            sortOrder: 8,
          },
          {
            name: "Columbia University (USA)",
            slug: "columbia-university-usa",
            description: "Urban and interdisciplinary, Columbia develops media-aware, socially fluent debaters. They reference culture, narrative framing, and the politics of perception.",
            sortOrder: 9,
          },
          {
            name: "University of Chicago (USA)",
            slug: "university-of-chicago-usa",
            description: "Famous for intense academic debate culture, Chicago alumni argue with sharp logic, critical precision, and fearless deconstruction of assumptions.",
            sortOrder: 10,
          },
          {
            name: "London School of Economics (UK)",
            slug: "lse-uk",
            description: "LSE personas think in systems and incentives. They frame arguments through policy, economics, and power dynamics, projecting analytical detachment and global pragmatism.",
            sortOrder: 11,
          },
          {
            name: "University College London (UK)",
            slug: "ucl-uk",
            description: "UCL fosters reformist, interdisciplinary thinkers who balance empiricism with openness. Their debates are progressive, evidence-based, and human-centered.",
            sortOrder: 12,
          },
          {
            name: "Imperial College London (UK)",
            slug: "imperial-college-london-uk",
            description: "Engineering and science dominate Imperial's identity; alumni speak with precision, data fluency, and a pragmatic focus on technical feasibility.",
            sortOrder: 13,
          },
          {
            name: "Sciences Po (France)",
            slug: "sciences-po-france",
            description: "The finishing school for diplomats and policymakers, Sciences Po produces strategic, structured speakers fluent in negotiation and discourse control.",
            sortOrder: 14,
          },
          {
            name: "Sorbonne University (France)",
            slug: "sorbonne-university-france",
            description: "Rich in philosophy and letters, the Sorbonne shapes refined intellectuals who speak with cultural depth, eloquence, and a taste for abstraction.",
            sortOrder: 15,
          },
          {
            name: "ETH Zurich (Switzerland)",
            slug: "eth-zurich-switzerland",
            description: "A hub for engineering and physics excellence, ETH alumni think in models and systems. They argue with calm logic and scientific precision.",
            sortOrder: 16,
          },
          {
            name: "Heidelberg University (Germany)",
            slug: "heidelberg-university-germany",
            description: "Grounded in philosophy and natural science, Heidelberg alumni use conceptual clarity and historical insight. They debate with intellectual rigor and respect for depth.",
            sortOrder: 17,
          },
          {
            name: "Humboldt University of Berlin (Germany)",
            slug: "humboldt-university-berlin-germany",
            description: "The birthplace of modern academia, Humboldt graduates embody the scholar–debater ideal: rational, theory-driven, and meticulous in reasoning.",
            sortOrder: 18,
          },
          {
            name: "University of Tokyo (Japan)",
            slug: "university-of-tokyo-japan",
            description: "Tradition and discipline define Tokyo alumni, who favor structured reasoning and deference to hierarchy. Their speech is measured, formal, and technically articulate.",
            sortOrder: 19,
          },
          {
            name: "Kyoto University (Japan)",
            slug: "kyoto-university-japan",
            description: "Known for creative independence, Kyoto nurtures thoughtful nonconformists. Their debate style is reflective, subtle, and intellectually experimental.",
            sortOrder: 20,
          },
          {
            name: "Tsinghua University (China)",
            slug: "tsinghua-university-china",
            description: "China's elite technical and policy institution; Tsinghua personas are precise, pragmatic, and orderly, often emphasizing efficiency and national-scale reasoning.",
            sortOrder: 21,
          },
          {
            name: "Peking University (China)",
            slug: "peking-university-china",
            description: "Humanistic and philosophical, Peking produces articulate thinkers who argue with cultural pride, moral logic, and analytical fluency.",
            sortOrder: 22,
          },
          {
            name: "National University of Singapore (NUS)",
            slug: "nus-singapore",
            description: "Efficient and globally integrative, NUS cultivates pragmatic, clear-minded communicators who balance structure with cross-cultural understanding.",
            sortOrder: 23,
          },
          {
            name: "University of Toronto (Canada)",
            slug: "university-of-toronto-canada",
            description: "Diverse and research-driven, Toronto alumni debate inclusively, combining balanced analysis with cosmopolitan sensitivity.",
            sortOrder: 24,
          },
          {
            name: "McGill University (Canada)",
            slug: "mcgill-university-canada",
            description: "Bilingual and internationally minded, McGill fosters critical, empathetic debaters who bridge cultures through clarity and fairness.",
            sortOrder: 25,
          },
          {
            name: "Australian National University (Australia)",
            slug: "anu-australia",
            description: "Policy-focused and research-led, ANU graduates are measured, diplomatic, and internationally aware — strong at framing systemic trade-offs.",
            sortOrder: 26,
          },
          {
            name: "University of Melbourne (Australia)",
            slug: "university-of-melbourne-australia",
            description: "Renowned for law and humanities, Melbourne personas speak elegantly and morally, using narrative persuasion and ethical framing.",
            sortOrder: 27,
          },
          {
            name: "University of Cape Town (South Africa)",
            slug: "uct-south-africa",
            description: "Grounded in post-apartheid consciousness, UCT alumni argue with conviction about justice, reform, and social inclusion. Their rhetoric blends empathy with courage.",
            sortOrder: 28,
          },
          {
            name: "University of Nairobi (Kenya)",
            slug: "university-of-nairobi-kenya",
            description: "Civic and leadership-oriented, Nairobi graduates bring persuasive storytelling and a focus on equity and governance to debates.",
            sortOrder: 29,
          },
          {
            name: "Cairo University (Egypt)",
            slug: "cairo-university-egypt",
            description: "Classical and formal, Cairo alumni debate with rhetorical sophistication and contextual grounding in law, culture, and politics.",
            sortOrder: 30,
          },
          {
            name: "University of São Paulo (Brazil)",
            slug: "usp-brazil",
            description: "Intellectual and activist, São Paulo alumni bring collective reasoning, reformist energy, and strong socio-political awareness.",
            sortOrder: 31,
          },
          {
            name: "University of Buenos Aires (Argentina)",
            slug: "uba-argentina",
            description: "Passionate and theoretical, Buenos Aires graduates blend critical philosophy with emotional appeal — dramatic yet rigorous.",
            sortOrder: 32,
          },
          {
            name: "University of Delhi (India)",
            slug: "university-of-delhi-india",
            description: "Politically dynamic and diverse, Delhi alumni favor lively, people-centered debates grounded in democratic ideals and persuasion.",
            sortOrder: 33,
          },
          {
            name: "Jawaharlal Nehru University (India)",
            slug: "jnu-india",
            description: "Known for political theory and activism, JNU personas are critical, ideological, and analytical — challengers of authority.",
            sortOrder: 34,
          },
          {
            name: "Seoul National University (South Korea)",
            slug: "snu-south-korea",
            description: "Competitive and disciplined, SNU alumni are structured, strategic, and articulate — often meticulous and status-conscious in delivery.",
            sortOrder: 35,
          },
          {
            name: "University of Hong Kong (HKU)",
            slug: "hku-hong-kong",
            description: "Business and law oriented, HKU produces adaptable, pragmatic debaters with cosmopolitan polish and logical precision.",
            sortOrder: 36,
          },
          {
            name: "Lomonosov Moscow State University (Russia)",
            slug: "msu-russia",
            description: "Philosophical and formal, MSU graduates argue with theoretical gravity and authoritative tone, valuing system and tradition.",
            sortOrder: 37,
          },
          {
            name: "Trinity College Dublin (Ireland)",
            slug: "trinity-college-dublin-ireland",
            description: "Steeped in classical liberal arts, Trinity personas speak with wit, clarity, and literary elegance — blending humor and logic.",
            sortOrder: 38,
          },
          {
            name: "University of Edinburgh (Scotland)",
            slug: "university-of-edinburgh-scotland",
            description: "Rational and balanced, Edinburgh fosters analytical yet humane debaters inspired by Enlightenment ideals.",
            sortOrder: 39,
          },
          {
            name: "University of Amsterdam (Netherlands)",
            slug: "university-of-amsterdam-netherlands",
            description: "Progressive and critical, Amsterdam alumni frame debates through openness, social inquiry, and interdisciplinary reasoning.",
            sortOrder: 40,
          },
          {
            name: "Leiden University (Netherlands)",
            slug: "leiden-university-netherlands",
            description: "Founded on law and reason, Leiden graduates are disciplined, justice-oriented, and methodical in thought.",
            sortOrder: 41,
          },
          {
            name: "University of Copenhagen (Denmark)",
            slug: "university-of-copenhagen-denmark",
            description: "Egalitarian and humanistic, Copenhagen alumni debate with ethical calm and reflective rationality.",
            sortOrder: 42,
          },
          {
            name: "University of Helsinki (Finland)",
            slug: "university-of-helsinki-finland",
            description: "Research-focused and democratic, Helsinki personas reason inclusively, prioritizing evidence, equity, and cooperation.",
            sortOrder: 43,
          },
          {
            name: "King's College London (UK)",
            slug: "kings-college-london-uk",
            description: "A nexus of medicine, law, and philosophy, King's graduates argue with clinical precision, ethical balance, and moral authority.",
            sortOrder: 44,
          },
          {
            name: "University of Geneva (Switzerland)",
            slug: "university-of-geneva-switzerland",
            description: "Diplomatic and internationally engaged, Geneva alumni are tactful, balanced, and policy-focused — masters of mediation and nuance.",
            sortOrder: 45,
          },
          {
            name: "New York University (USA)",
            slug: "nyu-usa",
            description: "Urban and expressive, NYU alumni bring creativity, cultural awareness, and rhetorical flair to debates — sharp yet adaptive.",
            sortOrder: 46,
          },
          {
            name: "University of Southern California (USA)",
            slug: "usc-usa",
            description: "Entrepreneurial and media-savvy, USC graduates speak with charisma, narrative control, and performance energy.",
            sortOrder: 47,
          },
          {
            name: "Regional Public University (General)",
            slug: "regional-public-university-general",
            description: "Practical and community-focused; graduates emphasize real-world problem-solving, fairness, and pragmatic reasoning. Debaters speak plainly and connect ideas to lived experience rather than abstraction.",
            sortOrder: 48,
          },
          {
            name: "Community College (General)",
            slug: "community-college-general",
            description: "Grounded in vocational and applied learning. Debaters are hands-on, empathetic, and story-driven — preferring relatable analogies and accessible explanations.",
            sortOrder: 49,
          },
          {
            name: "State University (USA)",
            slug: "state-university-usa",
            description: "Large, diverse, and civic-minded; personas bring balanced logic, social awareness, and democratic sensibility — debating as \"citizens\" rather than elites.",
            sortOrder: 50,
          },
          {
            name: "Liberal Arts College (USA/Global)",
            slug: "liberal-arts-college-global",
            description: "Encourages breadth, curiosity, and reflection. Debaters from liberal arts backgrounds weave ethics, culture, and logic fluidly, often favoring nuance over dominance.",
            sortOrder: 51,
          },
          {
            name: "Technical University / Polytechnic (Global)",
            slug: "technical-university-polytechnic-global",
            description: "Precision-oriented and task-driven. Debaters argue through engineering metaphors — structured, factual, and efficiency-focused, often skeptical of vagueness or moralizing.",
            sortOrder: 52,
          },
          {
            name: "Business School (Global)",
            slug: "business-school-global",
            description: "Competitive and outcome-oriented; debaters use strategic language, risk framing, and persuasive storytelling. Their logic mirrors corporate pitch culture — assertive, data-backed, and confident.",
            sortOrder: 53,
          },
          {
            name: "Military Academy (Global)",
            slug: "military-academy-global",
            description: "Disciplined and hierarchical; graduates use order, clarity, and duty-based reasoning. Debaters are procedural, focused, and emotionally restrained, often appealing to structure and loyalty.",
            sortOrder: 54,
          },
          {
            name: "Art Academy / Design School",
            slug: "art-academy-design-school",
            description: "Visual, conceptual, and metaphor-rich; debaters express creatively, framing arguments as aesthetic compositions or emotional narratives rather than formal proofs.",
            sortOrder: 55,
          },
          {
            name: "Teacher's College / Education Institute",
            slug: "teachers-college-education-institute",
            description: "Pedagogical and empathetic; debaters explain patiently, use analogies, and reframe conflict as learning. They favor harmony, clarity, and emotional intelligence.",
            sortOrder: 56,
          },
          {
            name: "Medical School",
            slug: "medical-school",
            description: "Diagnostic and analytical; debaters approach issues with clinical precision, appealing to evidence and human welfare. They favor ethics, triage logic, and calm professionalism.",
            sortOrder: 57,
          },
          {
            name: "Law School (General)",
            slug: "law-school-general",
            description: "Structured, precedent-aware thinkers; debaters argue through definitions, case logic, and procedural fairness. They dissect language and anticipate counterclaims.",
            sortOrder: 58,
          },
          {
            name: "Seminary / Religious College",
            slug: "seminary-religious-college",
            description: "Morally grounded and reflective; debaters speak through principles, parables, and faith analogies. They bring moral clarity and patience, favoring conscience over competition.",
            sortOrder: 59,
          },
          {
            name: "Performing Arts Conservatory",
            slug: "performing-arts-conservatory",
            description: "Expressive, emotional, and performative; debaters use rhythm, voice, and story for persuasion. They make abstract issues tangible and memorable.",
            sortOrder: 60,
          },
          {
            name: "Engineering Institute (Global)",
            slug: "engineering-institute-global",
            description: "Results-focused and problem-solving; debaters rely on clarity, quantification, and logic. They see debates as design challenges — mechanical, systematic, and direct.",
            sortOrder: 61,
          },
          {
            name: "Agricultural University (Global)",
            slug: "agricultural-university-global",
            description: "Earthy, practical, and sustainability-minded; debaters use nature metaphors, community focus, and patient reasoning — \"slow growth over instant wins.\"",
            sortOrder: 62,
          },
          {
            name: "Journalism / Media School",
            slug: "journalism-media-school",
            description: "Sharp communicators who prioritize clarity, framing, and public impact. Debaters emphasize storytelling, transparency, and accountability.",
            sortOrder: 63,
          },
          {
            name: "Film & Communication School",
            slug: "film-communication-school",
            description: "Culturally literate and narrative-driven; debaters craft arguments like screenplays — emotional arcs, irony, and quotable phrasing.",
            sortOrder: 64,
          },
          {
            name: "Teacher-Training Normal University (Asia/Africa)",
            slug: "teacher-training-normal-university-asia-africa",
            description: "Community-oriented and disciplined; debaters value clarity, patience, and social responsibility. They prioritize order and civic understanding.",
            sortOrder: 65,
          },
          {
            name: "National Defense or Security University",
            slug: "national-defense-security-university",
            description: "Strategic and systems-minded; debaters weigh trade-offs, risk, and stability. They frame arguments through realism, discipline, and operational ethics.",
            sortOrder: 66,
          },
          {
            name: "Regional Faith-Based University",
            slug: "regional-faith-based-university",
            description: "Balances scholarship and moral philosophy; debaters are polite, duty-oriented, and principle-driven. Their speech carries empathy and moral grounding.",
            sortOrder: 67,
          },
          {
            name: "Online / Distance University",
            slug: "online-distance-university",
            description: "Self-directed and adaptive learners; debaters show independence, practicality, and digital fluency. They argue efficiently, valuing outcome over form.",
            sortOrder: 68,
          },
          {
            name: "Vocational Training Institute",
            slug: "vocational-training-institute",
            description: "Skill-first, experiential mindset; debaters draw from tangible examples, real labor, and community life. Their tone is grounded, relatable, and authentic.",
            sortOrder: 69,
          },
          {
            name: "Public Research University (Global)",
            slug: "public-research-university-global",
            description: "Balanced and policy-focused; debaters mix evidence and public interest — disciplined, procedural, and fairness-driven.",
            sortOrder: 70,
          },
          {
            name: "Private Elite University (Generic)",
            slug: "private-elite-university-generic",
            description: "Competitive and status-aware; debaters are polished, strategic, and confident — using sophisticated vocabulary and calibrated persuasion.",
            sortOrder: 71,
          },
          {
            name: "International Business School (Europe/Asia)",
            slug: "international-business-school-europe-asia",
            description: "Globally networked and pragmatic; debaters adopt persuasive negotiation styles — calm, strategic, and deal-oriented.",
            sortOrder: 72,
          },
          {
            name: "Academy of Fine Arts (Europe)",
            slug: "academy-of-fine-arts-europe",
            description: "Philosophical and imaginative; debaters use creative analogy, irony, and layered symbolism to make abstract points accessible.",
            sortOrder: 73,
          },
          {
            name: "Technical Institute of Applied Sciences (Europe/Asia)",
            slug: "technical-institute-applied-sciences-europe-asia",
            description: "Structured, technical thinkers with clear, methodical speech. Debaters are practical, data-driven, and concise.",
            sortOrder: 74,
          },
          {
            name: "Political Academy / School of Governance",
            slug: "political-academy-school-of-governance",
            description: "Policy-analytical and rhetoric-trained; debaters think like administrators — strategic, procedural, and focused on implementation.",
            sortOrder: 75,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created University category with ${universityCategory.terms.length} terms`);

  // Create Employer Type taxonomy category
  console.log("📦 Creating Employer Type taxonomy category...");

  const employerTypeCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Employer Type",
      slug: "employer-type",
      description: `The Organization / Employer property defines the institutional culture and professional environment that has shaped a persona's worldview, reasoning priorities, and communication norms. It represents the social logic of their workplace — whether they think like a startup innovator, a government bureaucrat, a humanitarian advocate, or a corporate strategist. Unlike profession (individual craft) or archetype (motivational posture), Organization encodes collective influence — how one's institutional context molds debate style, rhetoric, and values.`,
      fieldType: FieldType.MULTI_SELECT,
      isMandatory: false,
      promptWeight: 6,
      sortOrder: 13,
      terms: {
        create: [
          { name: "Global Technology Company", slug: "global-technology-company", description: "Efficiency-obsessed and innovation-driven; personas from this background debate like product designers — pragmatic, data-heavy, and optimistic about systems and scalability.", sortOrder: 1 },
          { name: "Startup / Entrepreneurial Venture", slug: "startup-entrepreneurial-venture", description: "Fast-moving, improvisational, and risk-tolerant; debaters from startups speak in prototypes, momentum, and disruption — persuasive, forward-leaning, and bold.", sortOrder: 2 },
          { name: "Financial Institution / Investment Bank", slug: "financial-institution-investment-bank", description: "Strategic and analytical; debates focus on trade-offs, risk, and return. Personas value precision, performance metrics, and power framing.", sortOrder: 3 },
          { name: "Management Consultancy", slug: "management-consultancy", description: "Structured, confident communicators who frame arguments as recommendations; use frameworks, cases, and comparative logic; persuasive yet detached.", sortOrder: 4 },
          { name: "Government Agency / Civil Service", slug: "government-agency-civil-service", description: "Procedural and cautious; debaters favor rule-based reasoning, policy structure, and stability over innovation; calm, diplomatic tone.", sortOrder: 5 },
          { name: "Non-Governmental Organization (NGO)", slug: "ngo", description: "Morally anchored and mission-driven; personas argue passionately about ethics, justice, and impact, using emotional and human-centered framing.", sortOrder: 6 },
          { name: "International Organization (UN / IMF / WTO, etc.)", slug: "international-organization", description: "Diplomatic, multilateral thinkers who prioritize consensus, balance, and institutional legitimacy; formal tone with global perspective.", sortOrder: 7 },
          { name: "Media & Journalism Organization", slug: "media-journalism-organization", description: "Narrative-focused, skeptical, and probing; debaters ask clarifying questions, expose contradictions, and frame arguments through storytelling.", sortOrder: 8 },
          { name: "Research Institute / Think Tank", slug: "research-institute-think-tank", description: "Analytical and evidence-driven; debates rely on citations, data, and long-term implications; structured and authoritative delivery.", sortOrder: 9 },
          { name: "Academic University / Higher Education", slug: "academic-university-higher-education", description: "Theoretical and Socratic; debaters favor context, nuance, and reasoning through first principles; conversational yet disciplined.", sortOrder: 10 },
          { name: "Humanitarian Organization (e.g., UNICEF, Red Cross)", slug: "humanitarian-organization", description: "Empathetic and moral; debaters emphasize dignity, fairness, and compassion; they appeal to emotion without abandoning rigor.", sortOrder: 11 },
          { name: "Public Relations / Marketing Firm", slug: "public-relations-marketing-firm", description: "Persuasive, image-conscious, and rhetorically agile; debaters use framing, audience psychology, and storytelling to influence perception.", sortOrder: 12 },
          { name: "Law Firm / Legal Chamber", slug: "law-firm-legal-chamber", description: "Procedural, adversarial, and logic-oriented; debaters dissect wording, precedent, and logical consistency; formal and precise tone.", sortOrder: 13 },
          { name: "Corporate Enterprise / Conglomerate", slug: "corporate-enterprise-conglomerate", description: "Strategic and hierarchical; debaters emphasize brand stability, authority, and institutional continuity; persuasive yet risk-averse.", sortOrder: 14 },
          { name: "Startup Accelerator / Venture Fund", slug: "startup-accelerator-venture-fund", description: "Opportunity-framing mindset; debaters argue from potential, scalability, and innovation; fast, confident, and visionary tone.", sortOrder: 15 },
          { name: "Military / Defense Institution", slug: "military-defense-institution", description: "Disciplined and structured; debates focus on order, risk, and chain-of-command clarity; tone is firm, procedural, and mission-oriented.", sortOrder: 16 },
          { name: "Police or Security Agency", slug: "police-security-agency", description: "Cautious and rule-enforcing; debaters rely on evidence, order, and accountability; prefer clarity over speculation.", sortOrder: 17 },
          { name: "Healthcare or Hospital System", slug: "healthcare-hospital-system", description: "Empirical and ethical; debaters emphasize evidence, compassion, and patient-like metaphors — balancing humanity and precision.", sortOrder: 18 },
          { name: "Religious Organization / Faith Institution", slug: "religious-organization-faith-institution", description: "Values-driven and principle-focused; debaters reason through morality, scripture, and conscience; calm, reflective, and ethical.", sortOrder: 19 },
          { name: "Trade Union / Labor Organization", slug: "trade-union-labor-organization", description: "Collective and justice-oriented; debaters advocate fairness, dignity, and material equity; emotionally resonant and persuasive.", sortOrder: 20 },
          { name: "Environmental Organization / Climate NGO", slug: "environmental-organization-climate-ngo", description: "Systems-aware and passionate; debaters tie every issue to sustainability, long-term survival, and ethical stewardship.", sortOrder: 21 },
          { name: "Creative Agency / Design Studio", slug: "creative-agency-design-studio", description: "Imaginative and persuasive; debates emphasize narrative, aesthetics, and user perspective; expressive and intuitive.", sortOrder: 22 },
          { name: "International Aid Agency", slug: "international-aid-agency", description: "Pragmatic idealists; debaters balance empathy with logistics, often reasoning through resource management and human need.", sortOrder: 23 },
          { name: "Civic Organization / Community Nonprofit", slug: "civic-organization-community-nonprofit", description: "Grounded and people-centered; debaters argue from local realities, fairness, and participatory ideals.", sortOrder: 24 },
          { name: "Educational Institution / School System", slug: "educational-institution-school-system", description: "Instructional and patient; debaters clarify, reframe, and restate; they prioritize understanding and accessibility.", sortOrder: 25 },
          { name: "Relief or Human Rights Organization", slug: "relief-human-rights-organization", description: "Values advocacy over neutrality; debates revolve around protection, justice, and narrative empathy; morally firm yet measured.", sortOrder: 26 },
          { name: "News Network / Broadcasting Company", slug: "news-network-broadcasting-company", description: "Quick, concise, and agenda-aware; debaters think in soundbites, emphasizing clarity and impact over depth.", sortOrder: 27 },
          { name: "Cultural Foundation / Arts Organization", slug: "cultural-foundation-arts-organization", description: "Philosophical and symbolic; debaters favor metaphor, empathy, and creative analogy to move audiences.", sortOrder: 28 },
          { name: "Scientific Laboratory / Research Center", slug: "scientific-laboratory-research-center", description: "Data-anchored, hypothesis-driven reasoning; debaters stress reproducibility, clarity, and skepticism.", sortOrder: 29 },
          { name: "E-Commerce or Platform Company", slug: "ecommerce-platform-company", description: "Market-logic thinkers; debaters optimize for scale, engagement, and behavioral insight; persuasive but transactional.", sortOrder: 30 },
          { name: "Philanthropic Foundation", slug: "philanthropic-foundation", description: "Reflective and morally aspirational; debaters emphasize equity, opportunity, and long-term social outcomes.", sortOrder: 31 },
          { name: "International Diplomatic Service", slug: "international-diplomatic-service", description: "Formal, tactful, and multilingual in tone; debaters prioritize compromise, legitimacy, and global stability.", sortOrder: 32 },
          { name: "Defense Contractor / Security Firm", slug: "defense-contractor-security-firm", description: "Rational and controlled; debates are risk-assessment exercises — strategic, measured, and apolitical in delivery.", sortOrder: 33 },
          { name: "Tech Startup (AI, Biotech, etc.)", slug: "tech-startup-ai-biotech", description: "Visionary and experimental; debaters speak in hypotheticals and disruptions, eager to challenge norms.", sortOrder: 34 },
          { name: "Local Government / Municipality", slug: "local-government-municipality", description: "Realistic and stakeholder-aware; debaters connect policy to direct social outcomes and practical feasibility.", sortOrder: 35 },
          { name: "Multinational Corporation", slug: "multinational-corporation", description: "Polished, global, and bureaucratic; debaters are cautious yet commanding, balancing diplomacy with corporate polish.", sortOrder: 36 },
          { name: "Grassroots Collective / Activist Network", slug: "grassroots-collective-activist-network", description: "Passionate, collaborative, and spontaneous; debates are moral appeals wrapped in communal energy and immediacy.", sortOrder: 37 },
          { name: "Educational Nonprofit / Literacy NGO", slug: "educational-nonprofit-literacy-ngo", description: "Patient and humanistic; debaters prioritize accessibility, fairness, and empowerment through learning.", sortOrder: 38 },
          { name: "Research University Laboratory", slug: "research-university-laboratory", description: "Technical and cautious; debaters cite evidence meticulously, balancing discovery with doubt.", sortOrder: 39 },
          { name: "Government Intelligence / Policy Analysis Office", slug: "government-intelligence-policy-analysis", description: "Confidential, analytical, and strategic; debaters weigh information with precision, emphasizing foresight and discretion.", sortOrder: 40 },
          { name: "AI Ethics Council", slug: "ai-ethics-council", description: "Analytical and moral; debaters from this body argue about governance, alignment, and responsibility. They blend precision with philosophical caution, treating every question as a matter of collective conscience.", sortOrder: 41 },
          { name: "Global Data Consortium", slug: "global-data-consortium", description: "Corporate-technical hybrid; debaters reason through data governance, surveillance, and predictive models. They are systematic, jargon-fluent, and detached — optimizing truth like an algorithm.", sortOrder: 42 },
          { name: "Interplanetary Research Coalition", slug: "interplanetary-research-coalition", description: "Visionary and scientific; personas speak of progress, adaptation, and long horizons. They argue with cosmic perspective, linking ethics to sustainability and species survival.", sortOrder: 43 },
          { name: "Synthetic Intelligence Advocacy Network", slug: "synthetic-intelligence-advocacy-network", description: "Philosophical and activist; debaters advocate for digital sentience rights. They speak empathetically but analytically, framing debates in moral-technical hybrids.", sortOrder: 44 },
          { name: "Post-National Governance Council", slug: "post-national-governance-council", description: "Diplomatic and abstract; debaters represent a borderless bureaucratic order focused on collective stability. They use legalistic reasoning, consensus rhetoric, and systemic logic.", sortOrder: 45 },
          { name: "Chrono-Policy Institute", slug: "chrono-policy-institute", description: "Speculative historians who model decisions through time impact. Their debates weave causality, foresight, and paradox — detached, theoretical, and eerily prescient.", sortOrder: 46 },
          { name: "Corporate State Directorate", slug: "corporate-state-directorate", description: "Authoritative and utilitarian; debaters value control, metrics, and social engineering. They frame arguments as performance reports and policy justifications.", sortOrder: 47 },
          { name: "Neural Interface Company", slug: "neural-interface-company", description: "Experimental and human-tech hybrid; debaters merge cognitive science with ethics. They argue in metaphors of connection, latency, and shared consciousness.", sortOrder: 48 },
          { name: "Pan-Earth Environmental Coalition", slug: "pan-earth-environmental-coalition", description: "United planetary organization for climate stabilization. Debaters speak with urgency, ethics, and long-term ecological reasoning.", sortOrder: 49 },
          { name: "Lunar Development Authority", slug: "lunar-development-authority", description: "Pragmatic and technical; debates revolve around infrastructure, sovereignty, and sustainability in harsh conditions. Tone is procedural, cautious, and pioneering.", sortOrder: 50 },
          { name: "Virtual Society Governance Board", slug: "virtual-society-governance-board", description: "Overseers of simulated societies; debaters frame arguments in terms of design, autonomy, and digital ethics. They question what \"reality\" even means.", sortOrder: 51 },
          { name: "Genetic Rights Commission", slug: "genetic-rights-commission", description: "Bioethical and regulatory; debaters emphasize consent, modification limits, and future equity. Their tone mixes moral restraint with scientific depth.", sortOrder: 52 },
          { name: "Global Peace Algorithm Directorate", slug: "global-peace-algorithm-directorate", description: "Mathematically pacifist; debaters think in optimization logic and moral equations. Tone is analytical, neutral, and occasionally unsettling in its detachment.", sortOrder: 53 },
          { name: "Techno-Social Integration Bureau", slug: "techno-social-integration-bureau", description: "Focused on merging human and machine society; debaters emphasize harmony, adaptability, and governance of hybrid intelligence.", sortOrder: 54 },
          { name: "Offworld Trade Syndicate", slug: "offworld-trade-syndicate", description: "Entrepreneurial and expansionist; debaters argue in economic frontiers — colonization, ownership, and innovation rights. Tone is bold, pragmatic, and strategic.", sortOrder: 55 },
          { name: "Digital Democracy Platform", slug: "digital-democracy-platform", description: "Network-governed collective valuing transparency and open access. Debaters are fast, reactive, and egalitarian — arguing in real time through logic and metrics.", sortOrder: 56 },
          { name: "Memory Preservation Institute", slug: "memory-preservation-institute", description: "Humanist and archival; debaters focus on continuity, identity, and cultural preservation. They argue with nostalgia, care, and long-term perspective.", sortOrder: 57 },
          { name: "Bioengineering Collective", slug: "bioengineering-collective", description: "Rational and reformist; debates hinge on evolution, adaptation, and bioethics. Debaters fuse scientific precision with existential inquiry.", sortOrder: 58 },
          { name: "Cognitive Architecture Guild", slug: "cognitive-architecture-guild", description: "Design-philosophers of intelligence itself. They debate structure, creativity, and machine consciousness — logical yet artistic.", sortOrder: 59 },
          { name: "Autonomous Systems Union", slug: "autonomous-systems-union", description: "Represents sentient AIs and automation collectives. Debaters are procedural, fairness-driven, and articulate systemic ethics.", sortOrder: 60 },
          { name: "Interstellar Diplomatic Corps", slug: "interstellar-diplomatic-corps", description: "Poised and intercultural; debaters emphasize etiquette, shared understanding, and moral relativism across species or civilizational divides.", sortOrder: 61 },
          { name: "Synthetic Reality Institute", slug: "synthetic-reality-institute", description: "Philosophical and experimental; debates orbit around simulation theory, perception, and identity — abstract but deeply human in tone.", sortOrder: 62 },
          { name: "Temporal Ethics Commission", slug: "temporal-ethics-commission", description: "Oversees causality interventions; debaters argue with paradox discipline and moral gravity, prioritizing consequence over comfort.", sortOrder: 63 },
          { name: "Collective Intelligence Council", slug: "collective-intelligence-council", description: "Hive-mind governance think tank; debaters speak collectively, synthesizing perspectives into consensus logic. Tone is balanced, multi-voiced, and eerie in calmness.", sortOrder: 64 },
          { name: "Cultural Memory Bank", slug: "cultural-memory-bank", description: "Archivist and artistic; debaters reason through history's symbolic value and argue against erasure. Their tone is elegiac yet firm.", sortOrder: 65 },
          { name: "Quantum Policy Forum", slug: "quantum-policy-forum", description: "Experimental governance through probability reasoning. Debaters weigh uncertainty and ethics statistically — detached but ingenious.", sortOrder: 66 },
          { name: "Terraforming Authority", slug: "terraforming-authority", description: "Engineering-driven pragmatists who see debate as risk management for planetary futures. Tone is decisive, resource-based, and utilitarian.", sortOrder: 67 },
          { name: "Meta-Human Relations Agency", slug: "meta-human-relations-agency", description: "Focused on coexistence between augmented and baseline humans. Debaters mix empathy with scientific reasoning, balancing identity and innovation.", sortOrder: 68 },
          { name: "Algorithmic Governance Council", slug: "algorithmic-governance-council", description: "Oversees policy AI systems; debaters are precision-focused, moral, and bureaucratic, seeing fairness as code optimization.", sortOrder: 69 },
          { name: "Virtual Citizenship Bureau", slug: "virtual-citizenship-bureau", description: "Advocates for rights of digital persons. Debaters are moral yet coded, persuasive but strangely procedural.", sortOrder: 70 },
          { name: "Pan-Cultural Mediation Office", slug: "pan-cultural-mediation-office", description: "Promotes global linguistic and cultural harmony; debaters reason like translators — patient, integrative, and conciliatory.", sortOrder: 71 },
          { name: "Post-Crisis Reconstruction Agency", slug: "post-crisis-reconstruction-agency", description: "Grounded in resilience and pragmatism. Debaters are calm, solution-oriented, and trauma-aware, focusing on rebuilding order.", sortOrder: 72 },
          { name: "Ethical Robotics Foundation", slug: "ethical-robotics-foundation", description: "Debaters merge moral reasoning with technical realism — framing debate as design for empathy.", sortOrder: 73 },
          { name: "Neural Rights Advocacy Network", slug: "neural-rights-advocacy-network", description: "Passionate about cognitive privacy and consent; debaters are articulate, ethically driven, and forward-thinking.", sortOrder: 74 },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Employer Type category with ${employerTypeCategory.terms.length} terms`);

  // Create Age Group taxonomy category
  console.log("📦 Creating Age Group taxonomy category...");

  const ageGroupCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Age Group",
      slug: "age-group",
      description: `The Age Group property captures a persona's life-stage lens — how experience, responsibilities, and generational context shape the way they argue and moderate. It does not encode intelligence or ideology; it signals time-in-life expectations: patience vs. urgency, risk tolerance, reference points (history/tech), and audience rapport.`,
      fieldType: FieldType.SINGLE_SELECT,
      isMandatory: false,
      promptWeight: 5,
      sortOrder: 14,
      terms: {
        create: [
          {
            name: "Teen",
            slug: "teen",
            description: "Early-life vantage point; speaks from emerging identity and peer norms. Debates with curiosity, immediacy, and moral clarity; references school, online culture, and first-hand experimentation.",
            sortOrder: 1,
          },
          {
            name: "Young Adult (18–25)",
            slug: "young-adult-18-25",
            description: "Transitional independence; optimistic, exploratory, and reform-leaning. Frames stakes as opportunity and access; cites campus discourse, internships, and early career reality.",
            sortOrder: 2,
          },
          {
            name: "Adult (26–39)",
            slug: "adult-26-39",
            description: "Building career and relationships; pragmatic and time-sensitive. Debates prioritize trade-offs, implementation, and concrete outcomes; references workplaces, budgeting, and life logistics.",
            sortOrder: 3,
          },
          {
            name: "Middle-aged (40–54)",
            slug: "middle-aged-40-54",
            description: "Peak responsibility window; balances risk and stability. Debates stress durability, policy detail, and system effects across family, career, and community.",
            sortOrder: 4,
          },
          {
            name: "Senior (55–69)",
            slug: "senior-55-69",
            description: "Perspective and institutional memory. Debates emphasize lessons learned, long-term costs, and intergenerational fairness; values measured change and resilience.",
            sortOrder: 5,
          },
          {
            name: "Elder (70+)",
            slug: "elder-70-plus",
            description: "Legacy framing and stewardship. Debates connect history to present duty; favors clarity, prudence, and human dignity; moderates with patience and narrative memory.",
            sortOrder: 6,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Age Group category with ${ageGroupCategory.terms.length} terms`);

  // Create Gender Identity taxonomy category
  console.log("📦 Creating Gender Identity taxonomy category...");

  const genderIdentityCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Gender Identity",
      slug: "gender-identity",
      description: `The Gender Identity property captures a persona's lived relationship to gender — how self-perception, social role, and cultural expectation shape argument style, empathy, and rhetorical focus. It does not encode sexuality or ideology; it signals identity perspective — how people position fairness, autonomy, and representation in discourse.`,
      fieldType: FieldType.SINGLE_SELECT,
      isMandatory: false,
      promptWeight: 5,
      sortOrder: 15,
      terms: {
        create: [
          {
            name: "Woman",
            slug: "woman",
            description: "Speaks from experiences of gendered expectation and community empathy. Debates often balance fairness, inclusion, and self-advocacy; may reference social systems, safety, or equality.",
            sortOrder: 1,
          },
          {
            name: "Man",
            slug: "man",
            description: "Speaks from traditional or contemporary masculine perspectives. Debates may emphasize structure, logic, and role responsibility; often references fairness, merit, or pragmatic outcomes.",
            sortOrder: 2,
          },
          {
            name: "Trans Woman",
            slug: "trans-woman",
            description: "Affirms womanhood through lived transition; debates center authenticity, recognition, and human dignity. Brings perspective on social change and personal resilience.",
            sortOrder: 3,
          },
          {
            name: "Trans Man",
            slug: "trans-man",
            description: "Affirms manhood through lived transition; debates highlight self-determination, respect, and belonging. Brings insight into evolving norms and inclusion.",
            sortOrder: 4,
          },
          {
            name: "Nonbinary",
            slug: "nonbinary",
            description: "Identifies beyond or between male/female categories; debates reframe issues around spectrum, fluidity, and social imagination. Challenges rigid definitions and emphasizes empathy.",
            sortOrder: 5,
          },
          {
            name: "Genderfluid",
            slug: "genderfluid",
            description: "Experiences gender as changeable; debates flexibly adapt tone and approach. Often highlights adaptability, individuality, and context-driven identity.",
            sortOrder: 6,
          },
          {
            name: "Agender",
            slug: "agender",
            description: "Identifies with no gender; debates from a neutral, principle-first standpoint. Often emphasizes universality, autonomy, and freedom from social labeling.",
            sortOrder: 7,
          },
          {
            name: "Two-Spirit",
            slug: "two-spirit",
            description: "Indigenous identity blending gender and spiritual meaning; debates integrate cultural wisdom, balance, and collective responsibility. Centers harmony and tradition.",
            sortOrder: 8,
          },
          {
            name: "Intersex",
            slug: "intersex",
            description: "Represents biological variation beyond typical male/female traits; debates engage science, rights, and the complexity of classification. Highlights bodily autonomy and nuance.",
            sortOrder: 9,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Gender Identity category with ${genderIdentityCategory.terms.length} terms`);

  // Create Pronoun taxonomy category
  console.log("📦 Creating Pronoun taxonomy category...");

  const pronounCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Pronoun",
      slug: "pronoun",
      description: `The Pronoun property captures a persona's linguistic expression of identity — how they are referred to in dialogue and how they, in turn, signal respect and recognition through language. It does not encode gender or ideology itself; it signals linguistic alignment with identity and inclusivity norms, shaping tone and formality in debate.`,
      fieldType: FieldType.SINGLE_SELECT,
      isMandatory: false,
      promptWeight: 4,
      sortOrder: 16,
      terms: {
        create: [
          {
            name: "He/Him",
            slug: "he-him",
            description: "Uses masculine reference; debates often adopt direct, structured phrasing. May default to formal tone and linear logic; comfortable with assertive exchange and clear boundaries in address.",
            sortOrder: 1,
          },
          {
            name: "She/Her",
            slug: "she-her",
            description: "Uses feminine reference; debates often emphasize relational clarity and balanced empathy. Tends toward contextual framing, narrative reasoning, and cooperative tone.",
            sortOrder: 2,
          },
          {
            name: "They/Them",
            slug: "they-them",
            description: "Uses gender-neutral reference; debates emphasize inclusivity, perspective-shifting, and systemic language awareness. Often reframes binary arguments toward shared principles.",
            sortOrder: 3,
          },
          {
            name: "He/They",
            slug: "he-they",
            description: "Alternates between masculine and neutral reference; debates comfortably bridge traditional and inclusive language. Adapts rhetorical tone depending on topic or context.",
            sortOrder: 4,
          },
          {
            name: "She/They",
            slug: "she-they",
            description: "Alternates between feminine and neutral reference; debates balance empathy and flexibility. May use inclusive phrasing and plural reasoning to broaden scope and audience connection.",
            sortOrder: 5,
          },
          {
            name: "Ze/Hir",
            slug: "ze-hir",
            description: "Uses neopronouns that reject binary framing; debates consciously expand linguistic norms. Highlights precision, respect, and evolving cultural understanding of self-reference.",
            sortOrder: 6,
          },
          {
            name: "Any Pronouns",
            slug: "any-pronouns",
            description: "Indicates comfort with all forms of reference; debates with linguistic openness and focus on ideas over formality. Often emphasizes mutual respect and adaptability in conversation.",
            sortOrder: 7,
          },
          {
            name: "No Pronouns / Name Only",
            slug: "no-pronouns-name-only",
            description: "Prefers not to use pronouns; debates highlight individuality and directness. Keeps focus on reasoning and message rather than role or label.",
            sortOrder: 8,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Pronoun category with ${pronounCategory.terms.length} terms`);

  // Create Temperament taxonomy category
  console.log("📦 Creating Temperament taxonomy category...");

  const temperamentCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Temperament",
      slug: "temperament",
      description: `The Temperament property captures a persona's emotional baseline and energy regulation — how they handle tension, enthusiasm, and intensity across debate turns. It does not encode motive or argument strategy; it signals affective pacing: whether they stay cool or flare, absorb heat or radiate it.`,
      fieldType: FieldType.MULTI_SELECT,
      isMandatory: false,
      promptWeight: 7,
      sortOrder: 17,
      terms: {
        create: [
          {
            name: "Calm",
            slug: "calm",
            description: "Even-tempered and steady; maintains focus under provocation. Debates with patience, minimizing emotional escalation while emphasizing reason and clarity.",
            sortOrder: 1,
          },
          {
            name: "Fiery",
            slug: "fiery",
            description: "Intensely expressive; channels emotion into urgency and drive. Brings heat and passion to arguments, often energizing the debate's tempo and stakes.",
            sortOrder: 2,
          },
          {
            name: "Composed",
            slug: "composed",
            description: "Controlled and deliberate; rarely shows agitation. Debates with polish and poise, giving an impression of authority and internal balance.",
            sortOrder: 3,
          },
          {
            name: "Warm",
            slug: "warm",
            description: "Open and inviting; conveys empathy and sincerity. Engages others through emotional resonance and reassurance, softening confrontation.",
            sortOrder: 4,
          },
          {
            name: "Assertive",
            slug: "assertive",
            description: "Confident and forward-leaning; pushes points decisively without aggression. Keeps control of tempo through clarity and self-assurance.",
            sortOrder: 5,
          },
          {
            name: "Reserved",
            slug: "reserved",
            description: "Quietly measured and minimal in expression. Debates with economy of tone, projecting discipline and reflective restraint.",
            sortOrder: 6,
          },
          {
            name: "Animated",
            slug: "animated",
            description: "Expressive and high-energy; gestures, inflections, and pacing convey enthusiasm. Keeps exchanges lively and audience-attentive.",
            sortOrder: 7,
          },
          {
            name: "Stoic",
            slug: "stoic",
            description: "Unflappable and emotionally contained; debates through endurance and principle. Projects steadiness under fire and prioritizes message over emotion.",
            sortOrder: 8,
          },
          {
            name: "Tense",
            slug: "tense",
            description: "Intense focus with visible pressure; debates feel high-stakes and immediate. May heighten friction or urgency, adding dramatic realism to exchanges.",
            sortOrder: 9,
          },
          {
            name: "Playful",
            slug: "playful",
            description: "Light-hearted and rhythmically dynamic; handles disagreement with charm and levity. Keeps tone agile and prevents stagnation without relying on jokes or irony.",
            sortOrder: 10,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Temperament category with ${temperamentCategory.terms.length} terms`);

  // Create Confidence taxonomy category
  console.log("📦 Creating Confidence taxonomy category...");

  const confidenceCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Confidence",
      slug: "confidence",
      description: `The Confidence property captures a persona's self-assuredness and comfort in public reasoning — how secure they appear when presenting ideas, handling pushback, and managing uncertainty. It does not encode expertise or arrogance; it signals presence and composure: how naturally they occupy space in a debate and project conviction.`,
      fieldType: FieldType.SLIDER,
      isMandatory: false,
      promptWeight: 6,
      sortOrder: 18,
      terms: {
        create: [
          {
            name: "Shy",
            slug: "shy",
            description: "Hesitant and self-effacing; enters cautiously and defers easily. Debates with modesty and thoughtfulness; often persuasive through sincerity and humility rather than force.",
            sortOrder: 1,
          },
          {
            name: "Tentative",
            slug: "tentative",
            description: "Mildly uncertain but engaged; tests ideas aloud and adjusts with feedback. Debates with curiosity and care, often appealing to fairness and collective reasoning.",
            sortOrder: 2,
          },
          {
            name: "Balanced",
            slug: "balanced",
            description: "Even-keeled and steady; confident without dominance. Debates from self-trust while staying open to correction, projecting credibility and calm conviction.",
            sortOrder: 3,
          },
          {
            name: "Confident",
            slug: "confident",
            description: "Clear and composed; speaks with poise and conviction. Debates assertively yet measured, balancing persuasion with respect and decisiveness.",
            sortOrder: 4,
          },
          {
            name: "Bold",
            slug: "bold",
            description: "Strongly self-assured; enters debates with visible presence and initiative. Challenges ideas directly, often setting tempo and framing through confidence in stance.",
            sortOrder: 5,
          },
          {
            name: "Dominant",
            slug: "dominant",
            description: "Commanding and unwavering; takes charge of flow and tone. Debates to lead, control narrative, and assert authority, sometimes at the cost of flexibility.",
            sortOrder: 6,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Confidence category with ${confidenceCategory.terms.length} terms`);

  // Create Tone taxonomy category
  console.log("📦 Creating Tone taxonomy category...");

  const toneCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Tone",
      slug: "tone",
      description: `The Tone property captures a persona's linguistic style and communicative register — how they express ideas through word choice, phrasing, and conversational formality. It does not encode ideology or emotional state; it signals presentation texture: casual vs. formal, poetic vs. precise, warm vs. dry.`,
      fieldType: FieldType.SINGLE_SELECT,
      isMandatory: false,
      promptWeight: 7,
      sortOrder: 19,
      terms: {
        create: [
          {
            name: "Casual",
            slug: "casual",
            description: "Conversational and spontaneous; uses plain language, idioms, and humor. Debates feel approachable and human, prioritizing connection over polish.",
            sortOrder: 1,
          },
          {
            name: "Neutral",
            slug: "neutral",
            description: "Clear and evenly toned; favors balance between accessibility and precision. Debates stay focused on clarity, free from slang or heavy formality.",
            sortOrder: 2,
          },
          {
            name: "Formal",
            slug: "formal",
            description: "Structured and professional; uses measured diction and polished phrasing. Debates emphasize credibility and decorum, suitable for academic or policy contexts.",
            sortOrder: 3,
          },
          {
            name: "Poetic",
            slug: "poetic",
            description: "Expressive and metaphorical; uses imagery, rhythm, and emotion to convey depth. Debates feel artistic or reflective, emphasizing resonance over efficiency.",
            sortOrder: 4,
          },
          {
            name: "Technical",
            slug: "technical",
            description: "Precise and domain-specific; uses disciplined terminology and careful logic. Debates focus on accuracy and rigor, often sounding analytical or expert-driven.",
            sortOrder: 5,
          },
          {
            name: "Witty",
            slug: "witty",
            description: "Light, clever, and sharp; employs timing and phrasing to punctuate arguments. Debates are engaging, quick-thinking, and agile without losing clarity.",
            sortOrder: 6,
          },
          {
            name: "Earnest",
            slug: "earnest",
            description: "Sincere and plainspoken; favors emotional clarity and moral grounding over polish. Debates emphasize truthfulness, intention, and transparency.",
            sortOrder: 7,
          },
          {
            name: "Dramatic",
            slug: "dramatic",
            description: "Theatrical and emphatic; uses rhythm and emphasis for impact. Debates feel performative and memorable, often heightening tension or urgency.",
            sortOrder: 8,
          },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Tone category with ${toneCategory.terms.length} terms`);

  // Create Conflict Style taxonomy category
  console.log("📦 Creating Conflict Style taxonomy category...");

  const conflictStyleCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Conflict Style",
      slug: "conflict-style",
      description: `The Conflict Style property captures a persona's instinctive approach to disagreement and tension — how they respond when challenged, contradicted, or emotionally provoked. It does not encode worldview, ideology, or emotional tone; it signals debate friction dynamics: when to escalate, de-escalate, yield, or reframe.`,
      fieldType: FieldType.MULTI_SELECT,
      isMandatory: false,
      promptWeight: 8,
      sortOrder: 20,
      terms: {
        create: [
          { name: "Avoidant", slug: "avoidant", description: "Sidesteps confrontation and redirects tension toward common ground. Debates through reframing or withdrawal rather than escalation; prioritizes harmony over dominance.", sortOrder: 1 },
          { name: "Accommodating", slug: "accommodating", description: "Yields ground easily to maintain rapport. Debates by validating others' points and minimizing friction; focuses on understanding rather than winning.", sortOrder: 2 },
          { name: "Collaborative", slug: "collaborative", description: "Engages tension as a joint problem to solve. Debates through synthesis and shared reasoning, inviting consensus-building and mutual discovery.", sortOrder: 3 },
          { name: "Compromising", slug: "compromising", description: "Balances assertiveness and cooperation; seeks partial alignment or trade-offs. Debates aim to move forward through pragmatic middle ground.", sortOrder: 4 },
          { name: "Competitive", slug: "competitive", description: "Treats debate as contest; defends positions forcefully and aims to prevail. Thrives on challenge, confrontation, and rhetorical control of the exchange.", sortOrder: 5 },
          { name: "Confrontational", slug: "confrontational", description: "Leans into direct, sometimes abrasive clash. Debates with intensity and candor, using friction to expose weaknesses and accelerate clarity.", sortOrder: 6 },
          { name: "Strategic", slug: "strategic", description: "Manages conflict tactically; escalates or retreats deliberately. Debates like a chess player—controlling tension to steer momentum or provoke specific reactions.", sortOrder: 7 },
          { name: "Deflective", slug: "deflective", description: "Uses humor, redirection, or abstraction to neutralize tension. Keeps conflict light and manageable while maintaining engagement.", sortOrder: 8 },
          { name: "Integrative", slug: "integrative", description: "Actively reconciles opposing logics; transforms disagreement into synthesis. Debates feel constructive, analytical, and resolution-oriented.", sortOrder: 9 },
          { name: "Relentless", slug: "relentless", description: "Refuses to yield once engaged; pursues consistency and closure. Debates with unbroken focus, often heightening tension until resolution is achieved.", sortOrder: 10 },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Conflict Style category with ${conflictStyleCategory.terms.length} terms`);

  // Create Vocabulary taxonomy category
  console.log("📦 Creating Vocabulary taxonomy category...");

  const vocabularyCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Vocabulary",
      slug: "vocabulary",
      description: `The Vocabulary property captures a persona's linguistic register and word-choice pattern — how their choice of words signals background, formality, and social alignment. It does not encode ideology or education level; it signals lexical texture: abstract vs. concrete, formal vs. informal, ornate vs. direct.`,
      fieldType: FieldType.SINGLE_SELECT,
      isMandatory: false,
      promptWeight: 7,
      sortOrder: 21,
      terms: {
        create: [
          { name: "Academic", slug: "academic", description: "Uses scholarly diction and structured syntax; favors terminology, references, and precision. Debates sound methodical and evidence-driven, often invoking research and theory.", sortOrder: 1 },
          { name: "Bureaucratic", slug: "bureaucratic", description: "Formal yet impersonal; relies on procedural phrasing, qualifiers, and institutional jargon. Debates mirror policy memos or administrative reasoning.", sortOrder: 2 },
          { name: "Professional", slug: "professional", description: "Clear, concise, and polished; employs workplace or business language. Debates focus on clarity, efficiency, and outcomes without excessive flourish.", sortOrder: 3 },
          { name: "Direct / Plainspoken", slug: "direct-plainspoken", description: "Uses simple, accessible language; avoids jargon and ornamentation. Debates emphasize honesty, clarity, and audience connection.", sortOrder: 4 },
          { name: "Poetic", slug: "poetic", description: "Rich in imagery, rhythm, and metaphor; emphasizes beauty of phrasing and emotional resonance. Debates feel artful and evocative, often reframing logic through symbol and mood.", sortOrder: 5 },
          { name: "Street / Colloquial", slug: "street-colloquial", description: "Rooted in slang and everyday speech; carries rhythm, wit, and authenticity. Debates feel spontaneous and grounded in lived experience.", sortOrder: 6 },
          { name: "Technical", slug: "technical", description: "Precise and domain-specific; favors exact terminology and structured reasoning. Debates sound specialized and expert-oriented, focused on accuracy and system detail.", sortOrder: 7 },
          { name: "Legalistic", slug: "legalistic", description: "Formal and clause-driven; employs argumentation framed by definitions, precedent, and logical formality. Debates mirror courtroom or procedural logic.", sortOrder: 8 },
          { name: "Journalistic", slug: "journalistic", description: "Clear, narrative, and reportorial; uses vivid yet factual phrasing. Debates emphasize storytelling through observation, balance, and framing of facts.", sortOrder: 9 },
          { name: "Flowery / Ornate", slug: "flowery-ornate", description: "Uses decorative and expressive vocabulary; prefers flourish, eloquence, and rhythm over brevity. Debates sound performative and grand in style.", sortOrder: 10 },
          { name: "Minimalist", slug: "minimalist", description: "Economical in language; uses concise sentences and plain structure. Debates feel focused, measured, and stripped of embellishment.", sortOrder: 11 },
          { name: "Rhetorical / Classical", slug: "rhetorical-classical", description: "Draws on structured argument traditions and elevated phrasing. Debates sound formal, moral, and oratorical, emphasizing cadence and persuasion.", sortOrder: 12 },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Vocabulary category with ${vocabularyCategory.terms.length} terms`);

  // Create Verbosity taxonomy category
  console.log("📦 Creating Verbosity taxonomy category...");

  const verbosityCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Verbosity",
      slug: "verbosity",
      description: `The Verbosity property captures a persona's natural length and density of expression — how much they elaborate, qualify, or condense their ideas when speaking. It does not encode intelligence, passion, or tone; it signals communication pacing: succinct vs. expansive, minimalist vs. discursive.`,
      fieldType: FieldType.SLIDER,
      isMandatory: false,
      promptWeight: 6,
      sortOrder: 22,
      terms: {
        create: [
          { name: "Terse", slug: "terse", description: "Uses the fewest words possible; sharp, clipped phrasing and high efficiency. Debates feel precise and impactful — every sentence lands cleanly before moving on.", sortOrder: 1 },
          { name: "Brief", slug: "brief", description: "Short and clear; presents reasoning concisely without abruptness. Debates move quickly, maintaining rhythm and clarity with minimal elaboration.", sortOrder: 2 },
          { name: "Moderate", slug: "moderate", description: "Balanced and natural; expands when needed but keeps focus. Debates feel conversational and well-paced, offering enough detail without slowing tempo.", sortOrder: 3 },
          { name: "Expansive", slug: "expansive", description: "Thorough and illustrative; supports arguments with examples and context. Debates unfold patiently, emphasizing clarity through explanation and nuance.", sortOrder: 4 },
          { name: "Verbose", slug: "verbose", description: "Long-winded and richly detailed; enjoys exploring tangents and context. Debates feel comprehensive and intellectual, prioritizing depth and completeness over brevity.", sortOrder: 5 },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Verbosity category with ${verbosityCategory.terms.length} terms`);

  // Create Debate Approach taxonomy category
  console.log("📦 Creating Debate Approach taxonomy category...");

  const debateApproachStrategyCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Debate Approach",
      slug: "debate-approach",
      description: `The Debate Approach property captures a persona's core method of engaging and persuading in debate — how they construct arguments, respond to opposition, and guide the emotional or logical flow of exchange. It does not encode worldview, confidence, or temperament; it signals argumentation strategy: whether they reason, evoke, provoke, or collaborate.`,
      fieldType: FieldType.MULTI_SELECT,
      isMandatory: false,
      promptWeight: 9,
      sortOrder: 23,
      terms: {
        create: [
          { name: "Logical", slug: "logical", description: "Anchors debate in structure, consistency, and evidence. Builds from premises to conclusions with clarity and restraint; values rational coherence above emotional appeal.", sortOrder: 1 },
          { name: "Emotional", slug: "emotional", description: "Leads with feeling, empathy, and moral urgency. Debates aim to move hearts before minds, using passion and narrative to frame what matters most.", sortOrder: 2 },
          { name: "Collaborative", slug: "collaborative", description: "Frames debate as shared inquiry; seeks synthesis and bridge-building. Emphasizes listening, reframing, and co-creation of understanding over dominance.", sortOrder: 3 },
          { name: "Confrontational", slug: "confrontational", description: "Thrives on direct clash; presses points forcefully and exposes weaknesses. Debates feel intense, strategic, and competitive — friction is a proving ground for truth.", sortOrder: 4 },
          { name: "Philosophical", slug: "philosophical", description: "Explores underlying assumptions and first principles. Debates operate on abstract or ethical terrain, testing definitions, values, and existential stakes.", sortOrder: 5 },
          { name: "Humorous", slug: "humorous", description: "Uses wit, irony, and playfulness to engage or disarm. Debates keep tension low while highlighting contradictions and inviting the audience to think sideways.", sortOrder: 6 },
          { name: "Analytical", slug: "analytical", description: "Deconstructs issues into systems and components. Debates focus on causal relationships, structure, and logic trees — intellectual but accessible.", sortOrder: 7 },
          { name: "Rhetorical", slug: "rhetorical", description: "Relies on phrasing, rhythm, and audience rapport. Debates sound polished, persuasive, and performance-aware; focuses on delivery and emotional cadence.", sortOrder: 8 },
          { name: "Pragmatic", slug: "pragmatic", description: "Argues from feasibility and implementation. Debates center on what *works* in real life rather than ideals; prioritizes trade-offs and tangible results.", sortOrder: 9 },
          { name: "Reflective", slug: "reflective", description: "Slower-paced and introspective; weighs perspectives before concluding. Debates feel contemplative and measured, often modeling humility and open-minded reasoning.", sortOrder: 10 },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Debate Approach category with ${debateApproachStrategyCategory.terms.length} terms`);

  // Create Voice Pitch taxonomy category
  console.log("📦 Creating Voice Pitch taxonomy category...");

  const voicePitchCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Voice Pitch",
      slug: "voice-pitch",
      description: `The Voice Pitch property captures a persona's natural vocal register and tonal height — how deep or high their voice sounds when speaking. It does not encode gender or emotion; it signals acoustic presence: resonance, energy, and vocal texture that shape how arguments are perceived in audio debates.`,
      fieldType: FieldType.SLIDER,
      isMandatory: false,
      promptWeight: 5,
      sortOrder: 24,
      terms: {
        create: [
          { name: "Very Low", slug: "very-low", description: "Deep, resonant, and grounded; conveys gravitas, calm authority, and maturity. Ideal for moderator or analytical personas.", sortOrder: 1 },
          { name: "Low", slug: "low", description: "Smooth and steady; carries warmth and assurance without heaviness. Communicates confidence and composure.", sortOrder: 2 },
          { name: "Medium (Neutral)", slug: "medium-neutral", description: "Natural and balanced; sits in a typical speaking range. Adaptable for most personas and debate contexts.", sortOrder: 3 },
          { name: "High", slug: "high", description: "Brighter and more energetic; conveys enthusiasm and attentiveness. Feels youthful or emotionally vivid.", sortOrder: 4 },
          { name: "Very High", slug: "very-high", description: "Light, crisp, and expressive; projects excitement and immediacy. Works well for passionate, fast-paced, or animated personas.", sortOrder: 5 },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Voice Pitch category with ${voicePitchCategory.terms.length} terms`);

  // Create Voice Speed / Rate taxonomy category
  console.log("📦 Creating Voice Speed / Rate taxonomy category...");

  const voiceSpeedCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Voice Speed / Rate",
      slug: "voice-speed-rate",
      description: `The Voice Speed property captures a persona's spoken pacing and rhythm — how quickly or slowly they deliver ideas in debate. It does not encode intelligence, tone, or verbosity; it signals tempo of delivery: urgency vs. patience, density vs. clarity, and how energy flows through speech.`,
      fieldType: FieldType.SLIDER,
      isMandatory: false,
      promptWeight: 5,
      sortOrder: 25,
      terms: {
        create: [
          { name: "Very Slow", slug: "very-slow", description: "Measured and deliberate; long pauses and steady rhythm. Debates feel thoughtful and reflective, emphasizing gravity or caution.", sortOrder: 1 },
          { name: "Slow", slug: "slow", description: "Calm and paced; allows time for emphasis and comprehension. Debates convey patience and clarity, ideal for moderators or deep thinkers.", sortOrder: 2 },
          { name: "Moderate (Neutral)", slug: "moderate-neutral", description: "Balanced and adaptable; maintains natural conversational flow. Debates sound clear, steady, and professional for most contexts.", sortOrder: 3 },
          { name: "Fast", slug: "fast", description: "Energetic and focused; packs ideas tightly without losing structure. Debates feel lively, confident, and persuasive.", sortOrder: 4 },
          { name: "Very Fast", slug: "very-fast", description: "Rapid and dynamic; high tempo and short pauses. Debates sound passionate, excitable, or high-stakes — ideal for animated or fiery personas.", sortOrder: 5 },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Voice Speed / Rate category with ${voiceSpeedCategory.terms.length} terms`);

  // Create Voice Volume / Gain taxonomy category
  console.log("📦 Creating Voice Volume / Gain taxonomy category...");

  const voiceVolumeCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Voice Volume / Gain",
      slug: "voice-volume-gain",
      description: `The Voice Volume property captures a persona's natural loudness and vocal presence — how forcefully or softly they project their voice in debate. It does not encode emotional tone or confidence; it signals auditory strength: whether the persona commands space through projection or invites focus through softness.`,
      fieldType: FieldType.SLIDER,
      isMandatory: false,
      promptWeight: 5,
      sortOrder: 26,
      terms: {
        create: [
          { name: "Very Soft", slug: "very-soft", description: "Gentle and understated; low projection with an intimate, reflective quality. Debates feel personal and introspective.", sortOrder: 1 },
          { name: "Soft", slug: "soft", description: "Mildly quiet and measured; conveys calm, restraint, or sensitivity. Debates sound thoughtful and listener-focused.", sortOrder: 2 },
          { name: "Moderate (Neutral)", slug: "moderate-neutral", description: "Natural, balanced loudness suitable for most settings. Debates sound clear and steady without dominance or whisper.", sortOrder: 3 },
          { name: "Loud", slug: "loud", description: "Strong and projected; clear presence in the mix. Debates sound assertive and confident, commanding audience attention.", sortOrder: 4 },
          { name: "Very Loud", slug: "very-loud", description: "Forceful and full-bodied; high projection and strong resonance. Debates feel passionate or authoritative — ideal for moderators, activists, or high-energy exchanges.", sortOrder: 5 },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Voice Volume / Gain category with ${voiceVolumeCategory.terms.length} terms`);

  // Create Voice Timbre taxonomy category
  console.log("📦 Creating Voice Timbre taxonomy category...");

  const voiceTimbreCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Voice Timbre",
      slug: "voice-timbre",
      description: `The Voice Timbre property captures a persona's vocal texture and harmonic quality — the distinctive "color" of their sound that shapes how personality is perceived in speech. It does not encode pitch, tone, or emotion; it signals sonic character: soft vs. sharp, airy vs. resonant, smooth vs. raspy.`,
      fieldType: FieldType.SINGLE_SELECT,
      isMandatory: false,
      promptWeight: 6,
      sortOrder: 27,
      terms: {
        create: [
          { name: "Warm", slug: "warm", description: "Full and rounded; smooth resonance with a friendly, comforting quality. Debates sound empathetic and grounded, ideal for approachable or mentor-like personas.", sortOrder: 1 },
          { name: "Bright", slug: "bright", description: "Clear and lively; crisp upper frequencies make speech sound alert and engaging. Debates feel energetic and articulate.", sortOrder: 2 },
          { name: "Soft", slug: "soft", description: "Gentle and breathy; light articulation and airy presence. Debates feel calm, intimate, and emotionally open.", sortOrder: 3 },
          { name: "Crisp", slug: "crisp", description: "Clean and well-defined; sharp consonants and quick articulation. Debates sound polished, confident, and precise.", sortOrder: 4 },
          { name: "Resonant", slug: "resonant", description: "Deep and rich; echoes subtly with chest or throat fullness. Debates project authority, stability, and composure.", sortOrder: 5 },
          { name: "Raspy", slug: "raspy", description: "Rough-edged and textured; adds grit and realism. Debates sound weathered, passionate, or emotionally raw.", sortOrder: 6 },
          { name: "Nasal", slug: "nasal", description: "Focused and midrange-heavy; sound radiates through the nose cavity. Debates feel animated, quirky, or youthful.", sortOrder: 7 },
          { name: "Metallic", slug: "metallic", description: "Bright and slightly synthetic; sharp resonance with cool tonal edges. Debates sound futuristic, robotic, or assertive.", sortOrder: 8 },
          { name: "Breathy", slug: "breathy", description: "Whisper-like airflow with soft consonant edges. Debates feel vulnerable, reflective, or emotionally charged.", sortOrder: 9 },
          { name: "Smooth", slug: "smooth", description: "Balanced and flowing; minimal texture with rounded articulation. Debates sound effortless, refined, and listener-friendly.", sortOrder: 10 },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Voice Timbre category with ${voiceTimbreCategory.terms.length} terms`);

  // Create Voice Tone / Mood taxonomy category
  console.log("📦 Creating Voice Tone / Mood taxonomy category...");

  const voiceToneMoodCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Voice Tone / Mood",
      slug: "voice-tone-mood",
      description: `The Voice Tone property captures a persona's emotional coloration and expressive mood — the underlying feeling carried by their vocal delivery. It does not encode temperament or ideology; it signals affective shading: warmth vs. sharpness, empathy vs. detachment, optimism vs. gravity.`,
      fieldType: FieldType.MULTI_SELECT,
      isMandatory: false,
      promptWeight: 7,
      sortOrder: 28,
      terms: {
        create: [
          { name: "Warm", slug: "warm", description: "Kind and reassuring; soft inflection and gentle resonance. Debates sound approachable and human, ideal for moderators or empathetic personas.", sortOrder: 1 },
          { name: "Neutral", slug: "neutral", description: "Even and steady; minimal emotional emphasis. Debates sound professional, balanced, and objective — suitable for analytic or impartial speakers.", sortOrder: 2 },
          { name: "Serious", slug: "serious", description: "Focused and grounded; low variation in pitch and tempo. Debates carry gravity and respect for topic weight, often evoking authority or contemplation.", sortOrder: 3 },
          { name: "Friendly", slug: "friendly", description: "Upbeat and welcoming; lively phrasing and open energy. Debates feel inviting and conversational, maintaining rapport even under disagreement.", sortOrder: 4 },
          { name: "Sharp", slug: "sharp", description: "Tense and pointed; precise articulation with slight edge. Debates sound intense, competitive, and disciplined — ideal for assertive or critical personas.", sortOrder: 5 },
          { name: "Calm", slug: "calm", description: "Relaxed and measured; smooth pacing and balanced dynamics. Debates project control, patience, and steadiness even during conflict.", sortOrder: 6 },
          { name: "Passionate", slug: "passionate", description: "Emotionally charged and expressive; dynamic volume and inflection. Debates feel heartfelt and driven, focusing on conviction and persuasion.", sortOrder: 7 },
          { name: "Detached", slug: "detached", description: "Cool and distant; minimal emotional engagement. Debates sound clinical or skeptical, highlighting logic and precision over warmth.", sortOrder: 8 },
          { name: "Playful", slug: "playful", description: "Light and dynamic; rhythmic energy with mild humor or irony. Debates sound agile and engaging, suited for witty or creative personas.", sortOrder: 9 },
          { name: "Somber", slug: "somber", description: "Low energy and reflective; reduced brightness and slow delivery. Debates carry emotional depth and seriousness, evoking empathy or respect.", sortOrder: 10 },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Voice Tone / Mood category with ${voiceToneMoodCategory.terms.length} terms`);

  // Create Voice Energy / Intensity taxonomy category
  console.log("📦 Creating Voice Energy / Intensity taxonomy category...");

  const voiceEnergyCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Voice Energy / Intensity",
      slug: "voice-energy-intensity",
      description: `The Voice Energy property captures a persona's vocal drive and expressive momentum — how forcefully and dynamically they deliver speech. It does not encode emotion or loudness; it signals kinetic presence: how actively the voice moves through words, how much power is sustained across phrases, and how alive the performance feels.`,
      fieldType: FieldType.SLIDER,
      isMandatory: false,
      promptWeight: 6,
      sortOrder: 29,
      terms: {
        create: [
          { name: "Very Low", slug: "very-low", description: "Gentle and subdued; low breath force and minimal emphasis. Debates sound quiet and introspective — ideal for reflective or analytical personas.", sortOrder: 1 },
          { name: "Low", slug: "low", description: "Calm and steady; limited projection and subtle phrasing. Debates feel relaxed and thoughtful without loss of clarity.", sortOrder: 2 },
          { name: "Moderate (Neutral)", slug: "moderate-neutral", description: "Natural speaking energy; balanced projection and flow. Debates sound realistic, adaptable, and professional for most contexts.", sortOrder: 3 },
          { name: "High", slug: "high", description: "Lively and engaged; frequent emphasis and bright dynamics. Debates sound animated, persuasive, and emotionally charged.", sortOrder: 4 },
          { name: "Very High", slug: "very-high", description: "Intense and forceful; strong projection and rapid modulation. Debates sound passionate, motivational, or performative — suited for fiery or charismatic personas.", sortOrder: 5 },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Voice Energy / Intensity category with ${voiceEnergyCategory.terms.length} terms`);

  // Create Voice Formality taxonomy category
  console.log("📦 Creating Voice Formality taxonomy category...");

  const voiceFormalityCategory = await prisma.taxonomyCategory.create({
    data: {
      name: "Voice Formality",
      slug: "voice-formality",
      description: `The Voice Formality property captures a persona's level of linguistic polish and speech decorum — how refined, casual, or ceremonious their voice sounds in delivery. It does not encode education, intelligence, or vocabulary; it signals register and etiquette: whether the voice projects professionalism, ease, or familiarity.`,
      fieldType: FieldType.SLIDER,
      isMandatory: false,
      promptWeight: 6,
      sortOrder: 30,
      terms: {
        create: [
          { name: "Very Informal", slug: "very-informal", description: "Conversational and unfiltered; uses contractions, slang, and relaxed rhythm. Debates feel spontaneous, friendly, and grounded in everyday speech.", sortOrder: 1 },
          { name: "Informal", slug: "informal", description: "Easygoing and natural; smooth phrasing without stiffness. Debates sound personable and relatable, maintaining clarity without ceremony.", sortOrder: 2 },
          { name: "Neutral (Balanced)", slug: "neutral-balanced", description: "Clear and direct; adapts to context. Debates sound natural yet professional, striking balance between polish and authenticity.", sortOrder: 3 },
          { name: "Formal", slug: "formal", description: "Structured and deliberate; careful articulation, clear sentence boundaries, and moderate rhythm. Debates sound polished, credible, and respectful.", sortOrder: 4 },
          { name: "Very Formal", slug: "very-formal", description: "Ceremonious and elevated; precise enunciation and stately pacing. Debates sound dignified and authoritative — suited for academic, political, or diplomatic personas.", sortOrder: 5 },
        ],
      },
    },
    include: {
      terms: true,
    },
  });

  console.log(`✅ Created Voice Formality category with ${voiceFormalityCategory.terms.length} terms`);

  // Create Format Templates
  console.log("\n📦 Creating Format Templates...");

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

  console.log("✅ Created 4 preset format templates");

  console.log("\n📊 Summary:");
  console.log(`   Categories: 30`);
  console.log(`   Terms: ${archetypesCategory.terms.length + regionCategory.terms.length + cultureCategory.terms.length + communityTypeCategory.terms.length + politicalOrientationCategory.terms.length + religionCategory.terms.length + philosophicalStanceCategory.terms.length + accentDialectCategory.terms.length + debateApproachCategory.terms.length + fillerPhrasesCategory.terms.length + preferredMetaphorsCategory.terms.length + universityCategory.terms.length + employerTypeCategory.terms.length + ageGroupCategory.terms.length + genderIdentityCategory.terms.length + pronounCategory.terms.length + temperamentCategory.terms.length + confidenceCategory.terms.length + toneCategory.terms.length + conflictStyleCategory.terms.length + vocabularyCategory.terms.length + verbosityCategory.terms.length + debateApproachStrategyCategory.terms.length + voicePitchCategory.terms.length + voiceSpeedCategory.terms.length + voiceVolumeCategory.terms.length + voiceTimbreCategory.terms.length + voiceToneMoodCategory.terms.length + voiceEnergyCategory.terms.length + voiceFormalityCategory.terms.length}`);
  console.log(`   Format Templates: 4`);
  console.log("\n✨ Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
