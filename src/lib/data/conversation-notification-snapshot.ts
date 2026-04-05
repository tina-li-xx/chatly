import { findConversationNotificationContextRow } from "@/lib/repositories/conversations-repository";
import { mapSummary, queryConversationSummaries } from "./shared";

export async function loadConversationNotificationSnapshot(conversationId: string) {
  const context = await findConversationNotificationContextRow(conversationId);
  if (!context) {
    return null;
  }

  const result = await queryConversationSummaries(
    "c.id = $1 AND s.user_id = $2",
    [conversationId, context.owner_user_id ?? context.user_id],
    "LIMIT 1",
    context.user_id
  );
  const summary = result.rowCount ? mapSummary(result.rows[0]) : null;

  return {
    userId: context.user_id,
    siteName: context.site_name,
    visitorLabel: summary?.email ?? null,
    pageUrl: summary?.pageUrl ?? null,
    location: [summary?.city, summary?.region, summary?.country].filter(Boolean).join(", ") || null
  };
}
