import { buildChattingSeoAnalysisCandidates } from "@/lib/chatting-seo-analysis-candidates";
import { buildFallbackChattingSeoAnalysis } from "@/lib/chatting-seo-analysis-fallback";
import { chattingSeoProfile } from "@/lib/chatting-seo-profile";
import { generatedBlogPosts } from "@/lib/generated-blog-posts";

function buildAnalysisInput() {
  return {
    productName: chattingSeoProfile.productName,
    canonicalUrl: chattingSeoProfile.canonicalUrl,
    siteTitle: chattingSeoProfile.seo.siteTitle,
    siteDescription: chattingSeoProfile.seo.siteDescription,
    pricingAnchor: chattingSeoProfile.seo.pricingAnchor,
    positioning: chattingSeoProfile.messaging.positioning,
    founderApprovedClaims: chattingSeoProfile.messaging.founderApprovedClaims,
    verifiedProductCoverage: chattingSeoProfile.messaging.verifiedProductCoverage,
    bestFit: chattingSeoProfile.messaging.bestFit,
    notFit: chattingSeoProfile.messaging.notFit,
    contentFit: chattingSeoProfile.messaging.contentFit,
    contentMisfit: chattingSeoProfile.messaging.contentMisfit,
    competitors: chattingSeoProfile.messaging.competitiveFraming.map((entry) => ({ ...entry })),
    themes: chattingSeoProfile.contentInventory.blogCategories.map((entry) => ({ ...entry })),
    blogPosts: generatedBlogPosts.map((post) => ({
      slug: post.slug,
      title: post.title,
      seoTitle: post.seoTitle ?? post.title,
      categorySlug: post.categorySlug
    })),
    guides: chattingSeoProfile.contentInventory.guides,
    freeTools: chattingSeoProfile.contentInventory.freeTools,
    candidates: buildChattingSeoAnalysisCandidates(chattingSeoProfile)
  };
}

describe("chatting seo analysis fallback", () => {
  it("builds audience, competitor, keyword, and gap analysis from current Chatting sources", () => {
    const analysis = buildFallbackChattingSeoAnalysis(buildAnalysisInput());

    expect(analysis.source).toBe("fallback");
    expect(analysis.researchSource).toBe("fallback");
    expect(analysis.summary).toContain("Chatting");
    expect(analysis.audienceInsights.length).toBeGreaterThan(0);
    expect(analysis.competitorFindings.length).toBeGreaterThan(0);
    expect(analysis.keywordOpportunities.length).toBeGreaterThan(0);
    expect(analysis.contentGaps.length).toBeGreaterThan(0);
  });

  it("anchors keyword opportunities to live research when search data is available", () => {
    const analysis = buildFallbackChattingSeoAnalysis({
      ...buildAnalysisInput(),
      liveResearch: {
        source: "live",
        generatedAt: "2026-04-12T09:00:00.000Z",
        summary: "Live search research reviewed current SearXNG results.",
        providers: ["searxng-json"],
        keywordResearch: [
          {
            keyword: "shared inbox for website chat",
            title: "Shared inbox for website chat conversations",
            themeSlug: "product",
            intent: "commercial",
            audienceLabel: "Support leads",
            source: "seed",
            difficulty: "medium",
            rationale: "Live search shows room to win this workflow term.",
            opportunityScore: 93,
            chattingRank: null,
            competitorHits: 2,
            searchResults: []
          }
        ],
        competitorResearch: [
          {
            slug: "intercom",
            name: "Intercom",
            query: "intercom alternative for small teams",
            chattingRank: null,
            competitorRank: 1,
            searchResults: []
          }
        ]
      }
    });

    expect(analysis.researchSource).toBe("live");
    expect(analysis.summary).toContain("Live search research");
    expect(analysis.keywordOpportunities[0]?.keyword).toBe("shared inbox for website chat");
    expect(analysis.keywordOpportunities[0]?.priority).toBe(93);
    expect(analysis.competitorFindings[0]?.coverage).toBe("gap");
  });
});
