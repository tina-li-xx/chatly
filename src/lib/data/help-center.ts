import { randomUUID } from "node:crypto";
import type { DashboardHelpCenterArticle } from "@/lib/data/settings-types";
import {
  deleteHelpCenterArticleRow,
  findHelpCenterArticleRowBySlug,
  insertHelpCenterArticleRow,
  listHelpCenterPreviewArticleRows,
  listHelpCenterArticleRows,
  updateHelpCenterArticleRow
} from "@/lib/repositories/help-center-repository";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { getSiteByPublicId } from "./sites";

function readString(value: string) {
  return value.trim();
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapHelpCenterArticle(row: {
  id: string;
  title: string;
  slug: string;
  body: string;
  updated_at: string;
}) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    body: row.body,
    updatedAt: row.updated_at
  } satisfies DashboardHelpCenterArticle;
}

function normalizeArticleInput(input: { title: string; slug?: string; body: string }) {
  const title = readString(input.title).slice(0, 120);
  const body = readString(input.body).slice(0, 12000);
  const slug = toSlug(readString(input.slug || input.title)).slice(0, 80);

  if (!title || !body || !slug) {
    throw new Error("MISSING_FIELDS");
  }

  return { title, slug, body };
}

function isSlugConflict(error: unknown) {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function listHelpCenterArticles(userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  return (await listHelpCenterArticleRows(workspace.ownerUserId)).map(mapHelpCenterArticle);
}

export async function listHelpCenterPreviewArticles(userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  return (await listHelpCenterPreviewArticleRows(workspace.ownerUserId)).map(mapHelpCenterArticle);
}

export async function createHelpCenterArticle(userId: string, input: { title: string; slug?: string; body: string }) {
  const workspace = await getWorkspaceAccess(userId);

  try {
    const article = await insertHelpCenterArticleRow({
      id: `article_${randomUUID()}`,
      ownerUserId: workspace.ownerUserId,
      ...normalizeArticleInput(input)
    });
    if (!article) {
      throw new Error("SAVE_FAILED");
    }

    return mapHelpCenterArticle(article);
  } catch (error) {
    if (isSlugConflict(error)) {
      throw new Error("SLUG_TAKEN");
    }

    throw error;
  }
}

export async function updateHelpCenterArticle(
  userId: string,
  input: { id: string; title: string; slug?: string; body: string }
) {
  const workspace = await getWorkspaceAccess(userId);

  try {
    const article = await updateHelpCenterArticleRow({
      id: input.id,
      ownerUserId: workspace.ownerUserId,
      ...normalizeArticleInput(input)
    });
    if (!article) {
      throw new Error("NOT_FOUND");
    }

    return mapHelpCenterArticle(article);
  } catch (error) {
    if (isSlugConflict(error)) {
      throw new Error("SLUG_TAKEN");
    }

    throw error;
  }
}

export async function deleteHelpCenterArticle(userId: string, id: string) {
  const workspace = await getWorkspaceAccess(userId);
  if (!(await deleteHelpCenterArticleRow(id, workspace.ownerUserId))) {
    throw new Error("NOT_FOUND");
  }
}

export async function listHelpCenterArticlesForSite(siteId: string) {
  const site = await getSiteByPublicId(siteId);
  if (!site) {
    return null;
  }

  return {
    site,
    articles: (await listHelpCenterArticleRows(site.userId)).map(mapHelpCenterArticle)
  };
}

export async function getHelpCenterArticleForSite(siteId: string, slug: string) {
  const site = await getSiteByPublicId(siteId);
  if (!site) {
    return null;
  }

  const article = await findHelpCenterArticleRowBySlug(site.userId, toSlug(slug));
  if (!article) {
    return null;
  }

  return {
    site,
    article: mapHelpCenterArticle(article)
  };
}
