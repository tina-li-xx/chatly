import { query } from "@/lib/db";
import {
  SEO_KEYWORD_SERP_SNAPSHOT_COLUMNS,
  serializeSeoKeywordSerpSnapshotRows,
  type InsertSeoKeywordSerpSnapshotInput,
  type SeoKeywordSerpSnapshotRow
} from "@/lib/repositories/seo-keyword-serp-snapshots-repository-shared";

export async function insertSeoKeywordSerpSnapshotRows(input: {
  ownerUserId: string;
  items: InsertSeoKeywordSerpSnapshotInput[];
}) {
  if (!input.items.length) {
    return [];
  }

  const result = await query<SeoKeywordSerpSnapshotRow>(
    `
      WITH payload AS (
        SELECT *
        FROM jsonb_to_recordset($2::jsonb) AS item(
          id text,
          run_id text,
          keyword_corpus_id text,
          normalized_keyword text,
          source_query text,
          provider text,
          rank integer,
          result_url text,
          result_domain text,
          result_title text,
          result_snippet text,
          matched_competitor_slug text,
          is_chatting boolean,
          content_pattern text,
          captured_at timestamptz
        )
      )
      INSERT INTO seo_keyword_serp_snapshots (
        id,
        owner_user_id,
        run_id,
        keyword_corpus_id,
        normalized_keyword,
        source_query,
        provider,
        rank,
        result_url,
        result_domain,
        result_title,
        result_snippet,
        matched_competitor_slug,
        is_chatting,
        content_pattern,
        captured_at
      )
      SELECT
        id,
        $1,
        run_id,
        keyword_corpus_id,
        normalized_keyword,
        source_query,
        provider,
        rank,
        result_url,
        result_domain,
        result_title,
        result_snippet,
        matched_competitor_slug,
        is_chatting,
        content_pattern,
        captured_at
      FROM payload
      RETURNING
        ${SEO_KEYWORD_SERP_SNAPSHOT_COLUMNS}
    `,
    [input.ownerUserId, JSON.stringify(serializeSeoKeywordSerpSnapshotRows(input.items))]
  );

  return result.rows;
}
