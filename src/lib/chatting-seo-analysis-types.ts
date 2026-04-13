import type { ChattingSeoLiveResearch } from "@/lib/chatting-seo-live-research-types";

export type ChattingSeoKeywordIntent = "commercial" | "informational" | "comparison";
export type ChattingSeoKeywordDifficulty = "low" | "medium" | "high";
export type ChattingSeoCoverageLevel = "strong" | "partial" | "gap";

export type ChattingSeoKeywordCandidate = {
  keyword: string;
  title: string;
  themeSlug: string;
  intent: ChattingSeoKeywordIntent;
  audienceLabel: string;
  rationale: string;
  priority: number;
  source: "seed" | "guide" | "free-tool" | "research";
};

export type ChattingSeoAnalysisInput = {
  productName: string;
  canonicalUrl: string;
  siteTitle: string;
  siteDescription: string;
  pricingAnchor: string;
  positioning: string[];
  founderApprovedClaims: string[];
  verifiedProductCoverage: string[];
  bestFit: string[];
  notFit: string[];
  contentFit: string[];
  contentMisfit: string[];
  competitors: Array<{ slug: string; name: string; summary: string; points: string[] }>;
  themes: Array<{ slug: string; label: string; description: string }>;
  blogPosts: Array<{ slug: string; title: string; seoTitle: string; categorySlug: string }>;
  guides: Array<{ slug: string; title: string; seoTitle: string }>;
  freeTools: Array<{ slug: string; title: string; category: string; seoTitle: string }>;
  candidates: ChattingSeoKeywordCandidate[];
  liveResearch?: ChattingSeoLiveResearch | null;
};

export type ChattingSeoAnalysis = {
  source: "ai" | "fallback";
  researchSource: "live" | "fallback";
  generatedAt: string;
  summary: string;
  audienceInsights: Array<{ label: string; rationale: string; opportunity: string }>;
  competitorFindings: Array<{
    slug: string;
    name: string;
    coverage: ChattingSeoCoverageLevel;
    finding: string;
    opportunity: string;
    recommendedKeyword: string;
  }>;
  keywordOpportunities: Array<{
    keyword: string;
    title: string;
    themeSlug: string;
    intent: ChattingSeoKeywordIntent;
    difficulty: ChattingSeoKeywordDifficulty;
    audienceLabel: string;
    rationale: string;
    priority: number;
  }>;
  contentGaps: string[];
};
