import "server-only";

import { getQueuedBlogPosts, getRelatedBlogPosts } from "@/lib/blog-data";
import type { BlogPostWithDetails } from "@/lib/blog-types";
import {
  findSeoGeneratedDraftRowBySlug,
  listSeoGeneratedDraftRows
} from "@/lib/repositories/seo-generated-drafts-repository";
import { isQueuedGeneratedDraftRow, toGeneratedBlogPost } from "@/lib/seo-generated-blog-posts";

function compareQueuedPosts(left: BlogPostWithDetails, right: BlogPostWithDetails) {
  return left.publishedAt.localeCompare(right.publishedAt);
}

function dedupeBySlug(posts: BlogPostWithDetails[]) {
  return posts.filter((post, index, all) => all.findIndex((candidate) => candidate.slug === post.slug) === index);
}

export async function getDashboardPublishingQueuedPosts(ownerUserId: string) {
  const generated = (await listSeoGeneratedDraftRows(ownerUserId, 50))
    .filter((row) => isQueuedGeneratedDraftRow(row))
    .map((row) => toGeneratedBlogPost(row))
    .filter((entry): entry is BlogPostWithDetails => Boolean(entry));

  return dedupeBySlug([...generated, ...getQueuedBlogPosts()]).sort(compareQueuedPosts);
}

export async function getDashboardPublishingQueuedPostBySlug(ownerUserId: string, slug: string) {
  const generated = await findSeoGeneratedDraftRowBySlug(ownerUserId, slug);
  if (generated) {
    const post = isQueuedGeneratedDraftRow(generated) ? toGeneratedBlogPost(generated) : null;
    if (post) {
      return post;
    }
  }

  return getQueuedBlogPosts().find((post) => post.slug === slug || post.aliases?.includes(slug)) ?? null;
}

export async function getDashboardPublishingRelatedPosts(ownerUserId: string, post: BlogPostWithDetails, limit = 3) {
  const generated = await getDashboardPublishingQueuedPosts(ownerUserId);
  const explicit = post.relatedSlugs
    .map((slug) => generated.find((entry) => entry.slug === slug))
    .filter((entry): entry is BlogPostWithDetails => Boolean(entry));

  if (explicit.length >= limit) {
    return explicit.slice(0, limit);
  }

  const fallback = [...generated, ...getRelatedBlogPosts(post, limit)]
    .filter((entry) => entry.slug !== post.slug && entry.category.slug === post.category.slug)
    .filter((entry, index, all) => all.findIndex((candidate) => candidate.slug === entry.slug) === index);

  return [...explicit, ...fallback].slice(0, limit);
}
