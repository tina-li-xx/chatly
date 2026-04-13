export type SeoKeywordCorpusRow = {
  id: string;
  owner_user_id: string;
  latest_run_id: string | null;
  normalized_keyword: string;
  keyword: string;
  suggested_title: string;
  source_query: string;
  source_title: string;
  theme_slug: string;
  associated_competitor_slug: string;
  intent: "commercial" | "informational" | "comparison";
  difficulty: "low" | "medium" | "high";
  audience_label: string;
  rationale: string;
  opportunity_score: number;
  evidence_count: number;
  appearance_count: number;
  missing_cycle_count: number;
  chatting_rank: number | null;
  competitor_hits: number;
  persistence_score: number;
  competitor_density_score: number;
  chatting_gap_score: number;
  small_team_relevance_score: number;
  commercial_intent_score: number;
  stability_score: number;
  providers_json: unknown;
  result_domains_json: unknown;
  serp_results_json: unknown;
  metadata_json: unknown;
  first_seen_at: string;
  last_seen_at: string;
  stale_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UpsertSeoKeywordCorpusInput = {
  id: string;
  latestRunId?: string | null;
  keyword: string;
  normalizedKeyword: string;
  suggestedTitle: string;
  sourceQuery?: string;
  sourceTitle?: string;
  themeSlug?: string;
  associatedCompetitorSlug?: string;
  intent?: "commercial" | "informational" | "comparison";
  difficulty?: "low" | "medium" | "high";
  audienceLabel?: string;
  rationale?: string;
  opportunityScore?: number;
  evidenceCount?: number;
  appearanceCount?: number;
  missingCycleCount?: number;
  chattingRank?: number | null;
  competitorHits?: number;
  persistenceScore?: number;
  competitorDensityScore?: number;
  chattingGapScore?: number;
  smallTeamRelevanceScore?: number;
  commercialIntentScore?: number;
  stabilityScore?: number;
  providersJson?: string[];
  resultDomainsJson?: string[];
  serpResultsJson?: unknown[];
  metadataJson?: Record<string, unknown>;
  firstSeenAt?: string;
  lastSeenAt?: string;
  staleAt?: string | null;
};

export const SEO_KEYWORD_CORPUS_COLUMNS = `
  id, owner_user_id, latest_run_id, normalized_keyword, keyword, suggested_title,
  source_query, source_title, theme_slug, associated_competitor_slug, intent, difficulty,
  audience_label, rationale, opportunity_score, evidence_count, appearance_count,
  missing_cycle_count, chatting_rank, competitor_hits, persistence_score,
  competitor_density_score, chatting_gap_score, small_team_relevance_score,
  commercial_intent_score, stability_score, providers_json, result_domains_json,
  serp_results_json, metadata_json, first_seen_at::text AS first_seen_at,
  last_seen_at::text AS last_seen_at, stale_at::text AS stale_at,
  created_at::text AS created_at, updated_at::text AS updated_at
`;

export function serializeSeoKeywordCorpusRows(items: UpsertSeoKeywordCorpusInput[]) {
  return items.map((item) => ({
    id: item.id,
    latest_run_id: item.latestRunId ?? null,
    keyword: item.keyword,
    normalized_keyword: item.normalizedKeyword,
    suggested_title: item.suggestedTitle,
    source_query: item.sourceQuery ?? "",
    source_title: item.sourceTitle ?? "",
    theme_slug: item.themeSlug ?? "",
    associated_competitor_slug: item.associatedCompetitorSlug ?? "",
    intent: item.intent ?? "informational",
    difficulty: item.difficulty ?? "medium",
    audience_label: item.audienceLabel ?? "",
    rationale: item.rationale ?? "",
    opportunity_score: item.opportunityScore ?? 0,
    evidence_count: item.evidenceCount ?? 0,
    appearance_count: item.appearanceCount ?? 0,
    missing_cycle_count: item.missingCycleCount ?? 0,
    chatting_rank: item.chattingRank ?? null,
    competitor_hits: item.competitorHits ?? 0,
    persistence_score: item.persistenceScore ?? 0,
    competitor_density_score: item.competitorDensityScore ?? 0,
    chatting_gap_score: item.chattingGapScore ?? 0,
    small_team_relevance_score: item.smallTeamRelevanceScore ?? 0,
    commercial_intent_score: item.commercialIntentScore ?? 0,
    stability_score: item.stabilityScore ?? 0,
    providers_json: item.providersJson ?? [],
    result_domains_json: item.resultDomainsJson ?? [],
    serp_results_json: item.serpResultsJson ?? [],
    metadata_json: item.metadataJson ?? {},
    first_seen_at: item.firstSeenAt ?? new Date().toISOString(),
    last_seen_at: item.lastSeenAt ?? new Date().toISOString(),
    stale_at: item.staleAt ?? null
  }));
}
