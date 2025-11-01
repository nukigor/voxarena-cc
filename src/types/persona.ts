import { Persona, PersonaStatus, TaxonomyTerm, TaxonomyCategory } from "@prisma/client";

export type PersonaWithRelations = Persona & {
  taxonomyValues: {
    id: string;
    term: TaxonomyTerm & {
      category: TaxonomyCategory;
    };
  }[];
  _count?: {
    debateParticipations: number;
  };
};

export interface PersonaFormData {
  name: string;
  nickname?: string;
  professionRole?: string;
  quirks?: string;
  status: PersonaStatus;
  taxonomyTermIds: string[];
}

export interface PersonaCreateInput {
  name: string;
  nickname?: string;
  professionRole?: string;
  quirks?: string;
  taxonomyTermIds: string[];
}

export interface PersonaUpdateInput extends PersonaCreateInput {
  id: string;
  avatarUrl?: string;
  status?: PersonaStatus;
}
