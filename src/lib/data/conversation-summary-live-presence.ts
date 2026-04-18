import {
  findConversationLiveVisitorRow,
  listConversationLiveVisitorRows,
  type ConversationLiveVisitorRow
} from "@/lib/repositories/conversation-live-visitor-repository";
import type { ConversationSummary } from "@/lib/types";

function applyLiveVisitorToSummary(
  summary: ConversationSummary,
  liveVisitor: ConversationLiveVisitorRow | null | undefined
) {
  if (!liveVisitor) {
    return summary;
  }

  return {
    ...summary,
    email: liveVisitor.email ?? summary.email,
    pageUrl: liveVisitor.current_page_url ?? summary.pageUrl,
    referrer: liveVisitor.referrer ?? summary.referrer,
    userAgent: liveVisitor.user_agent ?? summary.userAgent,
    country: liveVisitor.country ?? summary.country,
    region: liveVisitor.region ?? summary.region,
    city: liveVisitor.city ?? summary.city,
    timezone: liveVisitor.timezone ?? summary.timezone,
    locale: liveVisitor.locale ?? summary.locale
  } satisfies ConversationSummary;
}

export async function overlayConversationSummaryWithLivePresence(
  summary: ConversationSummary,
  input: { ownerUserId: string; viewerUserId: string }
) {
  const liveVisitor = await findConversationLiveVisitorRow({
    conversationId: summary.id,
    ownerUserId: input.ownerUserId,
    viewerUserId: input.viewerUserId
  });

  return applyLiveVisitorToSummary(summary, liveVisitor);
}

export async function overlayConversationSummariesWithLivePresence(
  summaries: ConversationSummary[],
  input: { ownerUserId: string; viewerUserId: string }
) {
  if (!summaries.length) {
    return summaries;
  }

  const liveVisitors = await listConversationLiveVisitorRows({
    conversationIds: summaries.map((summary) => summary.id),
    ownerUserId: input.ownerUserId,
    viewerUserId: input.viewerUserId
  });
  const liveVisitorsByConversationId = new Map(
    liveVisitors.map((liveVisitor) => [liveVisitor.conversation_id, liveVisitor])
  );

  return summaries.map((summary) =>
    applyLiveVisitorToSummary(summary, liveVisitorsByConversationId.get(summary.id))
  );
}
