import "server-only";

import { randomUUID } from "node:crypto";
import { buildChattingSeoBaseAnalysisInput } from "@/lib/chatting-seo-analysis-input";
import { discoverChattingSeoKeywords } from "@/lib/chatting-seo-keyword-corpus-discovery";
import { deriveHistoricalKeywordScores } from "@/lib/chatting-seo-keyword-history";
import { searchLiveSearchResults } from "@/lib/chatting-seo-live-research-service";
import { contentPatternForResult, matchesChatting, matchesCompetitor } from "@/lib/chatting-seo-serp-matching";
import type { ChattingSeoLiveSearchResult } from "@/lib/chatting-seo-live-research-types";
import type { SeoKeywordCorpusRow, UpsertSeoKeywordCorpusInput } from "@/lib/repositories/seo-keyword-corpus-repository-shared";

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string" && Boolean(entry.trim())) : [];
}

function clamp(value: number) {
  return Math.min(100, Math.max(1, Math.round(value)));
}

function trackedKeywords(discovered: Awaited<ReturnType<typeof discoverChattingSeoKeywords>>["keywords"], existingRows: SeoKeywordCorpusRow[]) {
  const keywords = new Map(discovered.map((entry) => [entry.normalizedKeyword, entry]));
  existingRows.slice(0, 12).forEach((row) => {
    if (!keywords.has(row.normalized_keyword)) {
      keywords.set(row.normalized_keyword, {
        keyword: row.keyword,
        normalizedKeyword: row.normalized_keyword,
        suggestedTitle: row.suggested_title,
        themeSlug: row.theme_slug,
        associatedCompetitorSlug: row.associated_competitor_slug,
        intent: row.intent,
        audienceLabel: row.audience_label,
        rationale: row.rationale,
        sourceQuery: row.source_query,
        sourceTitle: row.source_title,
        sourceQueries: readStringArray(row.metadata_json && typeof row.metadata_json === "object" ? (row.metadata_json as { sourceQueries?: unknown }).sourceQueries : []),
        evidenceCount: row.evidence_count,
        priorityHint: row.opportunity_score
      });
    }
  });

  return [...keywords.values()].sort((left, right) => right.priorityHint - left.priorityHint).slice(0, 24);
}

function competitorStats(results: ChattingSeoLiveSearchResult[], competitors: ReturnType<typeof buildChattingSeoBaseAnalysisInput>["competitors"]) {
  const matched = competitors.filter((competitor) => results.some((result) => matchesCompetitor(result, competitor.slug, competitor.name)));
  return { competitorHits: matched.length, matchedCompetitorSlug: matched[0]?.slug ?? "" };
}

