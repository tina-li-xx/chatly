import "server-only";

import { randomUUID } from "node:crypto";
import type { ChattingSeoProfile } from "@/lib/chatting-seo-profile";
import type { ChattingSeoAnalysis } from "@/lib/chatting-seo-analysis-types";
import { buildChattingSeoSeedPlanItems } from "@/lib/chatting-seo-plan-seed";
import type { ReplaceSeoPlanItemInput } from "@/lib/repositories/seo-pipeline-repository-shared";
import type { ChattingSeoGeneratedPlan } from "@/lib/chatting-seo-plan-types";

function targetPublishAt(position: number) {
  const date = new Date();
  date.setUTCHours(9, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + position + 1);
  return date.toISOString();
}

function personaSlug(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes("agency")) return "agencies";
  if (normalized.includes("ecommerce")) return "ecommerce-operators";
  if (normalized.includes("service")) return "consultancies";
  if (normalized.includes("sales")) return "sales-leads";
  if (normalized.includes("support")) return "support-leads";
  if (normalized.includes("operation")) return "ops-leads";
  return "founders";
}

function ctaId(intent: string) {
  if (intent === "commercial" || intent === "comparison") return "see-pricing";
  return "read-guides";
}

function buildPrimaryItems(analysis: ChattingSeoAnalysis): ReplaceSeoPlanItemInput[] {
  return analysis.keywordOpportunities.slice(0, 10).map((item, index) => ({
    id: `seo_item_${randomUUID()}`,
    position: index + 1,
    status: "planned",
    targetPublishAt: targetPublishAt(index),
    title: item.title,
    targetKeyword: item.keyword,
    keywordCluster: item.keyword,
    searchIntent: item.intent,
    contentFormat: "article",
    personaSlug: personaSlug(item.audienceLabel),
    themeSlug: item.themeSlug,
    categorySlug: item.themeSlug,
    ctaId: ctaId(item.intent),
    priorityScore: Math.max(1, item.priority),
    rationale: item.rationale,
    notes: `Generated from ${analysis.researchSource === "live" ? "stored external keyword corpus" : "source-backed"} keyword analysis.`,
    metadataJson: { source: "keyword-analysis", planningLayer: "primary", difficulty: item.difficulty, researchSource: analysis.researchSource }
  }));
}

function mergeUniquePlanItems(primary: ReplaceSeoPlanItemInput[], fallback: ReplaceSeoPlanItemInput[]) {
  const seen = new Set<string>();
  const merged: ReplaceSeoPlanItemInput[] = [];
  const push = (item: ReplaceSeoPlanItemInput) => {
    const key = item.targetKeyword.toLowerCase().trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  };

  primary.forEach(push);
  fallback.forEach(push);

  return merged.slice(0, 30).map((item, index) => ({
    ...item,
    position: index + 1,
    targetPublishAt: targetPublishAt(index),
    priorityScore: Math.max(1, 100 - index)
  }));
}

export function buildFallbackChattingSeoPlan(profile: ChattingSeoProfile, analysis: ChattingSeoAnalysis): ChattingSeoGeneratedPlan {
  const primary = buildPrimaryItems(analysis);
  const seeded = buildChattingSeoSeedPlanItems(profile).map((item) => ({
    ...item,
    notes: `${item.notes} Ranked after keyword-analysis opportunities.`
  }));
  const items = mergeUniquePlanItems(primary, seeded);

  if (items.length < 30) {
    throw new Error("CHATTING_SEO_PLAN_UNDERFLOW");
  }

  return {
    source: "fallback",
    generatedAt: new Date().toISOString(),
    summary: `${analysis.summary} The 30-day plan leads with the strongest keyword-analysis opportunities, then fills the calendar with adjacent Chatting topics that support those clusters.`,
    analysis,
    items
  };
}
