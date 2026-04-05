import { query } from "@/lib/db";

export type SavedReplyRow = {
  id: string;
  owner_user_id: string;
  title: string;
  body: string;
  tags: string[];
  updated_at: string;
};

export type SavedReplyTagRow = {
  tags: string[];
};

export async function listSavedReplyRows(ownerUserId: string) {
  const result = await query<SavedReplyRow>(
    `
      SELECT id, owner_user_id, title, body, COALESCE(tags, ARRAY[]::TEXT[]) AS tags, updated_at
      FROM saved_replies
      WHERE owner_user_id = $1
      ORDER BY updated_at DESC, title ASC
    `,
    [ownerUserId]
  );

  return result.rows;
}

export async function listSavedReplyTagRows(ownerUserId: string) {
  const result = await query<SavedReplyTagRow>(
    `
      SELECT COALESCE(tags, ARRAY[]::TEXT[]) AS tags
      FROM saved_replies
      WHERE owner_user_id = $1
    `,
    [ownerUserId]
  );

  return result.rows;
}

export async function insertSavedReplyRow(input: {
  id: string;
  ownerUserId: string;
  title: string;
  body: string;
  tags: string[];
}) {
  const result = await query<SavedReplyRow>(
    `
      INSERT INTO saved_replies (id, owner_user_id, title, body, tags, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, owner_user_id, title, body, COALESCE(tags, ARRAY[]::TEXT[]) AS tags, updated_at
    `,
    [input.id, input.ownerUserId, input.title, input.body, input.tags]
  );

  return result.rows[0] ?? null;
}

export async function updateSavedReplyRow(input: {
  id: string;
  ownerUserId: string;
  title: string;
  body: string;
  tags: string[];
}) {
  const result = await query<SavedReplyRow>(
    `
      UPDATE saved_replies
      SET title = $3,
          body = $4,
          tags = $5,
          updated_at = NOW()
      WHERE id = $1
        AND owner_user_id = $2
      RETURNING id, owner_user_id, title, body, COALESCE(tags, ARRAY[]::TEXT[]) AS tags, updated_at
    `,
    [input.id, input.ownerUserId, input.title, input.body, input.tags]
  );

  return result.rows[0] ?? null;
}

export async function deleteSavedReplyRow(id: string, ownerUserId: string) {
  const result = await query<{ id: string }>(
    `
      DELETE FROM saved_replies
      WHERE id = $1
        AND owner_user_id = $2
      RETURNING id
    `,
    [id, ownerUserId]
  );

  return Boolean(result.rowCount);
}
