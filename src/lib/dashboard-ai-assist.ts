import type { BillingPlanKey } from "@/lib/billing-plans";
import { getAiAssistMonthlyRequestLimit } from "@/lib/plan-limits";
import type { SavedReplyRow } from "@/lib/repositories/saved-replies-repository";
import type { ConversationThread } from "@/lib/types";
import { DASHBOARD_TAGS } from "@/lib/dashboard-tags";
export type DashboardAiAssistAction = "summarize" | "rewrite" | "reply" | "tags";
export type DashboardAiRewriteTone = "shorter" | "friendlier" | "formal" | "grammar";
export type DashboardAiAssistResult =
  | { action: "summarize"; summary: string }
  | { action: "reply"; draft: string }
  | { action: "rewrite"; draft: string; tone: DashboardAiRewriteTone }
  | { action: "tags"; tags: string[] };
function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
function clip(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit - 3)}...` : value;
}
function transcriptForConversation(conversation: ConversationThread) {
  return conversation.messages.slice(-12).map((message) => {
    const speaker = message.sender === "user" ? "Visitor" : "Teammate";
    const body = clip(message.content.trim() || "[Attachment only]", 800);
    return `${speaker}: ${body}`;
  }).join("\n");
}

function rewriteInstruction(tone: DashboardAiRewriteTone) {
  switch (tone) {
    case "shorter":
      return "Condense the message while keeping the important meaning.";
    case "friendlier":
      return "Make the tone warmer and more conversational.";
    case "formal":
      return "Make the tone more polished and professional.";
    case "grammar":
      return "Fix grammar and clarity only, without changing the tone more than needed.";
  }
}
function savedRepliesContext(savedReplies: SavedReplyRow[]) {
  if (!savedReplies.length) {
    return "Saved replies: none";
  }
  return ["Saved replies:", ...savedReplies.slice(0, 5).map((reply) => `- ${reply.title}: ${clip(reply.body, 220)}`)].join("\n");
}
export function hasDashboardAiAssistAccess(planKey: BillingPlanKey) {
  return getAiAssistMonthlyRequestLimit(planKey) !== 0;
}
export function validateDashboardAiAssistRequest(input: {
  action: string;
  conversationId: string;
  draft?: string;
  tone?: string;
}) {
  if (!input.conversationId.trim()) {
    return "missing-fields";
  }
  if (!["summarize", "rewrite", "reply", "tags"].includes(input.action)) {
    return "unknown-action";
  }
  if (input.action === "rewrite") {
    if (!readString(input.draft)) {
      return "draft-required";
    }
    if (!["shorter", "friendlier", "formal", "grammar"].includes(input.tone ?? "")) {
      return "invalid-tone";
    }
  }
  return null;
}
export function buildDashboardAiAssistPrompt(input: {
  action: DashboardAiAssistAction;
  conversation: ConversationThread;
  draft?: string;
  tone?: DashboardAiRewriteTone;
  savedReplies?: SavedReplyRow[];
}) {
  const context = [
    `Site: ${readString(input.conversation.siteName) || "Unknown site"}`,
    `Visitor email: ${readString(input.conversation.email) || "Unknown"}`,
    `Page: ${readString(input.conversation.pageUrl) || "Unknown page"}`,
    `Current tags: ${input.conversation.tags.join(", ") || "none"}`,
    `Conversation status: ${input.conversation.status}`,
    "",
    "Transcript:",
    transcriptForConversation(input.conversation)
  ].join("\n");
  if (input.action === "summarize") {
    return `${context}

Return JSON like:
{"summary":"two or three concise sentences"}

Rules:
- Summarize what the visitor asked, what the team discussed, and the current outcome.
- Do not use bullets.
- Do not invent facts not present in the conversation.`;
  }
  if (input.action === "rewrite") {
    return `${context}

Selected text:
"""
${clip(readString(input.draft), 1200)}
"""

Return JSON like:
{"draft":"rewritten text"}

Rules:
- ${rewriteInstruction(input.tone ?? "shorter")}
- Keep the original meaning intact.
- Do not add facts, promises, or policy details that are not present.`;
  }
  if (input.action === "reply") {
    return `${context}

${savedRepliesContext(input.savedReplies ?? [])}

Return JSON like:
{"draft":"suggested reply"}

Rules:
- Write a human reply a small team could send right now.
- Keep it under 120 words.
- If a saved reply is clearly relevant, borrow its structure without copying it word-for-word.
- If crucial context is missing, ask one concise follow-up question.`;
  }
  return `${context}

Allowed tags: ${DASHBOARD_TAGS.join(", ")}

Return JSON like:
{"tags":["pricing","bug"]}

Rules:
- Choose at most 3 tags from the allowed list.
- Only return tags clearly supported by the conversation.
- Do not return tags already present if no new tags are needed.`;
}

export function parseDashboardAiAssistResult(
  action: DashboardAiAssistAction,
  text: string,
  tone?: DashboardAiRewriteTone
): DashboardAiAssistResult {
  const parsed = JSON.parse(text) as Record<string, unknown>;
  if (action === "summarize") {
    const summary = clip(readString(parsed.summary), 320);
    if (!summary) {
      throw new Error("INVALID_DASHBOARD_AI_ASSIST_RESPONSE");
    }
    return { action, summary };
  }
  if (action === "reply") {
    const draft = clip(readString(parsed.draft), 2000);
    if (!draft) {
      throw new Error("INVALID_DASHBOARD_AI_ASSIST_RESPONSE");
    }
    return { action, draft };
  }
  if (action === "rewrite") {
    const draft = clip(readString(parsed.draft), 2000);
    if (!draft || !tone) {
      throw new Error("INVALID_DASHBOARD_AI_ASSIST_RESPONSE");
    }
    return { action, draft, tone };
  }
  const tags = Array.isArray(parsed.tags)
    ? parsed.tags
        .map(readString)
        .filter((tag) =>
          DASHBOARD_TAGS.includes(tag as (typeof DASHBOARD_TAGS)[number])
        )
    : [];

  return {
    action,
    tags: tags.filter((tag, index) => tags.indexOf(tag) === index).slice(0, 3)
  };
}
