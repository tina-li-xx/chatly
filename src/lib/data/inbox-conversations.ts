import type { ConversationSummary } from "@/lib/types";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { mapSummary } from "./shared";
import { queryInboxConversationSummaries } from "@/lib/repositories/shared-repository";

async function queryWorkspaceInboxSummaries(
  userId: string,
  suffix: string,
  ownerUserId?: string
) {
  const workspaceOwnerId = ownerUserId ?? (await getWorkspaceAccess(userId)).ownerUserId;
  const result = await queryInboxConversationSummaries(
    "s.user_id = $1",
    [workspaceOwnerId],
    suffix,
    userId
  );

  return result.rows.map(mapSummary);
}

export async function listInboxConversationSummaries(userId: string): Promise<ConversationSummary[]> {
  return queryWorkspaceInboxSummaries(
    userId,
    "ORDER BY c.last_message_at DESC NULLS LAST, c.updated_at DESC"
  );
}

export async function listRecentInboxConversationSummaries(
  userId: string,
  limit: number,
  ownerUserId?: string
): Promise<ConversationSummary[]> {
  const normalizedLimit = Math.max(1, Math.floor(limit));
  return queryWorkspaceInboxSummaries(
    userId,
    `ORDER BY c.last_message_at DESC NULLS LAST, c.updated_at DESC LIMIT ${normalizedLimit}`,
    ownerUserId
  );
}

export async function getInboxConversationSummaryById(
  id: string,
  userId: string
): Promise<ConversationSummary | null> {
  const workspace = await getWorkspaceAccess(userId);
  const result = await queryInboxConversationSummaries(
    "c.id = $1 AND s.user_id = $2",
    [id, workspace.ownerUserId],
    "LIMIT 1",
    userId
  );

  return result.rowCount ? mapSummary(result.rows[0]) : null;
}
