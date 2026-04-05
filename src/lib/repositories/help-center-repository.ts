import { query } from "@/lib/db";

export type HelpCenterArticleRow = {
  id: string;
  owner_user_id: string;
  title: string;
  slug: string;
  body: string;
  created_at: string;
  updated_at: string;
};

type HelpCenterPreviewArticleRow = Pick<
  HelpCenterArticleRow,
  "id" | "title" | "slug" | "body" | "updated_at"
>;

export async function listHelpCenterArticleRows(ownerUserId: string) {
  const result = await query<HelpCenterArticleRow>(
    `
      SELECT id, owner_user_id, title, slug, body, created_at, updated_at
      FROM help_center_articles
      WHERE owner_user_id = $1
      ORDER BY updated_at DESC, title ASC
    `,
    [ownerUserId]
  );

  return result.rows;
}

export async function countHelpCenterArticleRows(ownerUserId: string) {
  const result = await query<{ article_count: string }>(
    `
      SELECT COUNT(*)::text AS article_count
      FROM help_center_articles
      WHERE owner_user_id = $1
    `,
    [ownerUserId]
  );

  return Number(result.rows[0]?.article_count ?? 0);
}

export async function listHelpCenterPreviewArticleRows(ownerUserId: string, limit = 8) {
  const result = await query<HelpCenterPreviewArticleRow>(
    `
      SELECT id, title, slug, body, updated_at
      FROM help_center_articles
      WHERE owner_user_id = $1
      ORDER BY updated_at DESC, title ASC
      LIMIT $2
    `,
    [ownerUserId, limit]
  );

  return result.rows;
}

export async function findHelpCenterArticleRowBySlug(ownerUserId: string, slug: string) {
  const result = await query<HelpCenterArticleRow>(
    `
      SELECT id, owner_user_id, title, slug, body, created_at, updated_at
      FROM help_center_articles
      WHERE owner_user_id = $1
        AND slug = $2
      LIMIT 1
    `,
    [ownerUserId, slug]
  );

  return result.rows[0] ?? null;
}

export async function insertHelpCenterArticleRow(input: {
  id: string;
  ownerUserId: string;
  title: string;
  slug: string;
  body: string;
}) {
  const result = await query<HelpCenterArticleRow>(
    `
      INSERT INTO help_center_articles (id, owner_user_id, title, slug, body, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, owner_user_id, title, slug, body, created_at, updated_at
    `,
    [input.id, input.ownerUserId, input.title, input.slug, input.body]
  );

  return result.rows[0] ?? null;
}

export async function updateHelpCenterArticleRow(input: {
  id: string;
  ownerUserId: string;
  title: string;
  slug: string;
  body: string;
}) {
  const result = await query<HelpCenterArticleRow>(
    `
      UPDATE help_center_articles
      SET title = $3,
          slug = $4,
          body = $5,
          updated_at = NOW()
      WHERE id = $1
        AND owner_user_id = $2
      RETURNING id, owner_user_id, title, slug, body, created_at, updated_at
    `,
    [input.id, input.ownerUserId, input.title, input.slug, input.body]
  );

  return result.rows[0] ?? null;
}

export async function deleteHelpCenterArticleRow(id: string, ownerUserId: string) {
  const result = await query<{ id: string }>(
    `
      DELETE FROM help_center_articles
      WHERE id = $1
        AND owner_user_id = $2
      RETURNING id
    `,
    [id, ownerUserId]
  );

  return Boolean(result.rowCount);
}
