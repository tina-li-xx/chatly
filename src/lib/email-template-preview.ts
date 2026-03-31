import { buildConversationPreviewLink } from "@/lib/conversation-preview-link";

const DEFAULT_EMAIL_TEMPLATE_PREVIEW_APP_URL = "https://chatly.example";

function cleanPreviewValue(value: string | null | undefined) {
  const cleaned = value?.trim();
  return cleaned || null;
}

export function buildDashboardEmailTemplatePreviewLink(input?: {
  appUrl?: string;
  teamName?: string;
  agentName?: string;
  companyName?: string;
}) {
  const baseUrl = `${cleanPreviewValue(input?.appUrl) ?? DEFAULT_EMAIL_TEMPLATE_PREVIEW_APP_URL}`.replace(/\/+$/, "");
  const teamName = cleanPreviewValue(input?.teamName);
  const agentName = cleanPreviewValue(input?.agentName);
  const companyName = cleanPreviewValue(input?.companyName);

  return buildConversationPreviewLink(baseUrl, {
    teamName: teamName || "Chatting Team",
    agentName: agentName || "Sarah",
    companyName: companyName || "Chatting"
  });
}
