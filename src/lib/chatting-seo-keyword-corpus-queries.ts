import "server-only";

import type { ChattingSeoAnalysisInput } from "@/lib/chatting-seo-analysis-types";
import type { SeoKeywordCorpusRow } from "@/lib/repositories/seo-keyword-corpus-repository-shared";

export type ChattingSeoDiscoveryQuery = {
  query: string;
  kind: "seed" | "autosuggest" | "competitor" | "comparison" | "use-case" | "refresh";
  themeSlug: string;
  competitorSlug: string;
};

const AUTOSUGGEST_SUFFIXES = [
  "for small teams",
  "software for startups",
  "examples",
  "best practices",
  "pricing",
  "setup guide"
];

const USE_CASE_QUERIES = [
  "live chat for small saas teams",
  "website chat for founder led teams",
  "shared inbox for customer support teams",
  "chat widget for lead generation"
];

function normalizeQuery(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function addQuery(
  target: Map<string, ChattingSeoDiscoveryQuery>,
  query: string,
  kind: ChattingSeoDiscoveryQuery["kind"],
  themeSlug = "",
  competitorSlug = ""
) {
  const normalized = normalizeQuery(query);
  if (!normalized || target.has(normalized)) return;
  target.set(normalized, { query: normalized, kind, themeSlug, competitorSlug });
}

export function buildChattingSeoDiscoveryQueries(input: {
  analysis: ChattingSeoAnalysisInput;
  existingRows: SeoKeywordCorpusRow[];
  limit?: number;
}) {
  const queries = new Map<string, ChattingSeoDiscoveryQuery>();

  input.analysis.candidates.slice(0, 10).forEach((candidate) => {
    addQuery(queries, candidate.keyword, "seed", candidate.themeSlug);
    AUTOSUGGEST_SUFFIXES.forEach((suffix) => addQuery(queries, `${candidate.keyword} ${suffix}`, "autosuggest", candidate.themeSlug));
  });

  input.analysis.competitors.slice(0, 8).forEach((competitor) => {
    addQuery(queries, `${competitor.name} alternative for small teams`, "competitor", "comparisons", competitor.slug);
    addQuery(queries, `chatting vs ${competitor.name}`, "comparison", "comparisons", competitor.slug);
    addQuery(queries, `${competitor.name} pricing`, "comparison", "conversion", competitor.slug);
  });

  USE_CASE_QUERIES.forEach((query) => addQuery(queries, query, "use-case", "small-teams"));
  input.existingRows.slice(0, 12).forEach((row) => addQuery(queries, row.keyword, "refresh", row.theme_slug, row.associated_competitor_slug));

  return [...queries.values()].slice(0, input.limit ?? 28);
}
