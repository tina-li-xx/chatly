import "server-only";

import { randomUUID } from "node:crypto";
import type { ChattingSeoKeywordCandidate } from "@/lib/chatting-seo-analysis-types";
import type { ChattingSeoLiveResearch } from "@/lib/chatting-seo-live-research-types";
import { extractKeywordIdeas, normalizeKeyword, suggestedKeywordTitle } from "@/lib/chatting-seo-keyword-corpus-extraction";
import { corpusAudience, corpusDifficulty, corpusIntent, corpusScore, corpusTheme } from "@/lib/chatting-seo-keyword-corpus-scoring";
import type { ChattingSeoHarvestedKeyword } from "@/lib/chatting-seo-keyword-corpus-types";

function seedMap(candidates: ChattingSeoKeywordCandidate[]) {
  return new Map(candidates.map((candidate) => [normalizeKeyword(candidate.keyword), candidate]));
}

function addKeyword(target: Map<string, ChattingSeoHarvestedKeyword>, keyword: ChattingSeoHarvestedKeyword) {
  const existing = target.get(keyword.normalizedKeyword);
  if (!existing) {
    target.set(keyword.normalizedKeyword, keyword);
    return;
  }

  const preferred = keyword.opportunityScore > existing.opportunityScore ? keyword : existing;
  const evidenceCount = existing.evidenceCount + keyword.evidenceCount;
  target.set(keyword.normalizedKeyword, {
    ...preferred,
    evidenceCount,
    opportunityScore: Math.min(100, Math.max(preferred.opportunityScore, existing.opportunityScore) + Math.min(10, evidenceCount - 1)),
    chattingRank: [existing.chattingRank, keyword.chattingRank].filter((value): value is number => value != null).sort((left, right) => left - right)[0] ?? null,
    competitorHits: Math.max(existing.competitorHits, keyword.competitorHits),
    providers: [...new Set([...existing.providers, ...keyword.providers])],
    metadata: {
      ...existing.metadata,
      ...keyword.metadata,
      sourceQueries: [...new Set([...(existing.metadata.sourceQueries as string[] | undefined) ?? [], ...(keyword.metadata.sourceQueries as string[] | undefined) ?? []])]
    }
  });
}

function harvestedKeyword(input: {
  keyword: string;
  sourceQuery: string;
  sourceTitle: string;
  seed: ChattingSeoKeywordCandidate | null;
  opportunityScore: number;
  chattingRank: number | null;
  competitorHits: number;
  providers: ChattingSeoHarvestedKeyword["providers"];
  serpResults: ChattingSeoHarvestedKeyword["serpResults"];
  resultRank?: number;
  sourceKind: "query" | "result-title";
}) {
  const normalizedKeyword = normalizeKeyword(input.keyword);
  return {
    id: `seo_keyword_${randomUUID()}`,
    keyword: normalizedKeyword,
    normalizedKeyword,
    suggestedTitle: input.seed?.title || suggestedKeywordTitle(normalizedKeyword),
    sourceQuery: input.sourceQuery,
    sourceTitle: input.sourceTitle,
    themeSlug: input.seed?.themeSlug || corpusTheme(normalizedKeyword),
    intent: input.seed?.intent || corpusIntent(normalizedKeyword),
    difficulty: corpusDifficulty(normalizedKeyword, input.competitorHits),
    audienceLabel: input.seed?.audienceLabel || corpusAudience(normalizedKeyword),
    rationale: input.seed?.rationale || `External search results repeatedly surface ${normalizedKeyword} around Chatting's category and competitor set.`,
    opportunityScore: corpusScore({
      keyword: normalizedKeyword,
      seed: input.seed,
      resultRank: input.resultRank,
      competitorHits: input.competitorHits,
      chattingRank: input.chattingRank,
      evidenceCount: 1
    }) + Math.max(0, input.opportunityScore - 80),
    evidenceCount: 1,
    chattingRank: input.chattingRank,
    competitorHits: input.competitorHits,
    providers: input.providers,
    serpResults: input.serpResults,
    metadata: { sourceKind: input.sourceKind, sourceQueries: [input.sourceQuery] }
  } satisfies ChattingSeoHarvestedKeyword;
}

export function buildHarvestedKeywordCorpus(input: {
  candidates: ChattingSeoKeywordCandidate[];
  liveResearch: ChattingSeoLiveResearch;
}) {
  const seeds = seedMap(input.candidates);
  const keywords = new Map<string, ChattingSeoHarvestedKeyword>();

  input.liveResearch.keywordResearch.forEach((entry) => {
    const seed = seeds.get(normalizeKeyword(entry.keyword)) ?? null;
    addKeyword(keywords, harvestedKeyword({
      keyword: entry.keyword,
      sourceQuery: entry.keyword,
      sourceTitle: entry.title,
      seed,
      opportunityScore: entry.opportunityScore,
      chattingRank: entry.chattingRank,
      competitorHits: entry.competitorHits,
      providers: input.liveResearch.providers,
      serpResults: entry.searchResults,
      sourceKind: "query"
    }));

    entry.searchResults.forEach((result) => {
      extractKeywordIdeas({ title: result.title, snippet: result.snippet }).forEach((idea) => {
        addKeyword(keywords, harvestedKeyword({
          keyword: idea,
          sourceQuery: entry.keyword,
          sourceTitle: result.title,
          seed: seeds.get(idea) ?? seed,
          opportunityScore: entry.opportunityScore,
          chattingRank: entry.chattingRank,
          competitorHits: entry.competitorHits,
          providers: input.liveResearch.providers,
          serpResults: entry.searchResults,
          resultRank: result.rank,
          sourceKind: "result-title"
        }));
      });
    });
  });

  return [...keywords.values()]
    .map((entry) => ({ ...entry, opportunityScore: Math.min(100, entry.opportunityScore) }))
    .sort((left, right) => right.opportunityScore - left.opportunityScore || right.evidenceCount - left.evidenceCount)
    .slice(0, 60);
}
