"use client";

import type { DashboardSavedReply } from "@/lib/data/settings-types";

export type SavedReplyDraft = {
  title: string;
  body: string;
  tags: string;
};

export const EMPTY_SAVED_REPLY: SavedReplyDraft = {
  title: "",
  body: "",
  tags: ""
};

export function parseSavedReplyDraftTags(tags: string) {
  return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
}

export async function readSavedReplies() {
  const response = await fetch("/dashboard/saved-replies", { method: "GET", cache: "no-store" });
  const payload = (await response.json()) as { ok?: boolean; savedReplies?: DashboardSavedReply[] };
  if (!response.ok || !payload.ok) {
    throw new Error("saved-replies-failed");
  }

  return payload.savedReplies ?? [];
}

export function buildOptimisticSavedReply(draft: SavedReplyDraft): DashboardSavedReply {
  return {
    id: `saved_reply_temp_${Math.random().toString(36).slice(2, 10)}`,
    title: draft.title.trim(),
    body: draft.body.trim(),
    tags: parseSavedReplyDraftTags(draft.tags),
    updatedAt: new Date().toISOString()
  };
}

export function upsertSavedReply(
  replies: DashboardSavedReply[],
  reply: DashboardSavedReply,
  replaceId = reply.id
) {
  const next = replies.filter((entry) => entry.id !== replaceId && entry.id !== reply.id);
  return [reply, ...next].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}
