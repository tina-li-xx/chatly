import "server-only";

import type { ChattingSeoAnalysisInput, ChattingSeoKeywordDifficulty } from "@/lib/chatting-seo-analysis-types";
import {
  type ChattingSeoLiveCompetitorResearch,
  type ChattingSeoLiveKeywordResearch,
  type ChattingSeoLiveResearch,
  type ChattingSeoLiveResearchProvider,
  type ChattingSeoLiveSearchResult
} from "@/lib/chatting-seo-live-research-types";
import { matchesChatting, matchesCompetitor } from "@/lib/chatting-seo-serp-matching";
import { searchLiveSearchResults } from "@/lib/chatting-seo-live-research-service";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function keywordDifficulty(results: ChattingSeoLiveSearchResult[], competitorHits: number, keyword: string): ChattingSeoKeywordDifficulty {
  if (competitorHits >= 3) return "high";
  if (competitorHits >= 2) return "medium";
  return keyword.trim().split(/\s+/).length >= 5 || results.length <= 3 ? "low" : "medium";
}

function chattingRank(results: ChattingSeoLiveSearchResult[]) {
  return results.find((result) => matchesChatting(result))?.rank ?? null;
}

function keywordResearchRationale(chattingPresence: number | null, competition: number, candidateRationale: string) {
  if (chattingPresence == null) {
    return `${candidateRationale} Live search results show Chatting is not visibly ranking yet, which makes this a real acquisition gap worth targeting.`;
  }

  if (chattingPresence >= 4) {
    return `${candidateRationale} Chatting appears in live results, but not near the top, so this topic is still worth pushing higher.`;
  }

  return `${candidateRationale} Chatting already appears for this topic, so the opportunity is to strengthen coverage and defend the ranking against competitors.`;
}

function competitorQuery(name: string, slug: string) {
  return slug === "generic-chat-widgets" ? "best website chat widget for small teams" : `${name} alternative for small teams`;
}

function fallbackResearch(input: ChattingSeoAnalysisInput): ChattingSeoLiveResearch {
  return {
    source: "fallback",
    generatedAt: new Date().toISOString(),
    summary: "Live search research was unavailable, so keyword and competitor opportunity scoring fell back to Chatting's internal candidate pool.",
    providers: [],
    keywordResearch: input.candidates.slice(0, 8).map((candidate) => ({
      ...candidate,
      difficulty: candidate.intent === "comparison" ? "high" : "medium",
      opportunityScore: candidate.priority,
      chattingRank: null,
      competitorHits: 0,
      searchResults: []
    })),
    competitorResearch: input.competitors.slice(0, 4).map((competitor) => ({
      slug: competitor.slug,
      name: competitor.name,
      query: competitorQuery(competitor.name, competitor.slug),
      chattingRank: null,
      competitorRank: null,
      searchResults: []
    }))
  };
}

function fulfilledValues<T>(results: PromiseSettledResult<T>[]) {
  return results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
}

export async function getChattingSeoLiveResearch(input: ChattingSeoAnalysisInput): Promise<ChattingSeoLiveResearch> {
  try {
    const providers = new Set<ChattingSeoLiveResearchProvider>();
    const keywordResearch = fulfilledValues(await Promise.allSettled(
      input.candidates.slice(0, 8).map(async (candidate) => {
        const response = await searchLiveSearchResults(candidate.keyword, 5);
        providers.add(response.provider);
        const results = response.results;
        const seenCompetitors = input.competitors.filter((competitor) =>
          results.some((result) => matchesCompetitor(result, competitor.slug, competitor.name))
        ).length;
        const currentChattingRank = chattingRank(results);
        const difficulty = keywordDifficulty(results, seenCompetitors, candidate.keyword);
        const longTailBoost = candidate.keyword.trim().split(/\s+/).length >= 5 ? 8 : 0;
        const uncoveredBoost = currentChattingRank == null ? 12 : Math.max(0, 7 - currentChattingRank);

        return {
          ...candidate,
          difficulty,
          opportunityScore: clamp(candidate.priority + longTailBoost + uncoveredBoost + (difficulty === "low" ? 8 : difficulty === "medium" ? 3 : -4), 1, 100),
          chattingRank: currentChattingRank,
          competitorHits: seenCompetitors,
          searchResults: results,
          rationale: keywordResearchRationale(currentChattingRank, seenCompetitors, candidate.rationale)
        } satisfies ChattingSeoLiveKeywordResearch;
      })
    )).sort((left, right) => right.opportunityScore - left.opportunityScore);

    const competitorResearch = fulfilledValues(await Promise.allSettled(
      input.competitors.slice(0, 4).map(async (competitor) => {
        const query = competitorQuery(competitor.name, competitor.slug);
        const response = await searchLiveSearchResults(query, 5);
        providers.add(response.provider);
        const results = response.results;

        return {
          slug: competitor.slug,
          name: competitor.name,
          query,
          chattingRank: chattingRank(results),
          competitorRank: results.find((result) => matchesCompetitor(result, competitor.slug, competitor.name))?.rank ?? null,
          searchResults: results
        } satisfies ChattingSeoLiveCompetitorResearch;
      })
    ));

    if (!keywordResearch.length && !competitorResearch.length) {
      return fallbackResearch(input);
    }

    const providerList = [...providers].sort();

    return {
      source: "live",
      generatedAt: new Date().toISOString(),
      summary: `Live search research reviewed ${keywordResearch.length} keyword queries and ${competitorResearch.length} competitor queries using ${providerList.join(" + ")} before planning.`,
      providers: providerList,
      keywordResearch,
      competitorResearch
    };
  } catch {
    return fallbackResearch(input);
  }
}
