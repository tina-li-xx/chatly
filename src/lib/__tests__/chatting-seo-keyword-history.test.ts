import { deriveHistoricalKeywordScores } from "@/lib/chatting-seo-keyword-history";

describe("chatting seo keyword history", () => {
  it("rewards repeated appearance and a visible Chatting gap", () => {
    const score = deriveHistoricalKeywordScores({
      keyword: "best chat widget for small teams",
      themeSlug: "small-teams",
      intent: "commercial",
      chattingRank: null,
      competitorHits: 3,
      appearanceCount: 4,
      missingCycleCount: 0,
      firstSeenAt: "2026-04-01T00:00:00.000Z",
      lastSeenAt: "2026-04-13T00:00:00.000Z",
      distinctDomains: 9
    });

    expect(score.persistenceScore).toBeGreaterThan(40);
    expect(score.chattingGapScore).toBeGreaterThan(60);
    expect(score.opportunityScore).toBeGreaterThan(60);
    expect(score.difficulty).toBe("high");
  });
});
