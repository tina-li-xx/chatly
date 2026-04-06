import "server-only";

import type { ConversationThread } from "@/lib/types";
import type { SavedReplyRow } from "@/lib/repositories/saved-replies-repository";
import { getMiniMaxConfig } from "@/lib/env.server";
import {
  buildDashboardAiAssistPrompt,
  parseDashboardAiAssistResult,
  type DashboardAiAssistAction,
  type DashboardAiRewriteTone
} from "@/lib/dashboard-ai-assist";

const SYSTEM_PROMPT =
  "You help a small website-chat team. Return strict JSON only with no markdown or explanation.";

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function stripReasoningTags(content: string) {
  const stripped = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  return stripped || content.trim();
}

export async function generateDashboardAiAssist(input: {
  action: DashboardAiAssistAction;
  conversation: ConversationThread;
  draft?: string;
  tone?: DashboardAiRewriteTone;
  savedReplies?: SavedReplyRow[];
}) {
  const config = getMiniMaxConfig();
  const response = await fetch(`${config.baseUrl}/v1/text/chatcompletion_v2`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.3,
      max_completion_tokens: 900,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildDashboardAiAssistPrompt(input) }
      ]
    })
  });

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
    base_resp?: { status_code?: unknown };
  };

  if (!response.ok || Number(payload.base_resp?.status_code) !== 0) {
    throw new Error("DASHBOARD_AI_ASSIST_FAILED");
  }

  const content = stripReasoningTags(readString(payload.choices?.[0]?.message?.content));
  if (!content) {
    throw new Error("INVALID_DASHBOARD_AI_ASSIST_RESPONSE");
  }

  try {
    return parseDashboardAiAssistResult(input.action, content, input.tone);
  } catch {
    throw new Error("INVALID_DASHBOARD_AI_ASSIST_RESPONSE");
  }
}
