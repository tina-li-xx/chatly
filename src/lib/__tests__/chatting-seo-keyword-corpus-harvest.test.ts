import { buildHarvestedKeywordCorpus } from "@/lib/chatting-seo-keyword-corpus-harvest";

describe("chatting seo keyword corpus harvest", () => {
  it("merges tracked queries with extracted external keyword ideas", () => {
    const harvested = buildHarvestedKeywordCorpus({
      candidates: [{
        keyword: "shared inbox for website chat",
        title: "Shared inbox for website chat conversations",
        themeSlug: "product",
        intent: "commercial",
        audienceLabel: "Lean support teams",
        rationale: "Core product workflow.",
        priority: 92,
        source: "seed"
      }],
      liveResearch: {
        source: "live",
        generatedAt: "2026-04-13T10:00:00.000Z",
        summary: "Search reviewed current rankings.",
        providers: ["searxng-json"],
        keywordResearch: [{
          keyword: "shared inbox for website chat",
          title: "Shared inbox for website chat conversations",
          themeSlug: "product",
          intent: "commercial",
          audienceLabel: "Lean support teams",
          source: "seed",
          difficulty: "medium",
          rationale: "Strong workflow term.",
          opportunityScore: 92,
          chattingRank: null,
          competitorHits: 2,
          searchResults: [{
            rank: 1,
            title: "Shared inbox for website chat teams | Example",
            url: "https://example.com/shared-inbox",
            domain: "example.com",
            snippet: "Shared inbox for website chat teams helps small support teams stay fast."
          }]
        }],
        competitorResearch: []
      }
    });

    expect(harvested[0]?.keyword).toBe("shared inbox for website chat");
    expect(harvested[0]?.providers).toEqual(["searxng-json"]);
    expect(harvested.some((entry) => entry.keyword.includes("shared inbox for website chat teams"))).toBe(true);
  });
});
