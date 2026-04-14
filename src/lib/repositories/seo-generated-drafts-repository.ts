import { query } from "@/lib/db";
import type {
  SeoGeneratedDraftPublicationStatus,
  SeoGeneratedDraftStatus
} from "@/lib/seo-planning-types";
import {
  SEO_GENERATED_DRAFT_COLUMNS,
  type SeoGeneratedDraftRow
} from "@/lib/repositories/seo-pipeline-repository-shared";

export async function listSeoGeneratedDraftRows(ownerUserId: string, limit = 30) {
  const result = await query<SeoGeneratedDraftRow>(
    `
      SELECT
        ${SEO_GENERATED_DRAFT_COLUMNS}
      FROM seo_generated_drafts
      WHERE owner_user_id = $1
      ORDER BY updated_at DESC, created_at DESC
      LIMIT $2
    `,
    [ownerUserId, limit]
  );

  return result.rows;
}

export async function findSeoGeneratedDraftRow(ownerUserId: string, id: string) {
  const result = await query<SeoGeneratedDraftRow>(
    `
      SELECT
        ${SEO_GENERATED_DRAFT_COLUMNS}
      FROM seo_generated_drafts
      WHERE owner_user_id = $1
        AND id = $2
      LIMIT 1
    `,
    [ownerUserId, id]
  );

  return result.rows[0] ?? null;
}

export async function findSeoGeneratedDraftRowBySlug(ownerUserId: string, slug: string) {
  const result = await query<SeoGeneratedDraftRow>(
    `
      SELECT
        ${SEO_GENERATED_DRAFT_COLUMNS}
      FROM seo_generated_drafts
      WHERE owner_user_id = $1
        AND slug = $2
      LIMIT 1
    `,
    [ownerUserId, slug]
  );

  return result.rows[0] ?? null;
}

export async function findSeoGeneratedDraftRowByPlanItemId(ownerUserId: string, planItemId: string) {
  const result = await query<SeoGeneratedDraftRow>(
    `
      SELECT
        ${SEO_GENERATED_DRAFT_COLUMNS}
      FROM seo_generated_drafts
      WHERE owner_user_id = $1
        AND plan_item_id = $2
      LIMIT 1
    `,
    [ownerUserId, planItemId]
  );

  return result.rows[0] ?? null;
}

export async function insertSeoGeneratedDraftRow(input: {
  id: string;
  ownerUserId: string;
  actorUserId?: string | null;
  planRunId?: string | null;
  planItemId?: string | null;
  status?: SeoGeneratedDraftStatus;
  title: string;
  slug: string;
  excerpt?: string;
  subtitle?: string;
  authorSlug?: string;
  categorySlug?: string;
  publicationStatus?: SeoGeneratedDraftPublicationStatus;
  readingTime?: number;
  heroImagePrompt?: string;
  draftPayloadJson: Record<string, unknown>;
  metadataJson?: Record<string, unknown>;
}) {
  const result = await query<SeoGeneratedDraftRow>(
    `
      INSERT INTO seo_generated_drafts (
        id,
        owner_user_id,
        actor_user_id,
        plan_run_id,
        plan_item_id,
        status,
        title,
        slug,
        excerpt,
        subtitle,
        author_slug,
        category_slug,
        publication_status,
        reading_time,
        hero_image_prompt,
        draft_payload_json,
        metadata_json,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::jsonb, $17::jsonb, NOW())
      RETURNING
        ${SEO_GENERATED_DRAFT_COLUMNS}
    `,
    [
      input.id,
      input.ownerUserId,
      input.actorUserId ?? null,
      input.planRunId ?? null,
      input.planItemId ?? null,
      input.status ?? "draft",
      input.title,
      input.slug,
      input.excerpt ?? "",
      input.subtitle ?? "",
      input.authorSlug ?? "",
      input.categorySlug ?? "",
      input.publicationStatus ?? "draft",
      input.readingTime ?? 0,
      input.heroImagePrompt ?? "",
      JSON.stringify(input.draftPayloadJson),
      JSON.stringify(input.metadataJson ?? {})
    ]
  );

  return result.rows[0] ?? null;
}

export async function updateSeoGeneratedDraftStatus(input: {
  id: string;
  ownerUserId: string;
  status: SeoGeneratedDraftStatus;
  publicationStatus?: SeoGeneratedDraftPublicationStatus | null;
  metadataJson?: Record<string, unknown> | null;
}) {
  const result = await query<SeoGeneratedDraftRow>(
    `
      UPDATE seo_generated_drafts
      SET status = $3,
          publication_status = COALESCE($4, publication_status),
          metadata_json = COALESCE($5::jsonb, metadata_json),
          updated_at = NOW()
      WHERE id = $1
        AND owner_user_id = $2
      RETURNING
        ${SEO_GENERATED_DRAFT_COLUMNS}
    `,
    [
      input.id,
      input.ownerUserId,
      input.status,
      input.publicationStatus ?? null,
      input.metadataJson ? JSON.stringify(input.metadataJson) : null
    ]
  );

  return result.rows[0] ?? null;
}

export async function deleteSeoGeneratedDraftRow(ownerUserId: string, id: string) {
  const result = await query<SeoGeneratedDraftRow>(
    `
      DELETE FROM seo_generated_drafts
      WHERE owner_user_id = $1
        AND id = $2
      RETURNING
        ${SEO_GENERATED_DRAFT_COLUMNS}
    `,
    [ownerUserId, id]
  );

  return result.rows[0] ?? null;
}
