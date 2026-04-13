import { query } from "@/lib/db";
import type { SeoPlanItemStatus } from "@/lib/seo-planning-types";
import {
  SEO_PLAN_ITEM_COLUMNS,
  serializeSeoPlanItems,
  type ReplaceSeoPlanItemInput,
  type SeoPlanItemRow
} from "@/lib/repositories/seo-pipeline-repository-shared";

export async function listSeoPlanItemRows(ownerUserId: string, runId: string) {
  const result = await query<SeoPlanItemRow>(
    `
      SELECT
        ${SEO_PLAN_ITEM_COLUMNS}
      FROM seo_plan_items
      WHERE owner_user_id = $1
        AND run_id = $2
      ORDER BY position ASC, created_at ASC
    `,
    [ownerUserId, runId]
  );

  return result.rows;
}

export async function replaceSeoPlanItemRows(input: {
  ownerUserId: string;
  runId: string;
  items: ReplaceSeoPlanItemInput[];
}) {
  await query(
    `
      DELETE FROM seo_plan_items
      WHERE owner_user_id = $1
        AND run_id = $2
    `,
    [input.ownerUserId, input.runId]
  );

  if (!input.items.length) {
    return [];
  }

  const result = await query<SeoPlanItemRow>(
    `
      WITH payload AS (
        SELECT *
        FROM jsonb_to_recordset($3::jsonb) AS item(
          id text,
          position integer,
          status text,
          target_publish_at timestamptz,
          title text,
          target_keyword text,
          keyword_cluster text,
          search_intent text,
          content_format text,
          persona_slug text,
          theme_slug text,
          category_slug text,
          cta_id text,
          priority_score integer,
          rationale text,
          notes text,
          metadata_json jsonb
        )
      )
      INSERT INTO seo_plan_items (
        id,
        run_id,
        owner_user_id,
        position,
        status,
        target_publish_at,
        title,
        target_keyword,
        keyword_cluster,
        search_intent,
        content_format,
        persona_slug,
        theme_slug,
        category_slug,
        cta_id,
        priority_score,
        rationale,
        notes,
        metadata_json,
        updated_at
      )
      SELECT
        id,
        $2,
        $1,
        position,
        status,
        target_publish_at,
        title,
        target_keyword,
        keyword_cluster,
        search_intent,
        content_format,
        persona_slug,
        theme_slug,
        category_slug,
        cta_id,
        priority_score,
        rationale,
        notes,
        COALESCE(metadata_json, '{}'::jsonb),
        NOW()
      FROM payload
      ORDER BY position ASC
      RETURNING
        ${SEO_PLAN_ITEM_COLUMNS}
    `,
    [
      input.ownerUserId,
      input.runId,
      JSON.stringify(serializeSeoPlanItems(input.items))
    ]
  );

  return result.rows;
}

export async function updateSeoPlanItemStatus(input: {
  id: string;
  ownerUserId: string;
  status: SeoPlanItemStatus;
  notes?: string | null;
}) {
  const result = await query<SeoPlanItemRow>(
    `
      UPDATE seo_plan_items
      SET status = $3,
          notes = COALESCE($4, notes),
          updated_at = NOW()
      WHERE id = $1
        AND owner_user_id = $2
      RETURNING
        ${SEO_PLAN_ITEM_COLUMNS}
    `,
    [input.id, input.ownerUserId, input.status, input.notes ?? null]
  );

  return result.rows[0] ?? null;
}
