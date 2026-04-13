import { buildChattingSeoDiscoveryQueries } from "@/lib/chatting-seo-keyword-corpus-queries";

describe("chatting seo keyword corpus queries", () => {
  it("expands seed, competitor, comparison, use-case, and refresh queries", () => {
    const queries = buildChattingSeoDiscoveryQueries({
      analysis: {
        candidates: [{
          keyword: "chat widget",
          title: "Chat widget",
          themeSlug: "product",
          intent: "commercial",
          audienceLabel: "Small teams",
          rationale: "Seed",
          priority: 80,
          source: "seed"
        }],
        competitors: [{ slug: "intercom", name: "Intercom", summary: "", points: [] }]
      } as never,
      existingRows: [{
        keyword: "shared inbox for website chat",
        normalized_keyword: "shared inbox for website chat",
        theme_slug: "product",
        associated_competitor_slug: ""
      }] as never
    });

    expect(queries.map((entry) => entry.query)).toEqual(expect.arrayContaining([
      "chat widget",
      "chat widget for small teams",
      "intercom alternative for small teams",
      "chatting vs intercom",
      "live chat for small saas teams",
      "shared inbox for website chat"
    ]));
  });
});
