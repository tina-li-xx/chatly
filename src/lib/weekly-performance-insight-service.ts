import "server-only";

import { getMiniMaxConfig } from "@/lib/env.server";
import { getWeeklyPerformanceInsight } from "@/lib/weekly-performance-copy";

type WeeklyPerformanceInsightInput = Parameters<typeof getWeeklyPerformanceInsight>[0];

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function stripReasoningTags(content: string) {
  const stripped = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  return stripped || content.trim();
}

export async function generateWeeklyPerformanceInsight(input: WeeklyPerformanceInsightInput) {
  const fallback = getWeeklyPerformanceInsight(input);

  try {
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
        max_completion_tokens: 250,
        messages: [
          {
            role: "system",
            content:
              "You write exactly one concise sentence for a weekly chat performance report. Return JSON only."
          },
          {
            role: "user",
            content: `Return JSON like {"insight":"..."}.

Rules:
- One sentence only.
- No hype, no exclamation mark, no emoji.
- Base it only on the provided metrics.
- If the metrics are weak or flat, write a calm operational takeaway.

Metrics:
${JSON.stringify(input)}`
          }
        ]
      })
    });

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: unknown } }>;
      base_resp?: { status_code?: unknown };
    };

    if (!response.ok || Number(payload.base_resp?.status_code) !== 0) {
      return fallback;
    }

    const content = stripReasoningTags(readString(payload.choices?.[0]?.message?.content));
    const parsed = JSON.parse(content) as { insight?: unknown };
    const insight = readString(parsed.insight);

    return insight || fallback;
  } catch {
    return fallback;
  }
}
