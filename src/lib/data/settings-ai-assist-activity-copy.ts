import type { DashboardAiAssistUsageActivity } from "@/lib/data/settings-ai-assist-usage";
import { truncate } from "@/lib/utils";

function looksLikeUrlOrDomain(value: string) {
  return /^(https?:\/\/|www\.)/i.test(value) || /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/.*)?$/i.test(value);
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function describeDashboardAiAssistActivity(
  item: Pick<DashboardAiAssistUsageActivity, "feature" | "action" | "tone">
) {
  if (item.feature === "summary") {
    return "Summary";
  }

  if (item.feature === "reply") {
    return "Reply suggestion";
  }

  if (item.feature === "rewrite") {
    const tone = item.tone ? ` (${item.tone})` : "";
    return `Rewrite${tone}`;
  }

  return "Tag suggestions";
}

export function normalizeDashboardAiAssistConversationSubject(value: string | null) {
  if (!value) {
    return null;
  }

  const subject = value.replace(/\s+/g, " ").trim();
  if (!subject) {
    return null;
  }

  if (looksLikeUrlOrDomain(subject) || looksLikeEmail(subject)) {
    return null;
  }

  return subject;
}

export function formatDashboardAiAssistConversationPreview(value: string | null) {
  const subject = normalizeDashboardAiAssistConversationSubject(value);
  return subject ? truncate(subject, 96) : null;
}

export function explainDashboardAiAssistActivity(
  item: Pick<
    DashboardAiAssistUsageActivity,
    "feature" | "action" | "tone" | "edited" | "editLevel"
  >
) {
  if (item.feature === "summary") {
    return item.action === "shown"
      ? "AI generated a summary and showed it in the conversation sidebar."
      : "A teammate asked AI to summarize the conversation.";
  }

  if (item.feature === "reply") {
    return item.action === "used"
      ? item.editLevel === "light"
        ? "A teammate sent the AI reply after lightly editing it in the composer."
        : item.editLevel === "heavy"
          ? "A teammate sent the AI reply after substantially rewriting it in the composer."
          : item.edited
            ? "A teammate sent the AI reply after editing it in the composer."
            : "A teammate sent the AI reply without editing it first."
      : item.action === "dismissed"
        ? "A teammate closed the suggested reply without using it."
        : "A teammate asked AI to draft a reply.";
  }

  if (item.feature === "rewrite") {
    const tone = item.tone ? ` in a ${item.tone} tone` : "";
    return item.action === "applied"
      ? `A teammate replaced the selected text with the AI rewrite${tone}.`
      : item.action === "dismissed"
        ? "A teammate requested a rewrite but kept the original text."
        : `A teammate asked AI to rewrite the selected text${tone}.`;
  }

  return item.action === "applied"
    ? "A teammate added one of the suggested tags to the conversation."
    : item.action === "dismissed"
      ? "A teammate dismissed the suggested tags."
      : item.action === "shown"
        ? "AI generated suggested tags and showed them after the conversation was resolved."
        : "AI tag suggestions were requested for the conversation.";
}
