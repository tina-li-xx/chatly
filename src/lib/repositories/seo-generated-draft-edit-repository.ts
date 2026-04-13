import { query } from "@/lib/db";
import type {
  SeoGeneratedDraftPublicationStatus,
  SeoGeneratedDraftStatus
} from "@/lib/seo-planning-types";
import {
  SEO_GENERATED_DRAFT_COLUMNS,
  type SeoGeneratedDraftRow
} from "@/lib/repositories/seo-pipeline-repository-shared";

export async function updateSeoGeneratedDraftRow(input: {
  id: string;
  ownerUserId: string;
  title: string;
  slug: string;
  excerpt?: string;
  subtitle?: string;
  authorSlug?: string;
  categorySlug?: string;
  readingTime?: number;
  heroImagePrompt?: string;
  status?: SeoGeneratedDraftStatus | null;
  publicationStatus?: SeoGeneratedDraftPublicationStatus | null;
  draftPayloadJson: Record<string, unknown>;
  metadataJson?: Record<string, unknown> | null;
}) {
  const result = await query<SeoGeneratedDraftRow>(
    `
      UPDATE seo_generated_drafts
      SET title = $3,
          slug = $4,
          excerpt = $5,
          subtitle = $6,
          author_slug = $7,
          category_slug = $8,
          reading_time = $9,
          hero_image_prompt = $10,
          draft_payload_json = $11::jsonb,
          metadata_json = COALESCE($12::jsonb, metadata_json),
          status = COALESCE($13, status),
          publication_status = COALESCE($14, publication_status),
          updated_at = NOW()
      WHERE id = $1
        AND owner_user_id = $2
      RETURNING
        ${SEO_GENERATED_DRAFT_COLUMNS}
    `,
    [
      input.id,
      input.ownerUserId,
      input.title,
      input.slug,
      input.excerpt ?? "",
      input.subtitle ?? "",
      input.authorSlug ?? "",
      input.categorySlug ?? "",
      input.readingTime ?? 0,
      input.heroImagePrompt ?? "",
      JSON.stringify(input.draftPayloadJson),
      input.metadataJson ? JSON.stringify(input.metadataJson) : null,
      input.status ?? null,
      input.publicationStatus ?? null
    ]
  );

  return result.rows[0] ?? null;
}
