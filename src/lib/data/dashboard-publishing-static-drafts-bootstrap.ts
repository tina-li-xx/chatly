import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { getQueuedBlogPosts } from "@/lib/blog-data";
import type { BlogPost, BlogPostWithDetails } from "@/lib/blog-types";
import { toDraftPayloadPost } from "@/lib/chatting-seo-draft-shared";
import { withPostgresAdvisoryLock } from "@/lib/postgres-advisory-lock";
import {
  insertSeoGeneratedDraftRow,
  listSeoGeneratedDraftRows
} from "@/lib/repositories/seo-generated-drafts-repository";

function lockKey(ownerUserId: string) {
  const digest = createHash("sha256").update(`${ownerUserId}:static-post-mirror`).digest();
  return [20260413, digest.readInt32BE(0)] as const;
}

function toBlogPost(post: BlogPostWithDetails): BlogPost {
  const { author: _author, category: _category, ...blogPost } = post;
  return blogPost;
}

function toWorkflowStatus(post: BlogPostWithDetails) {
  return post.publicationStatus === "scheduled" ? "scheduled" : "draft";
}

export async function ensureDashboardPublishingStaticDraftMirror(input: {
  ownerUserId: string;
  actorUserId?: string | null;
}) {
  const lock = await withPostgresAdvisoryLock(lockKey(input.ownerUserId), async () => {
    const existing = await listSeoGeneratedDraftRows(input.ownerUserId, 200);
    const existingSlugs = new Set(existing.map((row) => row.slug));
    const inserted = [];

    for (const post of getQueuedBlogPosts()) {
      if (existingSlugs.has(post.slug)) {
        continue;
      }

      const row = await insertSeoGeneratedDraftRow({
        id: `seo_draft_${randomUUID()}`,
        ownerUserId: input.ownerUserId,
        actorUserId: input.actorUserId ?? null,
        status: toWorkflowStatus(post),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        subtitle: post.subtitle,
        authorSlug: post.authorSlug,
        categorySlug: post.categorySlug,
        publicationStatus: post.publicationStatus ?? "draft",
        readingTime: post.readingTime,
        heroImagePrompt: "",
        draftPayloadJson: toDraftPayloadPost(toBlogPost(post)),
        metadataJson: {
          source: "repo-static",
          mirroredStaticQueuedPost: true,
          approvedForScheduling: post.publicationStatus === "scheduled",
          targetPublishAt: post.publishedAt
        }
      });

      if (row) {
        inserted.push(row);
      }
    }

    return inserted;
  });

  return lock.value ?? [];
}
