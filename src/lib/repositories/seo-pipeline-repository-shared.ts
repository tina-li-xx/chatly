import type {
  SeoGeneratedDraftPublicationStatus,
  SeoGeneratedDraftStatus,
  SeoPlanItemStatus,
  SeoPlanRunStatus
} from "@/lib/seo-planning-types";

export type SeoPlanRunRow = {
  id: string;
  owner_user_id: string;
  actor_user_id: string | null;
  source_profile_slug: string;
  status: SeoPlanRunStatus;
  strategy_snapshot_json: unknown;
  summary_json: unknown;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SeoPlanItemRow = {
  id: string;
  run_id: string;
  owner_user_id: string;
  position: number;
  status: SeoPlanItemStatus;
  target_publish_at: string | null;
  title: string;
  target_keyword: string;
  keyword_cluster: string;
  search_intent: string;
  content_format: string;
  persona_slug: string;
  theme_slug: string;
  category_slug: string;
  cta_id: string;
  priority_score: number;
  rationale: string;
  notes: string;
  metadata_json: unknown;
  created_at: string;
  updated_at: string;
};

export type ReplaceSeoPlanItemInput = {
  id: string;
  position: number;
  status?: SeoPlanItemStatus;
  targetPublishAt?: string | null;
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
};

export type SeoGeneratedDraftRow = {
  id: string;
  owner_user_id: string;
  actor_user_id: string | null;
  plan_run_id: string | null;
  plan_item_id: string | null;
  status: SeoGeneratedDraftStatus;
  title: string;
  slug: string;
  excerpt: string;
  subtitle: string;
  author_slug: string;
  category_slug: string;
  publication_status: SeoGeneratedDraftPublicationStatus;
  reading_time: number;
  hero_image_prompt: string;
  draft_payload_json: unknown;
  metadata_json: unknown;
  created_at: string;
  updated_at: string;
};

export const SEO_PLAN_RUN_COLUMNS = `
  id,
  owner_user_id,
  actor_user_id,
  source_profile_slug,
  status,
  strategy_snapshot_json,
  summary_json,
  generated_at::text AS generated_at,
  created_at::text AS created_at,
  updated_at::text AS updated_at
`;

export const SEO_PLAN_ITEM_COLUMNS = `
  id,
  run_id,
  owner_user_id,
  position,
  status,
  target_publish_at::text AS target_publish_at,
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
  created_at::text AS created_at,
  updated_at::text AS updated_at
`;

export const SEO_GENERATED_DRAFT_COLUMNS = `
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
  created_at::text AS created_at,
  updated_at::text AS updated_at
`;

export function serializeSeoPlanItems(items: ReplaceSeoPlanItemInput[]) {
  return items.map((item) => ({
    id: item.id,
    position: item.position,
    status: item.status ?? "planned",
    target_publish_at: item.targetPublishAt ?? null,
    title: item.title,
    target_keyword: item.targetKeyword,
    keyword_cluster: item.keywordCluster ?? "",
    search_intent: item.searchIntent ?? "",
    content_format: item.contentFormat ?? "article",
    persona_slug: item.personaSlug ?? "",
    theme_slug: item.themeSlug ?? "",
    category_slug: item.categorySlug ?? "",
    cta_id: item.ctaId ?? "",
    priority_score: item.priorityScore ?? 0,
    rationale: item.rationale ?? "",
    notes: item.notes ?? "",
    metadata_json: item.metadataJson ?? {}
  }));
}
