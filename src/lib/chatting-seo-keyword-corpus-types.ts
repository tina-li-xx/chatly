import type { ChattingSeoKeywordCandidate, ChattingSeoKeywordDifficulty, ChattingSeoKeywordIntent } from "@/lib/chatting-seo-analysis-types";
import type {
  ChattingSeoLiveCompetitorResearch,
  ChattingSeoLiveResearch,
  ChattingSeoLiveResearchProvider,
  ChattingSeoLiveSearchResult
} from "@/lib/chatting-seo-live-research-types";

export type ChattingSeoHarvestedKeyword = {
  id: string;
  keyword: string;
  normalizedKeyword: string;
  suggestedTitle: string;
  sourceQuery: string;
  sourceTitle: string;
  themeSlug: string;
  intent: ChattingSeoKeywordIntent;
  difficulty: ChattingSeoKeywordDifficulty;
  audienceLabel: string;
  rationale: string;
  opportunityScore: number;
  evidenceCount: number;
  chattingRank: number | null;
  competitorHits: number;
  providers: ChattingSeoLiveResearchProvider[];
  serpResults: ChattingSeoLiveSearchResult[];
  metadata: Record<string, unknown>;
};

export type ChattingSeoStoredKeywordResearch = {
  candidates: ChattingSeoKeywordCandidate[];
  liveResearch: ChattingSeoLiveResearch | null;
  keywordCount: number;
  runId: string | null;
};

export type ChattingSeoStoredResearchSummary = {
  summary?: string;
  providers?: ChattingSeoLiveResearchProvider[];
  competitorResearch?: ChattingSeoLiveCompetitorResearch[];
  researchEngineVersion?: string;
};
