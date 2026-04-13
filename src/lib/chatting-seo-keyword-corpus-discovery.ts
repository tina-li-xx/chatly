import "server-only";

import type { ChattingSeoAnalysisInput, ChattingSeoKeywordCandidate } from "@/lib/chatting-seo-analysis-types";
import { buildChattingSeoDiscoveryQueries } from "@/lib/chatting-seo-keyword-corpus-queries";
import { corpusAudience, corpusIntent, corpusTheme } from "@/lib/chatting-seo-keyword-corpus-scoring";
import { extractKeywordIdeas, normalizeKeyword, suggestedKeywordTitle } from "@/lib/chatting-seo-keyword-corpus-extraction";
import { searchLiveSearchResults } from "@/lib/chatting-seo-live-research-service";
import type { ChattingSeoLiveResearchProvider } from "@/lib/chatting-seo-live-research-types";
import type { SeoKeywordCorpusRow } from "@/lib/repositories/seo-keyword-corpus-repository-shared";

export type ChattingSeoDiscoveredKeyword = {
  keyword: string;
  normalizedKeyword: string;
  suggestedTitle: string;
  themeSlug: string;
  associatedCompetitorSlug: string;
  intent: ReturnType<typeof corpusIntent>;
  audienceLabel: string;
  rationale: string;
  sourceQuery: string;
  sourceTitle: string;
  sourceQueries: string[];
  evidenceCount: number;
  priorityHint: number;
};

function seedMap(candidates: ChattingSeoKeywordCandidate[]) {
  return new Map(candidates.map((candidate) => [normalizeKeyword(candidate.keyword), candidate]));
}

function seedPriority(seed: ChattingSeoKeywordCandidate | null, keyword: string, evidenceCount: number) {
  const comparisonBoost = /\balternative|vs|compare|pricing\b/.test(keyword) ? 10 : 0;
  return Math.min(100, (seed?.priority ?? 58) + comparisonBoost + evidenceCount * 6);
}

function addDiscoveredKeyword(
  target: Map<string, ChattingSeoDiscoveredKeyword>,
  keyword: string,
  sourceQuery: string,
  sourceTitle: string,
  seed: ChattingSeoKeywordCandidate | null,
  competitorSlug: string
) {
  const normalized = normalizeKeyword(keyword);
  if (!normalized || normalized.split(/\s+/).length < 2) return;
  const existing = target.get(normalized);
  const evidenceCount = (existing?.evidenceCount ?? 0) + 1;
  const next = {
    keyword: normalized,
    normalizedKeyword: normalized,
    suggestedTitle: seed?.title || existing?.suggestedTitle || suggestedKeywordTitle(normalized),
    themeSlug: seed?.themeSlug || existing?.themeSlug || corpusTheme(normalized),
    associatedCompetitorSlug: competitorSlug || existing?.associatedCompetitorSlug || "",
    intent: seed?.intent || existing?.intent || corpusIntent(normalized),
    audienceLabel: seed?.audienceLabel || existing?.audienceLabel || corpusAudience(normalized),
    rationale:
      seed?.rationale ||
      existing?.rationale ||
      `External search results repeatedly surface ${normalized} around Chatting's category, buyers, and competitor set.`,
    sourceQuery,
    sourceTitle: sourceTitle || existing?.sourceTitle || suggestedKeywordTitle(normalized),
    sourceQueries: [...new Set([...(existing?.sourceQueries ?? []), sourceQuery])],
    evidenceCount,
    priorityHint: seedPriority(seed ?? existingSeed(existing), normalized, evidenceCount)
  } satisfies ChattingSeoDiscoveredKeyword;

  target.set(normalized, next);
}

function existingSeed(value: ChattingSeoDiscoveredKeyword | undefined): ChattingSeoKeywordCandidate | null {
  return value
    ? {
        keyword: value.keyword,
        title: value.suggestedTitle,
        themeSlug: value.themeSlug,
        intent: value.intent,
        audienceLabel: value.audienceLabel,
        rationale: value.rationale,
        priority: value.priorityHint,
        source: "research"
      }
    : null;
}

export async function discoverChattingSeoKeywords(input: {
  analysis: ChattingSeoAnalysisInput;
  existingRows: SeoKeywordCorpusRow[];
}) {
  const seeds = seedMap(input.analysis.candidates);
  const queries = buildChattingSeoDiscoveryQueries({ analysis: input.analysis, existingRows: input.existingRows });
  const keywords = new Map<string, ChattingSeoDiscoveredKeyword>();
  const providers = new Set<ChattingSeoLiveResearchProvider>();

  await Promise.allSettled(
    queries.map(async (entry) => {
      const response = await searchLiveSearchResults(entry.query, 5);
      providers.add(response.provider);
      const seed = seeds.get(normalizeKeyword(entry.query)) ?? null;
      addDiscoveredKeyword(keywords, entry.query, entry.query, seed?.title || "", seed, entry.competitorSlug);

      response.results.forEach((result) => {
        extractKeywordIdeas({ title: result.title, snippet: result.snippet }).forEach((idea) =>
          addDiscoveredKeyword(
            keywords,
            idea,
            entry.query,
            result.title,
            seeds.get(idea) ?? seed,
            entry.competitorSlug
          )
        );
      });
    })
  );

  return {
    discoveryQueries: queries.map((entry) => entry.query),
    providers: [...providers].sort(),
    keywords: [...keywords.values()]
      .sort((left, right) => right.priorityHint - left.priorityHint || right.evidenceCount - left.evidenceCount)
      .slice(0, 40)
  };
}
