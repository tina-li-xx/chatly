import "server-only";

import type { ChattingSeoProfile } from "@/lib/chatting-seo-profile";
import { buildChattingSeoSeedPlanItems } from "@/lib/chatting-seo-plan-seed";
import type { ChattingSeoKeywordCandidate } from "@/lib/chatting-seo-analysis-types";

function readableAudienceLabel(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("founder") || normalized.includes("startup") || normalized.includes("saas")) return "Founder-led SaaS teams";
  if (normalized.includes("ecommerce") || normalized.includes("shopify") || normalized.includes("store")) return "Small ecommerce teams";
  if (normalized.includes("agency")) return "Agencies";
  if (normalized.includes("consult")) return "Service businesses";
  if (normalized.includes("support")) return "Lean support teams";
  if (normalized.includes("sales")) return "Sales-led teams";
  if (normalized.includes("ops")) return "Operations-led teams";
  return "Small teams";
}

function normalizeKeyword(value: string) {
  return value.replace(/\s*\|\s*chatting$/i, "").replace(/\s+/g, " ").trim();
}

function freeToolTheme(category: string) {
  if (category === "calculators" || category === "analyzers") return "conversion";
  if (category === "templates") return "how-to-guides";
  return "product";
}

function freeToolAudience(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes("roi")) return "Growth leads";
  if (normalized.includes("response")) return "Lean support teams";
  return "Small teams";
}

function guideAudience(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes("shopify")) return "Small ecommerce teams";
  if (normalized.includes("ios") || normalized.includes("react native")) return "Product teams";
  if (normalized.includes("slack") || normalized.includes("zapier") || normalized.includes("webhook")) {
    return "Operations-led teams";
  }
  return "Lean support teams";
}

export function buildChattingSeoAnalysisCandidates(profile: ChattingSeoProfile): ChattingSeoKeywordCandidate[] {
  const seen = new Set<string>();
  const candidates: ChattingSeoKeywordCandidate[] = [];
  const push = (candidate: ChattingSeoKeywordCandidate) => {
    const key = normalizeKeyword(candidate.keyword).toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    candidates.push(candidate);
  };

  buildChattingSeoSeedPlanItems(profile).slice(0, 12).forEach((item) => {
    const themeSlug = item.themeSlug ?? "comparisons";
    const personaSlug = item.personaSlug ?? "small teams";
    const rationale = item.rationale ?? `Chatting has adjacent coverage around ${item.title}, making it a sensible SEO candidate to review.`;
    const priority = item.priorityScore ?? 50;
    push({
      keyword: item.targetKeyword,
      title: item.title,
      themeSlug,
      intent: themeSlug === "comparisons" ? "comparison" : item.searchIntent === "commercial" ? "commercial" : "informational",
      audienceLabel: readableAudienceLabel(personaSlug),
      rationale,
      priority,
      source: "seed"
    });
  });

  profile.contentInventory.guides.slice(0, 6).forEach((guide, index) => {
    const keyword = normalizeKeyword(guide.seoTitle || guide.title);
    push({
      keyword,
      title: guide.title,
      themeSlug: "how-to-guides",
      intent: "informational",
      audienceLabel: guideAudience(guide.title),
      rationale: `Chatting already ships guide coverage around ${guide.title}, which is a strong source-backed entry point for adjacent search demand.`,
      priority: 78 - index,
      source: "guide"
    });
  });

  profile.contentInventory.freeTools.forEach((tool, index) => {
    const keyword = normalizeKeyword(tool.seoTitle || tool.title);
    push({
      keyword,
      title: tool.title,
      themeSlug: freeToolTheme(tool.category),
      intent: tool.category === "calculators" ? "commercial" : "informational",
      audienceLabel: freeToolAudience(tool.title),
      rationale: `The ${tool.title} free tool creates a natural SEO cluster Chatting can support with surrounding explainer content.`,
      priority: 72 - index,
      source: "free-tool"
    });
  });

  return candidates.slice(0, 18);
}
