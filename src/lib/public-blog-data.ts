import "server-only";

import { cache } from "react";
import {
  getAllBlogPosts,
  getAnyBlogAuthorBySlug,
  getBlogCategoryBySlug
} from "@/lib/blog-data";
import { getChattingPublishingWorkspace } from "@/lib/chatting-publishing-workspace";
import type { BlogAuthor, BlogCategorySlug, BlogPostWithDetails } from "@/lib/blog-types";
import { isPublishedGeneratedDraftRow, toGeneratedBlogPost } from "@/lib/seo-generated-blog-posts";
import { listSeoGeneratedDraftRows } from "@/lib/repositories/seo-generated-drafts-repository";

function byNewest(left: BlogPostWithDetails, right: BlogPostWithDetails) {
  return right.publishedAt.localeCompare(left.publishedAt);
}

function dedupePosts(posts: BlogPostWithDetails[]) {
  return posts.filter((post, index, all) => all.findIndex((candidate) => candidate.slug === post.slug) === index);
}

function requirePublicBlogPost(post: BlogPostWithDetails | undefined) {
  if (!post) {
    throw new Error("BLOG_DATA_EMPTY");
  }

  return post;
}

function isNextProductionBuildPhase(phase = process.env.NEXT_PHASE) {
  return phase === "phase-production-build";
}

const getGeneratedPublishedPostsFromWorkspace = cache(async () => {
  const workspace = await getChattingPublishingWorkspace();
  if (!workspace) {
    return [] as BlogPostWithDetails[];
  }

  try {
    const rows = await listSeoGeneratedDraftRows(workspace.ownerUserId, 200);
    return rows
      .filter((row) => isPublishedGeneratedDraftRow(row))
      .map((row) => toGeneratedBlogPost(row))
      .filter((post): post is BlogPostWithDetails => Boolean(post));
  } catch {
    return [] as BlogPostWithDetails[];
  }
});

async function getGeneratedPublishedPosts() {
  if (isNextProductionBuildPhase()) {
    return [] as BlogPostWithDetails[];
  }

  return getGeneratedPublishedPostsFromWorkspace();
}

export async function getPublicBlogPosts() {
  return dedupePosts([...(await getGeneratedPublishedPosts()), ...getAllBlogPosts()]).sort(byNewest);
}

export async function getPublicFeaturedBlogPost() {
  const posts = await getPublicBlogPosts();
  return requirePublicBlogPost(posts.find((post) => post.featured) ?? posts[0] ?? getAllBlogPosts()[0]);
}

export async function getPublicBlogPostsByCategory(categorySlug: BlogCategorySlug | "all") {
  const posts = await getPublicBlogPosts();
  return categorySlug === "all" ? posts : posts.filter((post) => post.category.slug === categorySlug);
}

export async function getPublicBlogPostBySlug(slug: string) {
  return (await getPublicBlogPosts()).find((post) => post.slug === slug || post.aliases?.includes(slug)) ?? null;
}

export async function getPublicBlogPostsByAuthor(authorSlug: string) {
  return (await getPublicBlogPosts()).filter((post) => post.author.slug === authorSlug);
}

export async function getPublicBlogAuthors() {
  const authorSlugs = new Set((await getPublicBlogPosts()).map((post) => post.author.slug));
  return [...authorSlugs]
    .map((slug) => getAnyBlogAuthorBySlug(slug))
    .filter((author): author is BlogAuthor => Boolean(author));
}

export async function getPublicBlogAuthorBySlug(slug: string) {
  return (await getPublicBlogAuthors()).find((author) => author.slug === slug) ?? null;
}

export async function getPublicRelatedBlogPosts(post: BlogPostWithDetails, limit = 3) {
  const posts = await getPublicBlogPosts();
  const explicit = post.relatedSlugs
    .map((slug) => posts.find((candidate) => candidate.slug === slug))
    .filter((entry): entry is BlogPostWithDetails => Boolean(entry));

  if (explicit.length >= limit) {
    return explicit.slice(0, limit);
  }

  const category = getBlogCategoryBySlug(post.category.slug);
  if (!category) {
    return explicit.slice(0, limit);
  }

  const fallback = posts.filter(
    (candidate) =>
      candidate.slug !== post.slug &&
      candidate.category.slug === category.slug &&
      !explicit.some((entry) => entry.slug === candidate.slug)
  );

  return [...explicit, ...fallback].slice(0, limit);
}
