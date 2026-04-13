import "server-only";

import { normalizeBlogPostFaqSections } from "@/lib/blog-faq-normalization";
import { hydrateBlogPost } from "@/lib/blog-data";
import { isPublishedBlogPost, isQueuedBlogPost } from "@/lib/blog-publication";
import { readDraftPayloadPost } from "@/lib/chatting-seo-draft-shared";
import type { BlogPublicationStatus, BlogPostWithDetails } from "@/lib/blog-types";
import type { SeoGeneratedDraftRow } from "@/lib/repositories/seo-pipeline-repository-shared";
import type { SeoGeneratedDraftStatus } from "@/lib/seo-planning-types";

function resolvePublishedAt(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function readMetadata(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function isAutopilotReviewDraft(row: SeoGeneratedDraftRow) {
  const metadata = readMetadata(row.metadata_json);
  return metadata.autopilotGenerated === true && metadata.approvedForScheduling !== true;
}

export function resolveGeneratedDraftWorkflowStatus(row: SeoGeneratedDraftRow): SeoGeneratedDraftStatus {
  return row.status === "scheduled" && isAutopilotReviewDraft(row) ? "ready_for_review" : row.status;
}

export function resolveGeneratedDraftPublicationStatus(row: SeoGeneratedDraftRow, now = new Date()): BlogPublicationStatus | null {
  const payloadPost = readDraftPayloadPost(row.draft_payload_json);
  const status = row.publication_status || payloadPost?.publicationStatus || "draft";
  const publishedAt = resolvePublishedAt(payloadPost?.publishedAt || "");

  if (status === "scheduled" && isAutopilotReviewDraft(row)) {
    return "draft";
  }

  if (status === "scheduled" && publishedAt !== null && publishedAt <= now.getTime()) {
    return "published";
  }

  return status === "published" || status === "scheduled" || status === "draft" ? status : null;
}

export function toGeneratedBlogPost(row: SeoGeneratedDraftRow, now = new Date()): BlogPostWithDetails | null {
  const payloadPost = readDraftPayloadPost(row.draft_payload_json);
  const normalizedPayloadPost = payloadPost ? normalizeBlogPostFaqSections(payloadPost) : null;
  const publicationStatus = resolveGeneratedDraftPublicationStatus(row, now);

  if (!normalizedPayloadPost || !publicationStatus) {
    return null;
  }

  try {
    return hydrateBlogPost({
      ...normalizedPayloadPost,
      title: row.title || normalizedPayloadPost.title,
      slug: row.slug || normalizedPayloadPost.slug,
      excerpt: row.excerpt || normalizedPayloadPost.excerpt,
      subtitle: row.subtitle || normalizedPayloadPost.subtitle,
      authorSlug: row.author_slug || normalizedPayloadPost.authorSlug,
      categorySlug: (row.category_slug || normalizedPayloadPost.categorySlug) as typeof normalizedPayloadPost.categorySlug,
      publicationStatus,
      readingTime: row.reading_time ?? normalizedPayloadPost.readingTime,
      updatedAt: row.updated_at || normalizedPayloadPost.updatedAt
    });
  } catch {
    return null;
  }
}

export function isQueuedGeneratedDraftRow(row: SeoGeneratedDraftRow, now = new Date()) {
  const post = toGeneratedBlogPost(row, now);
  return post ? isQueuedBlogPost(post, now) : false;
}

export function isReviewGeneratedDraftRow(row: SeoGeneratedDraftRow, now = new Date()) {
  const workflowStatus = resolveGeneratedDraftWorkflowStatus(row);
  const publicationStatus = resolveGeneratedDraftPublicationStatus(row, now);
  return publicationStatus === "draft" && workflowStatus !== "archived" && workflowStatus !== "scheduled";
}

export function isPublishedGeneratedDraftRow(row: SeoGeneratedDraftRow, now = new Date()) {
  const post = toGeneratedBlogPost(row, now);
  return post ? isPublishedBlogPost(post, now) : false;
}
