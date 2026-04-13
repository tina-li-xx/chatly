import "server-only";

import type { ChattingSeoAnalysis, ChattingSeoAnalysisInput, ChattingSeoKeywordCandidate } from "@/lib/chatting-seo-analysis-types";
import type { ChattingSeoLiveKeywordResearch } from "@/lib/chatting-seo-live-research-types";

function normalizedValue(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function coverageLevel(matches: number): "strong" | "partial" | "gap" {
  if (matches >= 2) return "strong";
  if (matches === 1) return "partial";
  return "gap";
}

function keywordDifficulty(candidate: ChattingSeoKeywordCandidate) {
  if (candidate.intent === "comparison") return "high" as const;
  if (candidate.source === "guide" || candidate.source === "free-tool") return "medium" as const;
  return candidate.keyword.split(" ").length >= 5 ? "low" as const : "medium" as const;
}

function firstMatchingCandidate(candidates: ChattingSeoKeywordCandidate[], predicate: (candidate: ChattingSeoKeywordCandidate) => boolean) {
  return candidates.find(predicate) ?? candidates[0];
}

function researchedCoverage(rank: number | null): "strong" | "partial" | "gap" {
  if (rank != null && rank <= 3) return "strong";
  if (rank != null && rank <= 6) return "partial";
  return "gap";
}

function topKeywordResearch(input: ChattingSeoAnalysisInput) {
  return input.liveResearch?.keywordResearch?.slice(0, 8) ?? [];
}

function keywordOpportunitiesFromResearch(research: ChattingSeoLiveKeywordResearch[]) {
  return research.map((candidate) => ({
    keyword: candidate.keyword,
    title: candidate.title,
    themeSlug: candidate.themeSlug,
    intent: candidate.intent,
    difficulty: candidate.difficulty,
    audienceLabel: candidate.audienceLabel,
    rationale: candidate.rationale,
    priority: candidate.opportunityScore
  }));
}

export function buildFallbackChattingSeoAnalysis(input: ChattingSeoAnalysisInput): ChattingSeoAnalysis {
  const now = new Date().toISOString();
  const topCandidates = input.candidates.slice(0, 8);
  const researchedKeywords = topKeywordResearch(input);
  const categoryCounts = input.blogPosts.reduce<Record<string, number>>((summary, post) => {
    summary[post.categorySlug] = (summary[post.categorySlug] ?? 0) + 1;
    return summary;
  }, {});
  const integrationTerms = ["shopify", "slack", "zapier", "webhook", "ios", "react native"];

  return {
    source: "fallback",
    researchSource: input.liveResearch?.source === "live" ? "live" : "fallback",
    generatedAt: now,
    summary:
      input.liveResearch?.source === "live"
        ? `${input.liveResearch.summary} Chatting has the clearest SEO opening in high-intent small-team live chat queries where buyers want real conversations, lighter workflows, and a credible alternative to enterprise support software.`
        : "Chatting has the clearest SEO opening in high-intent small-team live chat queries where buyers want real conversations, lighter workflows, and a credible alternative to enterprise support software.",
    audienceInsights: input.bestFit.slice(0, 3).map((entry) => {
      const candidate = firstMatchingCandidate(
        topCandidates,
        (item) => normalizedValue(entry).includes(normalizedValue(item.audienceLabel))
      );

      return {
        label: candidate?.audienceLabel ?? "Small teams",
        rationale: entry,
        opportunity: candidate?.keyword ?? topCandidates[0]?.keyword ?? "small team live chat"
      };
    }),
    competitorFindings: input.competitors.slice(0, 4).map((competitor) => {
      const researched = input.liveResearch?.competitorResearch?.find((entry) => entry.slug === competitor.slug);
      const matches = input.blogPosts.filter((post) => {
        const haystack = normalizedValue(`${post.slug} ${post.title} ${post.seoTitle}`);
        return haystack.includes(normalizedValue(competitor.slug)) || haystack.includes(normalizedValue(competitor.name));
      }).length;
      const coverage = researched ? researchedCoverage(researched.chattingRank) : coverageLevel(matches);
      const keyword =
        researched?.query ??
        topCandidates.find((candidate) => normalizedValue(candidate.title).includes(normalizedValue(competitor.slug)))?.keyword ??
        `${competitor.name} alternative`;

      return {
        slug: competitor.slug,
        name: competitor.name,
        coverage,
        finding:
          researched && coverage === "strong"
            ? `Live search results already show Chatting appearing for ${competitor.name}-adjacent searches, but the comparison angle can still be sharpened for small-team buyers.`
            : researched && coverage === "partial"
              ? `Live search results show some visibility against ${competitor.name}, but Chatting is not consistently near the top yet.`
              : researched
                ? `Live search results show a clear visibility gap against ${competitor.name}, which makes this a genuine bottom-funnel opportunity.`
          : coverage === "strong"
            ? `Chatting already has some direct comparison coverage against ${competitor.name}, but the positioning gap still needs fresher decision-stage angles.`
            : coverage === "partial"
              ? `Chatting has early coverage around ${competitor.name}, but there is still room to sharpen the small-team angle and tradeoff framing.`
              : `Chatting has approved competitor framing for ${competitor.name} but little direct content coverage yet.`,
        opportunity:
          coverage === "gap"
            ? `Publish a decision-stage comparison that explains where ${competitor.name} is heavier or broader than a small team actually needs.`
            : `Expand comparison coverage so Chatting owns more of the ${competitor.name} evaluation journey.`,
        recommendedKeyword: keyword
      };
    }),
    keywordOpportunities: researchedKeywords.length
      ? keywordOpportunitiesFromResearch(researchedKeywords)
      : topCandidates.map((candidate) => ({
          keyword: candidate.keyword,
          title: candidate.title,
          themeSlug: candidate.themeSlug,
          intent: candidate.intent,
          difficulty: keywordDifficulty(candidate),
          audienceLabel: candidate.audienceLabel,
          rationale: candidate.rationale,
          priority: candidate.priority
        })),
    contentGaps: [
      ...input.themes
        .filter((theme) => (categoryCounts[theme.slug] ?? 0) <= 1)
        .slice(0, 2)
        .map((theme) => `Current blog coverage is still thin in ${theme.label.toLowerCase()}, which makes it harder to build topical depth around that theme.`),
      input.competitors.some((competitor) =>
        !input.blogPosts.some((post) => normalizedValue(post.title).includes(normalizedValue(competitor.name)))
      )
        ? "Approved competitors still outnumber direct comparison posts, so bottom-funnel decision content is under-covered."
        : "Comparison coverage exists, but it is concentrated in only a few competitor pages.",
      input.guides.some((guide) => integrationTerms.some((term) => normalizedValue(guide.title).includes(term)))
        ? "Chatting already has integration guides, but the blog still lacks enough adjacent educational content to turn those integrations into a broader SEO cluster."
        : "How-to coverage exists, but it is not yet broad enough to fully support the product and conversion pages."
    ].slice(0, 4)
  };
}
