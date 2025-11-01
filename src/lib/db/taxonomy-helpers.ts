import prisma from "./prisma";
import { FieldType } from "@prisma/client";

/**
 * Get all taxonomy categories with their terms
 */
export async function getAllTaxonomies() {
  return await prisma.taxonomyCategory.findMany({
    include: {
      terms: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

/**
 * Get a specific taxonomy category by slug
 */
export async function getTaxonomyBySlug(slug: string) {
  return await prisma.taxonomyCategory.findUnique({
    where: { slug },
    include: {
      terms: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
}

/**
 * Get taxonomies grouped by field type
 */
export async function getTaxonomiesByFieldType(fieldType: FieldType) {
  return await prisma.taxonomyCategory.findMany({
    where: { fieldType },
    include: {
      terms: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

/**
 * Get mandatory taxonomies
 */
export async function getMandatoryTaxonomies() {
  return await prisma.taxonomyCategory.findMany({
    where: { isMandatory: true },
    include: {
      terms: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

/**
 * Get persona with all taxonomy values populated
 */
export async function getPersonaWithTaxonomy(personaId: string) {
  return await prisma.persona.findUnique({
    where: { id: personaId },
    include: {
      taxonomyValues: {
        include: {
          term: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Create or update persona with taxonomy values
 */
export async function upsertPersonaWithTaxonomy(
  personaData: {
    id?: string;
    name: string;
    nickname?: string;
    avatarUrl?: string;
    professionRole?: string;
    quirks?: string;
    status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  },
  taxonomyTermIds: string[]
) {
  const { id, ...data } = personaData;

  // Create or update persona
  const persona = id
    ? await prisma.persona.update({
        where: { id },
        data,
      })
    : await prisma.persona.create({
        data,
      });

  // Delete existing taxonomy values if updating
  if (id) {
    await prisma.personaTaxonomyValue.deleteMany({
      where: { personaId: persona.id },
    });
  }

  // Create new taxonomy values
  await prisma.personaTaxonomyValue.createMany({
    data: taxonomyTermIds.map((termId) => ({
      personaId: persona.id,
      termId,
    })),
  });

  return persona;
}
