import { query } from "@/lib/db";
import {
  SEO_KEYWORD_CORPUS_COLUMNS,
  serializeSeoKeywordCorpusRows,
  type SeoKeywordCorpusRow,
  type UpsertSeoKeywordCorpusInput
} from "@/lib/repositories/seo-keyword-corpus-repository-shared";

export async function listSeoKeywordCorpusRows(ownerUserId: string, limit = 30) {
  const result = await query<SeoKeywordCorpusRow>(
    `
      SELECT
        ${SEO_KEYWORD_CORPUS_COLUMNS}
      FROM seo_keyword_corpus
      WHERE owner_user_id = $1
      ORDER BY CASE WHEN stale_at IS NULL THEN 0 ELSE 1 END ASC,
               opportunity_score DESC,
               appearance_count DESC,
               last_seen_at DESC,
               updated_at DESC
      LIMIT $2
    `,
    [ownerUserId, limit]
  );

  return result.rows;
}

export async function upsertSeoKeywordCorpusRows(input: {
  ownerUserId: string;
  items: UpsertSeoKeywordCorpusInput[];
}) {
  if (!input.items.length) {
    return [];
  }

  const result = await query<SeoKeywordCorpusRow>(
    `
      WITH payload AS (
        SELECT *
        FROM jsonb_to_recordset($2::jsonb) AS item(
          id text,
          latest_run_id text,
          keyword text,
          normalized_keyword text,
          suggested_title text,
          source_query text,
          source_title text,
          theme_slug text,
          associated_competitor_slug text,
          intent text,
          difficulty text,
          audience_label text,
          rationale text,
          opportunity_score integer,
          evidence_count integer,
          appearance_count integer,
          missing_cycle_count integer,
          chatting_rank integer,
          competitor_hits integer,
          persistence_score integer,
          competitor_density_score integer,
          chatting_gap_score integer,
          small_team_relevance_score integer,
          commercial_intent_score integer,
          stability_score integer,
          providers_json jsonb,
          result_domains_json jsonb,
          serp_results_json jsonb,
          metadata_json jsonb,
          first_seen_at timestamptz,
          last_seen_at timestamptz,
          stale_at timestamptz
        )
      )
      INSERT INTO seo_keyword_corpus (
        id,
        owner_user_id,
        latest_run_id,
        normalized_keyword,
        keyword,
        suggested_title,
        source_query,
        source_title,
        theme_slug,
        associated_competitor_slug,
        intent,
        difficulty,
        audience_label,
        rationale,
        opportunity_score,
        evidence_count,
        appearance_count,
        missing_cycle_count,
        chatting_rank,
        competitor_hits,
        persistence_score,
        competitor_density_score,
        chatting_gap_score,
        small_team_relevance_score,
        commercial_intent_score,
        stability_score,
        providers_json,
        result_domains_json,
        serp_results_json,
        metadata_json,
        first_seen_at,
        last_seen_at,
        stale_at,
        updated_at
      )
      SELECT
        id,
        $1,
        latest_run_id,
        normalized_keyword,
        keyword,
        suggested_title,
        source_query,
        source_title,
        theme_slug,
        associated_competitor_slug,
        intent,
        difficulty,
        audience_label,
        rationale,
        opportunity_score,
        evidence_count,
        appearance_count,
        missing_cycle_count,
        chatting_rank,
        competitor_hits,
        persistence_score,
        competitor_density_score,
        chatting_gap_score,
        small_team_relevance_score,
        commercial_intent_score,
        stability_score,
        COALESCE(providers_json, '[]'::jsonb),
        COALESCE(result_domains_json, '[]'::jsonb),
        COALESCE(serp_results_json, '[]'::jsonb),
        COALESCE(metadata_json, '{}'::jsonb),
        first_seen_at,
        last_seen_at,
        stale_at,
        NOW()
      FROM payload
      ON CONFLICT (owner_user_id, normalized_keyword) DO UPDATE
      SET latest_run_id = EXCLUDED.latest_run_id,
          keyword = EXCLUDED.keyword,
          suggested_title = EXCLUDED.suggested_title,
          source_query = EXCLUDED.source_query,
          source_title = EXCLUDED.source_title,
          theme_slug = EXCLUDED.theme_slug,
          associated_competitor_slug = EXCLUDED.associated_competitor_slug,
          intent = EXCLUDED.intent,
          difficulty = EXCLUDED.difficulty,
          audience_label = EXCLUDED.audience_label,
          rationale = EXCLUDED.rationale,
          opportunity_score = EXCLUDED.opportunity_score,
          evidence_count = EXCLUDED.evidence_count,
          appearance_count = EXCLUDED.appearance_count,
          missing_cycle_count = EXCLUDED.missing_cycle_count,
          chatting_rank = EXCLUDED.chatting_rank,
          competitor_hits = EXCLUDED.competitor_hits,
          persistence_score = EXCLUDED.persistence_score,
          competitor_density_score = EXCLUDED.competitor_density_score,
          chatting_gap_score = EXCLUDED.chatting_gap_score,
          small_team_relevance_score = EXCLUDED.small_team_relevance_score,
          commercial_intent_score = EXCLUDED.commercial_intent_score,
          stability_score = EXCLUDED.stability_score,
          providers_json = EXCLUDED.providers_json,
          result_domains_json = EXCLUDED.result_domains_json,
          serp_results_json = EXCLUDED.serp_results_json,
          metadata_json = EXCLUDED.metadata_json,
          first_seen_at = LEAST(seo_keyword_corpus.first_seen_at, EXCLUDED.first_seen_at),
          last_seen_at = GREATEST(seo_keyword_corpus.last_seen_at, EXCLUDED.last_seen_at),
          stale_at = EXCLUDED.stale_at,
          updated_at = NOW()
      RETURNING
        ${SEO_KEYWORD_CORPUS_COLUMNS}
    `,
    [input.ownerUserId, JSON.stringify(serializeSeoKeywordCorpusRows(input.items))]
  );

  return result.rows;
}
