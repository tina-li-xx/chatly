import "server-only";

import { getMiniMaxConfig } from "@/lib/env.server";
import { chattingSeoProfile } from "@/lib/chatting-seo-profile";
import { readNumber, readString, stripReasoningTags } from "@/lib/chatting-seo-analysis-service-shared";
import { getPlanItemRegenerationCandidates } from "@/lib/chatting-seo-plan-item-regeneration-candidates";
import type { ReplaceSeoPlanItemInput, SeoPlanItemRow } from "@/lib/repositories/seo-pipeline-repository-shared";

function clampPriority(value: number) {
  return Math.max(1, Math.min(100, value));
}

function keywordKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function fallbackPlanItem(
  item: SeoPlanItemRow,
  candidate: Awaited<ReturnType<typeof getPlanItemRegenerationCandidates>>["candidates"][number]
): ReplaceSeoPlanItemInput {
  return {
    id: item.id,
    position: item.position,
    status: item.status,
    targetPublishAt: item.target_publish_at,
    title: candidate.title,
    targetKeyword: candidate.keyword,
    keywordCluster: candidate.keyword,
    searchIntent: candidate.intent || item.search_intent,
    contentFormat: item.content_format,
    personaSlug: item.persona_slug || "founders",
    themeSlug: candidate.themeSlug || item.theme_slug,
    categorySlug: candidate.themeSlug || item.category_slug,
    ctaId: item.cta_id,
    priorityScore: clampPriority(candidate.priority),
    rationale: candidate.rationale,
    notes: "Plan item regenerated manually from the publishing workspace.",
    metadataJson: { source: "manual-regenerate", planningLayer: "single-item", researchSource: "live" }
  };
}

function sanitizePlanItem(item: SeoPlanItemRow, payload: unknown): ReplaceSeoPlanItemInput {
  const record = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const themes = new Set(chattingSeoProfile.contentInventory.blogCategories.map((entry) => entry.slug));
  const ctas = new Set(chattingSeoProfile.ctas.map((entry) => entry.id));
  const nextTheme = readString(record.themeSlug);
  const nextCategory = readString(record.categorySlug);
  const nextCta = readString(record.ctaId);

  return {
    id: item.id,
    position: item.position,
    status: item.status,
    targetPublishAt: item.target_publish_at,
    title: readString(record.title),
    targetKeyword: readString(record.targetKeyword),
    keywordCluster: readString(record.targetKeyword),
    searchIntent: readString(record.searchIntent) || item.search_intent,
    contentFormat: item.content_format || "article",
    personaSlug: readString(record.personaSlug) || item.persona_slug || "founders",
    themeSlug: themes.has(nextTheme) ? nextTheme : item.theme_slug,
    categorySlug: themes.has(nextCategory) ? nextCategory : themes.has(nextTheme) ? nextTheme : item.category_slug,
    ctaId: ctas.has(nextCta) ? nextCta : item.cta_id,
    priorityScore: clampPriority(readNumber(record.priorityScore) || item.priority_score),
    rationale: readString(record.rationale),
    notes: "Plan item regenerated manually from the publishing workspace.",
    metadataJson: { source: "manual-regenerate", planningLayer: "single-item" }
  };
}

function buildPrompt(item: SeoPlanItemRow, candidates: Awaited<ReturnType<typeof getPlanItemRegenerationCandidates>>["candidates"]) {
  return `Regenerate one 30-day SEO plan item for Chatting.

Current item:
${JSON.stringify({ position: item.position, title: item.title, targetKeyword: item.target_keyword, searchIntent: item.search_intent, personaSlug: item.persona_slug, themeSlug: item.theme_slug, categorySlug: item.category_slug, ctaId: item.cta_id })}

Replacement options:
${JSON.stringify(candidates)}

Rules:
- Return exactly one replacement item.
- Use a new keyword not matching the current item.
- Keep it grounded in the provided options.
- Stay suitable for Chatting and small-team live chat intent.

Return JSON:
{"title":"string","targetKeyword":"string","searchIntent":"commercial|informational|comparison","personaSlug":"string","themeSlug":"string","categorySlug":"string","ctaId":"string","priorityScore":0-100,"rationale":"string"}`;
}

export async function regenerateChattingSeoPlanItem(input: {
  ownerUserId: string;
  actorUserId?: string | null;
  item: SeoPlanItemRow;
  runItems: SeoPlanItemRow[];
}) {
  const { analysis, candidates } = await getPlanItemRegenerationCandidates(input);
  const fallback = fallbackPlanItem(input.item, candidates[0] ?? {
    keyword: `${input.item.target_keyword} for small teams`,
    title: `${input.item.title} for small teams`,
    themeSlug: input.item.theme_slug || "product",
    intent: input.item.search_intent || "informational",
    audienceLabel: "Small teams",
    rationale: input.item.rationale,
    priority: input.item.priority_score
  });
  fallback.metadataJson = { ...fallback.metadataJson, researchSource: analysis.researchSource };
  if (!candidates.length) return fallback;

  try {
    const config = getMiniMaxConfig();
    const response = await fetch(`${config.baseUrl}/v1/text/chatcompletion_v2`, {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, temperature: 0.3, max_completion_tokens: 800, messages: [{ role: "system", content: "You are Chatting's SEO planner. Return strict JSON only." }, { role: "user", content: buildPrompt(input.item, candidates) }] })
    });
    const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }>; base_resp?: { status_code?: unknown } };
    if (!response.ok || Number(payload.base_resp?.status_code) !== 0) throw new Error("CHATTING_SEO_PLAN_ITEM_PROVIDER_FAILED");
    const content = stripReasoningTags(readString(payload.choices?.[0]?.message?.content));
    if (!content) throw new Error("INVALID_CHATTING_SEO_PLAN_ITEM_RESPONSE");
    const regenerated = sanitizePlanItem(input.item, JSON.parse(content));
    regenerated.metadataJson = { ...regenerated.metadataJson, researchSource: analysis.researchSource };
    const candidateKeywords = new Set(candidates.map((candidate) => keywordKey(candidate.keyword)));
    if (
      !regenerated.title ||
      !regenerated.targetKeyword ||
      !regenerated.rationale ||
      keywordKey(regenerated.targetKeyword) === keywordKey(input.item.target_keyword) ||
      !candidateKeywords.has(keywordKey(regenerated.targetKeyword))
    ) throw new Error("INVALID_CHATTING_SEO_PLAN_ITEM_RESPONSE");
    return regenerated;
  } catch {
    return fallback;
  }
}
