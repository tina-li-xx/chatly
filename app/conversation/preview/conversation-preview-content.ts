import {
  buildConversationTranscriptPreviewMessages
} from "@/lib/conversation-transcript-email";
import type { ConversationPreviewIdentity } from "@/lib/conversation-preview-link";
import type { ConversationThreadMessage } from "../conversation-thread-shell";

function readPreviewParam(value: string | string[] | undefined, fallback: string) {
  const firstValue = Array.isArray(value) ? value[0] : value;
  const cleaned = firstValue?.trim();
  return cleaned || fallback;
}

function buildPreviewMessages() {
  return buildConversationTranscriptPreviewMessages().map((message, index) => ({
    id: `preview-${index + 1}`,
    content: message.content,
    createdAt: message.createdAt,
    sender: message.sender === "founder" ? "team" : "user",
    attachments: []
  })) satisfies ConversationThreadMessage[];
}

export function buildConversationPreviewContent(identity: ConversationPreviewIdentity) {
  return {
    agentName: identity.agentName,
    brandColor: "#2563EB",
    brandingLabel: "https://usechatting.com",
    brandingUrl: "https://usechatting.com",
    initialMessages: buildPreviewMessages(),
    showBranding: false,
    teamPhotoUrl: null,
    teamName: identity.teamName,
    widgetTitle: identity.teamName
  };
}

export function buildConversationPreviewIdentityFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): ConversationPreviewIdentity {
  const companyName = readPreviewParam(searchParams.company, "Chatting");

  return {
    companyName,
    teamName: readPreviewParam(
      searchParams.team,
      companyName === "Chatting" ? "Chatting Team" : `${companyName} Support`
    ),
    agentName: readPreviewParam(searchParams.agent, "Tina")
  };
}
