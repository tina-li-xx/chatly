import { query } from "@/lib/db";

export async function markSeoKeywordCorpusCycleMisses(input: {
  ownerUserId: string;
  runId: string;
  seenNormalizedKeywords: string[];
  staleAfterCycles?: number;
}) {
  await query(
    `
      UPDATE seo_keyword_corpus
      SET latest_run_id = $2,
          missing_cycle_count = missing_cycle_count + 1,
          stale_at = CASE
            WHEN missing_cycle_count + 1 >= $4 THEN COALESCE(stale_at, NOW())
            ELSE stale_at
          END,
          opportunity_score = GREATEST(1, opportunity_score - 4),
          updated_at = NOW()
      WHERE owner_user_id = $1
        AND NOT (normalized_keyword = ANY($3::text[]))
    `,
    [input.ownerUserId, input.runId, input.seenNormalizedKeywords, input.staleAfterCycles ?? 3]
  );
}
