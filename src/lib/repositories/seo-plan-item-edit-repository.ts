import { query } from "@/lib/db";
import {
  SEO_PLAN_ITEM_COLUMNS,
  type SeoPlanItemRow
} from "@/lib/repositories/seo-pipeline-repository-shared";

export async function findSeoPlanItemRow(ownerUserId: string, id: string) {
  const result = await query<SeoPlanItemRow>(
    `
      SELECT
        ${SEO_PLAN_ITEM_COLUMNS}
      FROM seo_plan_items
      WHERE owner_user_id = $1
        AND id = $2
      LIMIT 1
    `,
    [ownerUserId, id]
  );

  return result.rows[0] ?? null;
}

export async function updateSeoPlanItemRow(input: {
  id: string;
  ownerUserId: string;
  title: string;
  targetKeyword: string;
  keywordCluster?: string;
  searchIntent?: string;
  contentFormat?: string;
  personaSlug?: string;
  themeSlug?: string;
  categorySlug?: string;
  ctaId?: string;
  priorityScore?: number;
  rationale?: string;
  notes?: string;
  metadataJson?: Record<string, unknown>;
}) {
  const result = await query<SeoPlanItemRow>(
    `
      UPDATE seo_plan_items
      SET title = $3,
          target_keyword = $4,
          keyword_cluster = $5,
          search_intent = $6,
          content_format = $7,
          persona_slug = $8,
          theme_slug = $9,
          category_slug = $10,
          cta_id = $11,
          priority_score = $12,
          rationale = $13,
          notes = $14,
          metadata_json = COALESCE($15::jsonb, metadata_json),
          updated_at = NOW()
      WHERE id = $1
        AND owner_user_id = $2
      RETURNING
        ${SEO_PLAN_ITEM_COLUMNS}
    `,
    [
      input.id,
      input.ownerUserId,
      input.title,
      input.targetKeyword,
      input.keywordCluster ?? input.targetKeyword,
      input.searchIntent ?? "",
      input.contentFormat ?? "article",
      input.personaSlug ?? "",
      input.themeSlug ?? "",
      input.categorySlug ?? "",
      input.ctaId ?? "",
      input.priorityScore ?? 0,
      input.rationale ?? "",
      input.notes ?? "",
      input.metadataJson ? JSON.stringify(input.metadataJson) : null
    ]
  );

  return result.rows[0] ?? null;
}

export async function updateSeoPlanItemTargetPublishAt(input: {
  id: string;
  ownerUserId: string;
  targetPublishAt: string;
}) {
  const result = await query<SeoPlanItemRow>(
    `
      UPDATE seo_plan_items
      SET target_publish_at = $3::timestamptz,
          updated_at = NOW()
      WHERE id = $1
        AND owner_user_id = $2
      RETURNING
        ${SEO_PLAN_ITEM_COLUMNS}
    `,
    [input.id, input.ownerUserId, input.targetPublishAt]
  );

  return result.rows[0] ?? null;
}