function corpusInput(input: {
  row: Awaited<ReturnType<typeof discoverChattingSeoKeywords>>["keywords"][number];
  previous: SeoKeywordCorpusRow | undefined;
  results: ChattingSeoLiveSearchResult[];
  provider: string;
  capturedAt: string;
  competitors: ReturnType<typeof buildChattingSeoBaseAnalysisInput>["competitors"];
}): UpsertSeoKeywordCorpusInput {
  const currentRank = input.results.find((result) => matchesChatting(result))?.rank ?? null;
  const { competitorHits, matchedCompetitorSlug } = competitorStats(input.results, input.competitors);
  const priorDomains = readStringArray(input.previous?.result_domains_json);
  const currentDomains = [...new Set(input.results.map((result) => result.domain).filter(Boolean))];
  const resultDomains = [...new Set([...priorDomains, ...currentDomains])].slice(0, 16);
  const firstSeenAt = input.previous?.first_seen_at ?? input.capturedAt;
  const appearanceCount = (input.previous?.appearance_count ?? 0) + 1;
  const history = deriveHistoricalKeywordScores({
    keyword: input.row.keyword,
    themeSlug: input.row.themeSlug,
    intent: input.row.intent,
    chattingRank: currentRank ?? input.previous?.chatting_rank ?? null,
    competitorHits,
    appearanceCount,
    missingCycleCount: 0,
    firstSeenAt,
    lastSeenAt: input.capturedAt,
    distinctDomains: resultDomains.length
  });

  return {
    id: input.previous?.id ?? `seo_keyword_${randomUUID()}`,
    latestRunId: null,
    keyword: input.row.keyword,
    normalizedKeyword: input.row.normalizedKeyword,
    suggestedTitle: input.row.suggestedTitle,
    sourceQuery: input.row.sourceQuery,
    sourceTitle: input.row.sourceTitle,
    themeSlug: history.themeSlug,
    associatedCompetitorSlug: input.row.associatedCompetitorSlug || matchedCompetitorSlug || input.previous?.associated_competitor_slug || "",
    intent: history.intent,
    difficulty: history.difficulty,
    audienceLabel: input.row.audienceLabel,
    rationale: input.row.rationale,
    opportunityScore: clamp(history.opportunityScore * 0.72 + input.row.priorityHint * 0.28),
    evidenceCount: (input.previous?.evidence_count ?? 0) + input.row.evidenceCount,
    appearanceCount,
    missingCycleCount: 0,
    chattingRank: currentRank,
    competitorHits,
    persistenceScore: history.persistenceScore,
    competitorDensityScore: history.competitorDensityScore,
    chattingGapScore: history.chattingGapScore,
    smallTeamRelevanceScore: history.smallTeamRelevanceScore,
    commercialIntentScore: history.commercialIntentScore,
    stabilityScore: history.stabilityScore,
    providersJson: [...new Set([...(readStringArray(input.previous?.providers_json)), input.provider].filter(Boolean))],
    resultDomainsJson: resultDomains,
    serpResultsJson: input.results,
    metadataJson: {
      contentPatterns: [...new Set(input.results.map((result) => contentPatternForResult(result)))],
      sourceQueries: input.row.sourceQueries,
      lastProvider: input.provider
    },
    firstSeenAt,
    lastSeenAt: input.capturedAt,
    staleAt: null
  };
}

export async function buildChattingSeoKeywordCorpusRefresh(existingRows: SeoKeywordCorpusRow[]) {
  const analysis = buildChattingSeoBaseAnalysisInput();
  const discovery = await discoverChattingSeoKeywords({ analysis, existingRows });
  const tracked = trackedKeywords(discovery.keywords, existingRows);
  const capturedAt = new Date().toISOString();
  const previousByKeyword = new Map(existingRows.map((row) => [row.normalized_keyword, row]));
  const responseMap = new Map<string, { provider: string; results: ChattingSeoLiveSearchResult[] }>();

  await Promise.allSettled(
    tracked.map(async (entry) => {
      const response = await searchLiveSearchResults(entry.keyword, 5);
      responseMap.set(entry.normalizedKeyword, response);
    })
  );

  const discoveryKeys = new Set(discovery.keywords.map((entry) => entry.normalizedKeyword));
  const persistedKeywords = [
    ...discovery.keywords,
    ...tracked.filter((entry) => !discoveryKeys.has(entry.normalizedKeyword) && responseMap.has(entry.normalizedKeyword))
  ];
  const items = persistedKeywords.map((entry) =>
    corpusInput({
      row: entry,
      previous: previousByKeyword.get(entry.normalizedKeyword),
      results: responseMap.get(entry.normalizedKeyword)?.results ?? [],
      provider: responseMap.get(entry.normalizedKeyword)?.provider ?? discovery.providers[0] ?? "",
      capturedAt,
      competitors: analysis.competitors
    })
  );

  return {
    capturedAt,
    competitors: analysis.competitors,
    discoveryQueries: discovery.discoveryQueries,
    existingByKeyword: previousByKeyword,
    items,
    providers: [...new Set([...discovery.providers, ...[...responseMap.values()].map((entry) => entry.provider)])],
    responseMap
  };
}
