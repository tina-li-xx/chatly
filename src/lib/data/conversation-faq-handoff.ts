import {
  clearConversationFaqHandoffState,
  findConversationFaqHandoffState,
  hasPublicConversationAccessRecord,
  setConversationFaqHandoffState
} from "@/lib/repositories/conversations-repository";
import type { WidgetFaqSuggestions } from "@/lib/public-widget-automation";
import type { IncomingVisitorMessageNotificationInput } from "@/lib/team-notifications";
import { loadConversationNotificationSnapshot } from "./conversation-notification-snapshot";

export async function loadConversationFaqHandoffState(conversationId: string) {
  return findConversationFaqHandoffState(conversationId);
}

export async function queueConversationFaqHandoff(input: {
  conversationId: string;
  preview: string;
  attachmentsCount: number;
  isNewVisitor: boolean;
  highIntent: boolean;
  suggestions: WidgetFaqSuggestions;
}) {
  await setConversationFaqHandoffState({
    ...input,
    suggestionsJson: JSON.stringify(input.suggestions)
  });
}

export async function clearConversationFaqHandoff(conversationId: string) {
  await clearConversationFaqHandoffState(conversationId);
}

export async function requestConversationFaqHandoff(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
}) {
  if (!(await hasPublicConversationAccessRecord(input))) {
    return null;
  }

  const handoff = await findConversationFaqHandoffState(input.conversationId);
  if (!handoff?.pending) {
    return { notified: false as const };
  }

  const snapshot = await loadConversationNotificationSnapshot(input.conversationId);
  if (!snapshot) {
    return { notified: false as const };
  }

  await clearConversationFaqHandoffState(input.conversationId);

  return {
    notified: true as const,
    notification: {
      userId: snapshot.userId,
      conversationId: input.conversationId,
      createdAt: new Date().toISOString(),
      preview: handoff.preview || "Visitor asked to talk to a human",
      siteName: snapshot.siteName,
      visitorLabel: snapshot.visitorLabel,
      pageUrl: snapshot.pageUrl,
      location: snapshot.location,
      attachmentsCount: handoff.attachmentsCount,
      isNewConversation: true,
      isNewVisitor: handoff.isNewVisitor,
      highIntent: handoff.highIntent
    } satisfies IncomingVisitorMessageNotificationInput
  };
}
