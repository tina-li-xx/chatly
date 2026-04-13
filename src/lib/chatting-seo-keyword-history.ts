import "server-only";

import { corpusDifficulty, corpusIntent, corpusTheme } from "@/lib/chatting-seo-keyword-corpus-scoring";
import type { ChattingSeoKeywordDifficulty, ChattingSeoKeywordIntent } from "@/lib/chatting-seo-analysis-types";

function clamp(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function contains(value: string, terms: string[]) {
  const normalized = value.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

function smallTeamRelevance(keyword: string, themeSlug: string) {
  const directHit = contains(keyword, ["small team", "small teams", "startup", "lean", "founder", "agency"]);
  return clamp((directHit ? 72 : 46) + (themeSlug === "small-teams" ? 18 : 0) + (themeSlug === "comparisons" ? 6 : 0));
}

function commercialIntent(keyword: string, intent: ChattingSeoKeywordIntent) {
  const buyerTerms = contains(keyword, ["best", "pricing", "cost", "software", "tool", "platform", "alternative", "vs"]);
  return clamp((intent === "commercial" ? 64 : intent === "comparison" ? 72 : 38) + (buyerTerms ? 18 : 0));
}

function persistenceScore(input: { appearanceCount: number; missingCycleCount: number; firstSeenAt: string; lastSeenAt: string }) {
  const ageDays = Math.max(1, (Date.parse(input.lastSeenAt) - Date.parse(input.firstSeenAt)) / (1000 * 60 * 60 * 24) + 1);
  const repeatScore = Math.min(58, input.appearanceCount * 12);
  const consistencyBoost = Math.min(28, (input.appearanceCount / ageDays) * 32);
  return clamp(repeatScore + consistencyBoost - input.missingCycleCount * 6);
}

function stabilityScore(input: { appearanceCount: number; missingCycleCount: number; distinctDomains: number }) {
  const repeatScore = Math.min(55, input.appearanceCount * 11);
  const missingPenalty = input.missingCycleCount * 10;
  const domainSpreadBoost = Math.min(18, input.distinctDomains * 2);
  return clamp(repeatScore + domainSpreadBoost - missingPenalty);
}

function chattingGapScore(input: { chattingRank: number | null; competitorHits: number; missingCycleCount: number }) {
  const absenceBoost = input.chattingRank == null ? 68 : Math.max(18, input.chattingRank * 7);
  return clamp(absenceBoost + input.competitorHits * 8 - input.missingCycleCount * 5);
}

function competitorDensityScore(input: { competitorHits: number; distinctDomains: number }) {
  return clamp(input.competitorHits * 18 + input.distinctDomains * 2);
}

export function deriveHistoricalKeywordScores(input: {
  keyword: string;
  themeSlug: string;
  intent?: ChattingSeoKeywordIntent;
  chattingRank: number | null;
  competitorHits: number;
  appearanceCount: number;
  missingCycleCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  distinctDomains: number;
}) {
  const intent = input.intent ?? corpusIntent(input.keyword);
  const themeSlug = input.themeSlug || corpusTheme(input.keyword);
  const persistence = persistenceScore(input);
  const density = competitorDensityScore(input);
  const gap = chattingGapScore(input);
  const smallTeam = smallTeamRelevance(input.keyword, themeSlug);
  const commercial = commercialIntent(input.keyword, intent);
  const stability = stabilityScore(input);
  const difficulty = corpusDifficulty(input.keyword, input.competitorHits) as ChattingSeoKeywordDifficulty;
  const difficultyAdjustment = difficulty === "low" ? 9 : difficulty === "medium" ? 2 : -8;
  const opportunity = clamp(
    persistence * 0.22 +
      density * 0.14 +
      gap * 0.26 +
      smallTeam * 0.16 +
      commercial * 0.16 +
      stability * 0.06 +
      difficultyAdjustment
  );

  return {
    difficulty,
    intent,
    themeSlug,
    opportunityScore: opportunity,
    persistenceScore: persistence,
    competitorDensityScore: density,
    chattingGapScore: gap,
    smallTeamRelevanceScore: smallTeam,
    commercialIntentScore: commercial,
    stabilityScore: stability
  };
}
