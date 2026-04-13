export type SeoKeywordSerpSnapshotRow = {
  id: string;
  owner_user_id: string;
  run_id: string;
  keyword_corpus_id: string | null;
  normalized_keyword: string;
  source_query: string;
  provider: string;
  rank: number;
  result_url: string;
  result_domain: string;
  result_title: string;
  result_snippet: string;
  matched_competitor_slug: string;
  is_chatting: boolean;
  content_pattern: string;
  captured_at: string;
  created_at: string;
};

export type InsertSeoKeywordSerpSnapshotInput = {
  id: string;
  runId: string;
  keywordCorpusId?: string | null;
  normalizedKeyword: string;
  sourceQuery?: string;
  provider?: string;
  rank: number;
  resultUrl?: string;
  resultDomain?: string;
  resultTitle?: string;
  resultSnippet?: string;
  matchedCompetitorSlug?: string;
  isChatting?: boolean;
  contentPattern?: string;
  capturedAt?: string;
};

export const SEO_KEYWORD_SERP_SNAPSHOT_COLUMNS = `
  id, owner_user_id, run_id, keyword_corpus_id, normalized_keyword,
  source_query, provider, rank, result_url, result_domain, result_title,
  result_snippet, matched_competitor_slug, is_chatting, content_pattern,
  captured_at::text AS captured_at, created_at::text AS created_at
`;

export function serializeSeoKeywordSerpSnapshotRows(items: InsertSeoKeywordSerpSnapshotInput[]) {
  return items.map((item) => ({
    id: item.id,
    run_id: item.runId,
    keyword_corpus_id: item.keywordCorpusId ?? null,
    normalized_keyword: item.normalizedKeyword,
    source_query: item.sourceQuery ?? "",
    provider: item.provider ?? "",
    rank: item.rank,
    result_url: item.resultUrl ?? "",
    result_domain: item.resultDomain ?? "",
    result_title: item.resultTitle ?? "",
    result_snippet: item.resultSnippet ?? "",
    matched_competitor_slug: item.matchedCompetitorSlug ?? "",
    is_chatting: item.isChatting ?? false,
    content_pattern: item.contentPattern ?? "article",
    captured_at: item.capturedAt ?? new Date().toISOString()
  }));
}
