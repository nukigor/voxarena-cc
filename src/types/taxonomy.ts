import { TaxonomyCategory, TaxonomyTerm, FieldType } from "@prisma/client";

export type TaxonomyCategoryWithTerms = TaxonomyCategory & {
  terms: TaxonomyTerm[];
};

export type TaxonomyCategoryWithCount = TaxonomyCategory & {
  _count: {
    terms: number;
  };
};

export type TaxonomyTermWithCategory = TaxonomyTerm & {
  category: TaxonomyCategory;
};

export interface TaxonomyCategoryFormData {
  name: string;
  slug: string;
  description: string;
  fieldType: FieldType;
  isMandatory: boolean;
  promptWeight: number;
  sortOrder: number;
}

export interface TaxonomyTermFormData {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
}

export interface TaxonomyCreateInput {
  category: TaxonomyCategoryFormData;
  terms?: Omit<TaxonomyTermFormData, "categoryId">[];
}

export interface TaxonomyCategoriesResponse {
  categories: TaxonomyCategoryWithCount[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface TaxonomyTermsResponse {
  terms: TaxonomyTermWithCategory[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
