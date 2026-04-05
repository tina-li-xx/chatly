import { randomUUID } from "node:crypto";
import type { DashboardSavedReply } from "@/lib/data/settings-types";
import {
  deleteSavedReplyRow,
  insertSavedReplyRow,
  listSavedReplyRows,
  updateSavedReplyRow
} from "@/lib/repositories/saved-replies-repository";
import { optionalText } from "@/lib/utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";

function mapSavedReply(row: {
  id: string;
  title: string;
  body: string;
  tags: string[];
  updated_at: string;
}): DashboardSavedReply {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    tags: row.tags,
    updatedAt: row.updated_at
  };
}

function normalizeSavedReplyTags(tags: string[] | undefined) {
  const seen = new Set<string>();

  return (tags ?? [])
    .map((tag) => optionalText(tag))
    .filter((tag): tag is string => Boolean(tag))
    .map((tag) => tag.slice(0, 24))
    .filter((tag) => {
      const normalized = tag.toLowerCase();
      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    })
    .slice(0, 8);
}

function normalizeSavedReplyInput(input: { title: string; body: string; tags?: string[] }) {
  const title = optionalText(input.title);
  const body = optionalText(input.body);

  if (!title || !body) {
    throw new Error("MISSING_FIELDS");
  }

  return {
    title: title.slice(0, 80),
    body: body.slice(0, 4000),
    tags: normalizeSavedReplyTags(input.tags)
  };
}

export async function listSavedReplies(userId: string, workspaceOwnerId?: string) {
  const ownerUserId = workspaceOwnerId ?? (await getWorkspaceAccess(userId)).ownerUserId;
  return (await listSavedReplyRows(ownerUserId)).map(mapSavedReply);
}

export async function createSavedReply(
  userId: string,
  input: { title: string; body: string; tags?: string[] },
  workspaceOwnerId?: string
) {
  const ownerUserId = workspaceOwnerId ?? (await getWorkspaceAccess(userId)).ownerUserId;
  const saved = await insertSavedReplyRow({
    id: `reply_${randomUUID()}`,
    ownerUserId,
    ...normalizeSavedReplyInput(input)
  });

  if (!saved) {
    throw new Error("SAVE_FAILED");
  }

  return mapSavedReply(saved);
}

export async function updateSavedReply(
  userId: string,
  input: { id: string; title: string; body: string; tags?: string[] },
  workspaceOwnerId?: string
) {
  const ownerUserId = workspaceOwnerId ?? (await getWorkspaceAccess(userId)).ownerUserId;
  const saved = await updateSavedReplyRow({
    id: input.id,
    ownerUserId,
    ...normalizeSavedReplyInput(input)
  });

  if (!saved) {
    throw new Error("NOT_FOUND");
  }

  return mapSavedReply(saved);
}

export async function deleteSavedReply(userId: string, id: string, workspaceOwnerId?: string) {
  const ownerUserId = workspaceOwnerId ?? (await getWorkspaceAccess(userId)).ownerUserId;
  if (!(await deleteSavedReplyRow(id, ownerUserId))) {
    throw new Error("NOT_FOUND");
  }
}
