const mocks = vi.hoisted(() => ({
  getMiniMaxConfig: vi.fn()
}));

vi.mock("@/lib/env.server", () => ({
  getMiniMaxConfig: mocks.getMiniMaxConfig
}));

import { generateChattingSeoAnalysis } from "@/lib/chatting-seo-analysis-service";

const input = {
  productName: "Chatting",
  canonicalUrl: "https://usechatting.com",
  siteTitle: "Live Chat Software for Small Teams | Chatting",
  siteDescription: "Chatting helps small teams talk to visitors.",
  pricingAnchor: "Starts at $20/month",
  positioning: ["Live chat for small teams"],
  founderApprovedClaims: ["Shared inbox"],
  verifiedProductCoverage: ["Visitor tracking"],
  bestFit: ["Founder-led teams"],
  notFit: ["Large enterprise support orgs"],
  contentFit: ["Comparisons"],
  contentMisfit: ["Generic help desk content"],
  competitors: [{ slug: "intercom", name: "Intercom", summary: "Incumbent", points: ["Broader", "Heavier"] }],
  themes: [{ slug: "comparisons", label: "Comparisons", description: "Decision-stage content" }],
  blogPosts: [{ slug: "chatting-vs-intercom", title: "Chatting vs Intercom", seoTitle: "Chatting vs Intercom", categorySlug: "comparisons" }],
  guides: [{ slug: "slack", title: "Slack guide", seoTitle: "Slack guide" }],
  freeTools: [{ slug: "roi", title: "ROI calculator", category: "calculators", seoTitle: "ROI calculator" }],
  candidates: [{ keyword: "hubspot chat alternative", title: "HubSpot chat alternative", themeSlug: "comparisons", intent: "comparison" as const, audienceLabel: "Founder-led SaaS teams", rationale: "Good gap.", priority: 88, source: "seed" as const }]
};

describe("chatting seo analysis service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMiniMaxConfig.mockReturnValue({
      apiKey: "api-key",
      model: "custom-model",
      baseUrl: "https://api.example.com"
    });
  });

  it("sends the minimax request and sanitizes the returned JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        base_resp: { status_code: 0 },
        choices: [{
          message: {
            content:
              '<think>draft</think>{"summary":"A strong opening.","audienceInsights":[{"label":"Founder-led SaaS teams","rationale":"They need faster replies.","opportunity":"hubspot chat alternative"}],"competitorFindings":[{"slug":"intercom","name":"Intercom","coverage":"partial","finding":"Coverage exists but is thin.","opportunity":"Expand the comparison set.","recommendedKeyword":"intercom alternative"}],"keywordOpportunities":[{"keyword":"hubspot chat alternative","title":"HubSpot chat alternative","themeSlug":"comparisons","intent":"comparison","difficulty":"high","audienceLabel":"Founder-led SaaS teams","rationale":"High-intent gap.","priority":88}],"contentGaps":["Comparison coverage is still thin."]}'
          }
        }]
      })
    }));

    const result = await generateChattingSeoAnalysis(input);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://api.example.com/v1/text/chatcompletion_v2",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer api-key" }) })
    );
    expect(result.source).toBe("ai");
    expect(result.researchSource).toBe("fallback");
    expect(result.keywordOpportunities[0]?.keyword).toBe("hubspot chat alternative");
  });

  it("maps provider and parsing failures to explicit errors", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ base_resp: { status_code: 1 } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ base_resp: { status_code: 0 }, choices: [{ message: { content: "{}" } }] }) }));

    await expect(generateChattingSeoAnalysis(input)).rejects.toThrow("CHATTING_SEO_ANALYSIS_PROVIDER_FAILED");
    await expect(generateChattingSeoAnalysis(input)).rejects.toThrow("INVALID_CHATTING_SEO_ANALYSIS_RESPONSE");
  });
});
