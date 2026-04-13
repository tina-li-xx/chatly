import "server-only";

import { randomUUID } from "node:crypto";
import { getMiniMaxConfig } from "@/lib/env.server";
import type { ChattingSeoProfile } from "@/lib/chatting-seo-profile";
import type { ChattingSeoAnalysis } from "@/lib/chatting-seo-analysis-types";
import type { ReplaceSeoPlanItemInput } from "@/lib/repositories/seo-pipeline-repository-shared";
import type { ChattingSeoGeneratedPlan } from "@/lib/chatting-seo-plan-types";

const SYSTEM_PROMPT = "You are Chatting's internal SEO planner. Return strict JSON only with no markdown and no extra text.";

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function stripReasoningTags(content: string) {
  const stripped = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  return stripped || content.trim();
}

function targetPublishAt(position: number) {
  const date = new Date();
  date.setUTCHours(9, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + position + 1);
  return date.toISOString();
}

function buildPrompt(profile: ChattingSeoProfile, analysis: ChattingSeoAnalysis) {
  return `Create a 30-day SEO content plan for Chatting.

Rules:
- Base it only on the provided analysis and product truth.
- Every day needs one unique keyword focus.
- Prefer high-intent small-team live chat topics, comparison pages, conversion pages, and practical how-to content.
- Avoid duplicating existing blog topics or repeating the same keyword cluster back to back.
- Use only these category/theme slugs: ${profile.contentInventory.blogCategories.map((item) => item.slug).join(", ")}.
- Use only these CTA ids: ${profile.ctas.map((item) => item.id).join(", ")}.
- Use only these audience labels when useful: founders, support-leads, sales-leads, ops-leads, agencies, consultancies, ecommerce-operators.

Product truth:
${JSON.stringify({
  positioning: profile.messaging.positioning,
  bestFit: profile.messaging.bestFit,
  contentFit: profile.messaging.contentFit,
  claimsDiscipline: profile.messaging.claimsDiscipline
})}

Analysis:
${JSON.stringify(analysis)}

Return JSON with this shape:
{
  "summary": "string",
  "items": [
    {
      "title": "string",
      "targetKeyword": "string",
      "searchIntent": "commercial|informational|comparison",
      "personaSlug": "string",
      "themeSlug": "string",
      "categorySlug": "string",
      "ctaId": "string",
      "priorityScore": 0-100,
      "rationale": "string"
    }
  ]
}`;
}

function sanitizePlan(profile: ChattingSeoProfile, analysis: ChattingSeoAnalysis, payload: unknown): ChattingSeoGeneratedPlan {
  const parsed = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  const allowedThemes = new Set(profile.contentInventory.blogCategories.map((item) => item.slug));
  const allowedCtas = new Set(profile.ctas.map((item) => item.id));
  const items = (Array.isArray(parsed.items) ? parsed.items : [])
    .map((entry) => (entry && typeof entry === "object" ? entry : {}))
    .map((entry, index) => {
      const record = entry as Record<string, unknown>;
      const themeSlug = readString(record.themeSlug);
      const categorySlug = readString(record.categorySlug);
      const cta = readString(record.ctaId);

      return {
        id: `seo_item_${randomUUID()}`,
        position: index + 1,
        status: "planned" as const,
        targetPublishAt: targetPublishAt(index),
        title: readString(record.title),
        targetKeyword: readString(record.targetKeyword),
        keywordCluster: readString(record.targetKeyword),
        searchIntent: readString(record.searchIntent) || "informational",
        contentFormat: "article",
        personaSlug: readString(record.personaSlug) || "founders",
        themeSlug: allowedThemes.has(themeSlug) ? themeSlug : profile.contentInventory.blogCategories[0]?.slug ?? "comparisons",
        categorySlug: allowedThemes.has(categorySlug) ? categorySlug : profile.contentInventory.blogCategories[0]?.slug ?? "comparisons",
        ctaId: allowedCtas.has(cta) ? cta : profile.ctas[0]?.id ?? "",
        priorityScore: Math.max(0, Math.min(100, readNumber(record.priorityScore))),
        rationale: readString(record.rationale),
        notes: `Generated from ${analysis.researchSource === "live" ? "stored external keyword corpus" : "source-backed"} keyword analysis.`,
        metadataJson: { source: "keyword-analysis", planningLayer: "ai", researchSource: analysis.researchSource }
      } satisfies ReplaceSeoPlanItemInput;
    })
    .filter((item) => item.title && item.targetKeyword && item.rationale)
    .slice(0, 30);

  if (items.length !== 30) {
    throw new Error("INVALID_CHATTING_SEO_PLAN_RESPONSE");
  }

  return {
    source: "ai",
    generatedAt: new Date().toISOString(),
    summary: readString(parsed.summary) || analysis.summary,
    analysis,
    items
  };
}

export async function generateChattingSeoPlan(profile: ChattingSeoProfile, analysis: ChattingSeoAnalysis): Promise<ChattingSeoGeneratedPlan> {
  const config = getMiniMaxConfig();
  const response = await fetch(`${config.baseUrl}/v1/text/chatcompletion_v2`, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      max_completion_tokens: 2200,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(profile, analysis) }
      ]
    })
  });

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
    base_resp?: { status_code?: unknown };
  };

  if (!response.ok || Number(payload.base_resp?.status_code) !== 0) {
    throw new Error("CHATTING_SEO_PLAN_PROVIDER_FAILED");
  }

  const content = stripReasoningTags(readString(payload.choices?.[0]?.message?.content));
  if (!content) {
    throw new Error("INVALID_CHATTING_SEO_PLAN_RESPONSE");
  }

  try {
    return sanitizePlan(profile, analysis, JSON.parse(content));
  } catch {
    throw new Error("INVALID_CHATTING_SEO_PLAN_RESPONSE");
  }
}
