import type {
  ChattingSeoKeywordCandidate,
  ChattingSeoKeywordDifficulty,
  ChattingSeoKeywordIntent
} from "@/lib/chatting-seo-analysis-types";

export type ChattingSeoLiveSearchResult = {
  rank: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
};

export type ChattingSeoLiveResearchProvider = "searxng-json" | "bing-rss" | "duckduckgo-html";

export type ChattingSeoLiveKeywordResearch = Pick<
  ChattingSeoKeywordCandidate,
  "keyword" | "title" | "themeSlug" | "audienceLabel" | "source"
> & {
  intent: ChattingSeoKeywordIntent;
  difficulty: ChattingSeoKeywordDifficulty;
  rationale: string;
  opportunityScore: number;
  chattingRank: number | null;
  competitorHits: number;
  searchResults: ChattingSeoLiveSearchResult[];
};

export type ChattingSeoLiveCompetitorResearch = {
  slug: string;
  name: string;
  query: string;
  chattingRank: number | null;
  competitorRank: number | null;
  searchResults: ChattingSeoLiveSearchResult[];
};

export type ChattingSeoLiveResearch = {
  source: "live" | "fallback";
  generatedAt: string;
  summary: string;
  providers: ChattingSeoLiveResearchProvider[];
  keywordResearch: ChattingSeoLiveKeywordResearch[];
  competitorResearch: ChattingSeoLiveCompetitorResearch[];
};
