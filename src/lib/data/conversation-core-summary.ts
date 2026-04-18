import type { ConversationSummary } from "@/lib/types";
import { queryCoreConversationSummaries } from "@/lib/repositories/shared-repository";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { mapSummary } from "./shared";

export async function getConversationCoreSummaryById(
  conversationId: string,
  userId: string
): Promise<ConversationSummary | null> {
  const workspace = await getWorkspaceAccess(userId);
  const result = await queryCoreConversationSummaries(
    "c.id = $1 AND s.user_id = $2",
    [conversationId, workspace.ownerUserId],
    "LIMIT 1",
    userId
  );

  return result.rowCount ? mapSummary(result.rows[0]) : null;
}
