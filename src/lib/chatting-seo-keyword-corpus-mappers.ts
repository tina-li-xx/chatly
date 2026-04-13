import "server-only";

import type { ChattingSeoKeywordCandidate } from "@/lib/chatting-seo-analysis-types";
import type { ChattingSeoLiveResearch } from "@/lib/chatting-seo-live-research-types";
import type { ChattingSeoStoredKeywordResearch, ChattingSeoStoredResearchSummary } from "@/lib/chatting-seo-keyword-corpus-types";
import type { SeoKeywordCorpusRow } from "@/lib/repositories/seo-keyword-corpus-repository-shared";
import type { SeoKeywordResearchRunRow } from "@/lib/repositories/seo-keyword-research-repository-shared";

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string" && Boolean(entry.trim())) : [];
}

function readStoredSummary(value: unknown): ChattingSeoStoredResearchSummary {
  return value && typeof value === "object" ? value as ChattingSeoStoredResearchSummary : {};
}

function candidateFromRow(row: SeoKeywordCorpusRow): ChattingSeoKeywordCandidate {
  return {
    keyword: row.keyword,
    title: row.suggested_title || row.keyword,
    themeSlug: row.theme_slug || "live-chat-tips",
    intent: row.intent,
    audienceLabel: row.audience_label || "Small teams",
    rationale: row.rationale,
    priority: row.opportunity_score,
    source: "research"
  };
}

function liveResearchFromRows(run: SeoKeywordResearchRunRow | null, rows: SeoKeywordCorpusRow[]): ChattingSeoLiveResearch | null {
  if (!run) return null;
  const summary = readStoredSummary(run.summary_json);
  return {
    source: "live",
    generatedAt: run.generated_at ?? run.updated_at,
    summary: summary.summary ?? "Stored keyword corpus was built from external search research.",
    providers: readStringArray(summary.providers) as ChattingSeoLiveResearch["providers"],
    keywordResearch: rows.slice(0, 8).map((row) => ({
      keyword: row.keyword,
      title: row.suggested_title || row.keyword,
      themeSlug: row.theme_slug || "live-chat-tips",
      intent: row.intent,
      difficulty: row.difficulty,
      audienceLabel: row.audience_label || "Small teams",
      source: "research",
      rationale: row.rationale,
      opportunityScore: row.opportunity_score,
      chattingRank: row.chatting_rank,
      competitorHits: row.competitor_hits,
      searchResults: Array.isArray(row.serp_results_json) ? row.serp_results_json as never[] : []
    })),
    competitorResearch: Array.isArray(summary.competitorResearch) ? summary.competitorResearch : []
  };
}

export function mapStoredKeywordResearch(run: SeoKeywordResearchRunRow | null, rows: SeoKeywordCorpusRow[]): ChattingSeoStoredKeywordResearch {
  return {
    candidates: rows.slice(0, 24).map(candidateFromRow),
    liveResearch: liveResearchFromRows(run, rows),
    keywordCount: rows.length,
    runId: run?.id ?? null
  };
}
