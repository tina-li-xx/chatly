import "server-only";

import { getMiniMaxConfig } from "@/lib/env.server";
import {
  normalizeResponseToneContext,
  parseResponseToneAnalysis,
  type ResponseToneAnalysis,
  type ResponseToneContext
} from "@/lib/response-tone-checker";

const SYSTEM_PROMPT = "You are a customer service tone analyzer. Analyze the message and return JSON only.";

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function stripReasoningTags(content: string) {
  const stripped = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  return stripped || content.trim();
}

export async function analyzeResponseToneWithClaude(input: {
  message: string;
  context: ResponseToneContext;
}): Promise<ResponseToneAnalysis> {
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
      max_completion_tokens: 1000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze this customer service response:

"""
${input.message}
"""

Context: ${normalizeResponseToneContext(input.context)}

Return JSON:
{
  "overall_score": 1-10,
  "overall_label": "Excellent" | "Good" | "Needs Work" | "Poor",
  "dimensions": {
    "friendliness": { "score": 1-10, "note": "brief explanation" },
    "professionalism": { "score": 1-10, "note": "brief explanation" },
    "empathy": { "score": 1-10, "note": "brief explanation" },
    "clarity": { "score": 1-10, "note": "brief explanation" },
    "helpfulness": { "score": 1-10, "note": "brief explanation" }
  },
  "issues": [
    { "text": "problematic phrase", "issue": "why it's a problem", "suggestion": "better alternative" }
  ],
  "strengths": ["what the message does well"],
  "rewritten": "improved version of the message"
}`
        }
      ]
    })
  });

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
    base_resp?: { status_code?: unknown; status_msg?: unknown };
  };

  if (!response.ok || Number(payload.base_resp?.status_code) !== 0) {
    throw new Error("RESPONSE_TONE_PROVIDER_FAILED");
  }

  const text = stripReasoningTags(readString(payload.choices?.[0]?.message?.content));
  if (!text) {
    throw new Error("INVALID_TONE_ANALYSIS_RESPONSE");
  }

  try {
    return parseResponseToneAnalysis(text);
  } catch {
    throw new Error("INVALID_TONE_ANALYSIS_RESPONSE");
  }
}
