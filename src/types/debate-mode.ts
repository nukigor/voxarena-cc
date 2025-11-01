import { Mode } from "@prisma/client";

export type DebateModeFormData = {
  name: string;
  slug: string;
  teaser?: string | null;
  description?: string | null;
};

export interface DebateModesResponse {
  modes: Mode[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
