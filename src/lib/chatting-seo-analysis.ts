import "server-only";

import { buildChattingSeoBaseAnalysisInput } from "@/lib/chatting-seo-analysis-input";
import { buildFallbackChattingSeoAnalysis } from "@/lib/chatting-seo-analysis-fallback";
import { getChattingSeoStoredKeywordResearch } from "@/lib/chatting-seo-keyword-corpus";
import { generateChattingSeoAnalysis } from "@/lib/chatting-seo-analysis-service";
import type { ChattingSeoAnalysis, ChattingSeoAnalysisInput } from "@/lib/chatting-seo-analysis-types";

function keywordKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function mergeKeywordOpportunities(primary: ChattingSeoAnalysis["keywordOpportunities"], fallback: ChattingSeoAnalysis["keywordOpportunities"]) {
  const primaryByKeyword = new Map(primary.map((item) => [keywordKey(item.keyword), item]));
  const merged = fallback.map((item) => {
    const key = keywordKey(item.keyword);
    const preferred = primaryByKeyword.get(key);
    primaryByKeyword.delete(key);
    return preferred
      ? {
          ...item,
          title: preferred.title || item.title,
          themeSlug: preferred.themeSlug || item.themeSlug,
          intent: preferred.intent || item.intent,
          audienceLabel: preferred.audienceLabel || item.audienceLabel,
          rationale: preferred.rationale || item.rationale
        }
      : item;
  });

  primary.forEach((item) => {
    const key = keywordKey(item.keyword);
    if (!primaryByKeyword.has(key)) return;
    primaryByKeyword.delete(key);
    merged.push(item);
  });

  return merged.slice(0, 8);
}

async function buildChattingSeoAnalysisInput(input?: {
  ownerUserId?: string;
  actorUserId?: string | null;
}): Promise<ChattingSeoAnalysisInput> {
  const storedResearch = await getChattingSeoStoredKeywordResearch(input);
  return buildChattingSeoBaseAnalysisInput({
    candidates: storedResearch.candidates.length ? storedResearch.candidates : undefined,
    liveResearch: storedResearch.liveResearch
  });
}

export async function getChattingSeoAnalysis(input?: {
  ownerUserId?: string;
  actorUserId?: string | null;
}): Promise<ChattingSeoAnalysis> {
  const analysisInput = await buildChattingSeoAnalysisInput(input);
  const fallback = buildFallbackChattingSeoAnalysis(analysisInput);

  try {
    const live = await generateChattingSeoAnalysis(analysisInput);
    return {
      ...live,
      summary: live.summary || fallback.summary,
      audienceInsights: live.audienceInsights.length ? live.audienceInsights : fallback.audienceInsights,
      competitorFindings: live.competitorFindings.length ? live.competitorFindings : fallback.competitorFindings,
      keywordOpportunities:
        fallback.researchSource === "live"
          ? mergeKeywordOpportunities(live.keywordOpportunities, fallback.keywordOpportunities)
          : live.keywordOpportunities.length
            ? live.keywordOpportunities
            : fallback.keywordOpportunities,
      contentGaps: live.contentGaps.length ? live.contentGaps : fallback.contentGaps
    };
  } catch {
    return fallback;
  }
}
