import { query } from "@/lib/db";
import type { SeoKeywordResearchRunStatus } from "@/lib/seo-keyword-research-types";
import {
  SEO_KEYWORD_RESEARCH_RUN_COLUMNS,
  type SeoKeywordResearchRunRow
} from "@/lib/repositories/seo-keyword-research-repository-shared";

export async function listSeoKeywordResearchRunRows(ownerUserId: string, limit = 20) {
  const result = await query<SeoKeywordResearchRunRow>(
    `
      SELECT
        ${SEO_KEYWORD_RESEARCH_RUN_COLUMNS}
      FROM seo_keyword_research_runs
      WHERE owner_user_id = $1
      ORDER BY COALESCE(generated_at, updated_at, created_at) DESC, created_at DESC
      LIMIT $2
    `,
    [ownerUserId, limit]
  );

  return result.rows;
}

export async function insertSeoKeywordResearchRunRow(input: {
  id: string;
  ownerUserId: string;
  actorUserId?: string | null;
  sourceProfileSlug?: string;
  status?: SeoKeywordResearchRunStatus;
  providerChain?: string;
  seedQueriesJson?: unknown[];
  summaryJson?: Record<string, unknown>;
  harvestedKeywordCount?: number;
  generatedAt?: string | null;
}) {
  const result = await query<SeoKeywordResearchRunRow>(
    `
      INSERT INTO seo_keyword_research_runs (
        id,
        owner_user_id,
        actor_user_id,
        source_profile_slug,
        status,
        provider_chain,
        seed_queries_json,
        summary_json,
        harvested_keyword_count,
        generated_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10, NOW())
      RETURNING
        ${SEO_KEYWORD_RESEARCH_RUN_COLUMNS}
    `,
    [
      input.id,
      input.ownerUserId,
      input.actorUserId ?? null,
      input.sourceProfileSlug ?? "chatting-default",
      input.status ?? "draft",
      input.providerChain ?? "",
      JSON.stringify(input.seedQueriesJson ?? []),
      JSON.stringify(input.summaryJson ?? {}),
      input.harvestedKeywordCount ?? 0,
      input.generatedAt ?? null
    ]
  );

  return result.rows[0] ?? null;
}

export async function updateSeoKeywordResearchRunStatus(input: {
  id: string;
  ownerUserId: string;
  status: SeoKeywordResearchRunStatus;
  providerChain?: string | null;
  seedQueriesJson?: unknown[] | null;
  summaryJson?: Record<string, unknown> | null;
  harvestedKeywordCount?: number | null;
  generatedAt?: string | null;
}) {
  const result = await query<SeoKeywordResearchRunRow>(
    `
      UPDATE seo_keyword_research_runs
      SET status = $3,
          provider_chain = COALESCE($4, provider_chain),
          seed_queries_json = COALESCE($5::jsonb, seed_queries_json),
          summary_json = COALESCE($6::jsonb, summary_json),
          harvested_keyword_count = COALESCE($7, harvested_keyword_count),
          generated_at = COALESCE($8, generated_at),
          updated_at = NOW()
      WHERE id = $1
        AND owner_user_id = $2
      RETURNING
        ${SEO_KEYWORD_RESEARCH_RUN_COLUMNS}
    `,
    [
      input.id,
      input.ownerUserId,
      input.status,
      input.providerChain ?? null,
      input.seedQueriesJson ? JSON.stringify(input.seedQueriesJson) : null,
      input.summaryJson ? JSON.stringify(input.summaryJson) : null,
      input.harvestedKeywordCount ?? null,
      input.generatedAt ?? null
    ]
  );

  return result.rows[0] ?? null;
}
