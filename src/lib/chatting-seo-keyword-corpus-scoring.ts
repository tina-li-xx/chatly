import "server-only";

import type { ChattingSeoKeywordCandidate, ChattingSeoKeywordDifficulty, ChattingSeoKeywordIntent } from "@/lib/chatting-seo-analysis-types";

function contains(value: string, terms: string[]) {
  const normalized = value.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

export function corpusIntent(keyword: string): ChattingSeoKeywordIntent {
  if (contains(keyword, [" alternative", " vs ", "compare ", "comparison", "competitor"])) {
    return "comparison";
  }

  if (contains(keyword, ["best ", "pricing", "software", "platform", "tool", "widget", "shared inbox"])) {
    return "commercial";
  }

  return "informational";
}

export function corpusTheme(keyword: string) {
  if (contains(keyword, [" alternative", " vs ", "compare "])) return "comparisons";
  if (contains(keyword, ["pricing", "cost", "roi", "conversion"])) return "conversion";
  if (contains(keyword, ["how to", "setup", "guide", "integration"])) return "how-to-guides";
  if (contains(keyword, ["small team", "small teams", "startup", "agency"])) return "small-teams";
  if (contains(keyword, ["saved replies", "visitor tracking", "routing", "offline chat"])) return "product";
  return "live-chat-tips";
}

export function corpusAudience(keyword: string) {
  if (contains(keyword, ["shopify", "ecommerce"])) return "Small ecommerce teams";
  if (contains(keyword, ["agency", "agencies"])) return "Agencies";
  if (contains(keyword, ["support", "help desk", "shared inbox"])) return "Lean support teams";
  if (contains(keyword, ["sales", "lead", "conversion"])) return "Sales-led teams";
  if (contains(keyword, ["ops", "slack", "zapier", "routing"])) return "Operations-led teams";
  return "Founder-led SaaS teams";
}

export function corpusDifficulty(keyword: string, competitorHits: number): ChattingSeoKeywordDifficulty {
  if (competitorHits >= 3) return "high";
  if (keyword.trim().split(/\s+/).length >= 5) return "low";
  return competitorHits >= 2 ? "medium" : "low";
}

function clamp(value: number) {
  return Math.min(100, Math.max(1, Math.round(value)));
}

export function corpusScore(input: {
  keyword: string;
  seed?: ChattingSeoKeywordCandidate | null;
  resultRank?: number;
  competitorHits: number;
  chattingRank: number | null;
  evidenceCount: number;
}) {
  const base = input.seed?.priority ?? (corpusIntent(input.keyword) === "comparison" ? 82 : 74);
  const rankAdjustment = input.resultRank ? Math.max(0, 10 - input.resultRank * 2) : 6;
  const uncoveredBoost = input.chattingRank == null ? 10 : Math.max(0, 6 - input.chattingRank);
  const difficultyBoost = corpusDifficulty(input.keyword, input.competitorHits) === "low" ? 8 : 2;
  const evidenceBoost = Math.min(12, Math.max(0, input.evidenceCount - 1) * 3);
  return clamp(base + rankAdjustment + uncoveredBoost + difficultyBoost + evidenceBoost);
}
