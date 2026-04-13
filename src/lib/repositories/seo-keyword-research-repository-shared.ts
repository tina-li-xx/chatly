import type { SeoKeywordResearchRunStatus } from "@/lib/seo-keyword-research-types";

export type SeoKeywordResearchRunRow = {
  id: string;
  owner_user_id: string;
  actor_user_id: string | null;
  source_profile_slug: string;
  status: SeoKeywordResearchRunStatus;
  provider_chain: string;
  seed_queries_json: unknown;
  summary_json: unknown;
  harvested_keyword_count: number;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
};

export const SEO_KEYWORD_RESEARCH_RUN_COLUMNS = `
  id,
  owner_user_id,
  actor_user_id,
  source_profile_slug,
  status,
  provider_chain,
  seed_queries_json,
  summary_json,
  harvested_keyword_count,
  generated_at::text AS generated_at,
  created_at::text AS created_at,
  updated_at::text AS updated_at
`;
