const mocks = vi.hoisted(() => ({
  getMiniMaxConfig: vi.fn()
}));

vi.mock("@/lib/env.server", () => ({
  getMiniMaxConfig: mocks.getMiniMaxConfig
}));

import { generateChattingSeoPlan } from "@/lib/chatting-seo-plan-service";

const profile = {
  contentInventory: {
    blogCategories: [{ slug: "comparisons" }, { slug: "conversion" }],
  },
  ctas: [{ id: "see-pricing" }, { id: "read-guides" }],
  messaging: {
    positioning: ["Live chat for small teams"],
    bestFit: ["Founder-led teams"],
    contentFit: ["Comparison and conversion content"],
    claimsDiscipline: ["No invented claims"]
  }
} as never;

const analysis = {
  source: "fallback",
  researchSource: "live",
  generatedAt: "2026-04-12T09:00:00.000Z",
  summary: "Strong buyer-intent opening.",
  audienceInsights: [],
  competitorFindings: [],
  keywordOpportunities: [],
  contentGaps: []
} as const;

function buildPayload() {
  return {
    summary: "Thirty days focused on comparison and conversion demand.",
    items: Array.from({ length: 30 }, (_, index) => ({
      title: `Plan item ${index + 1}`,
      targetKeyword: `keyword ${index + 1}`,
      searchIntent: index % 2 === 0 ? "comparison" : "commercial",
      personaSlug: "founders",
      themeSlug: index % 2 === 0 ? "comparisons" : "conversion",
      categorySlug: index % 2 === 0 ? "comparisons" : "conversion",
      ctaId: "see-pricing",
      priorityScore: 100 - index,
      rationale: `Why this keyword matters ${index + 1}`
    }))
  };
}

describe("chatting seo plan service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMiniMaxConfig.mockReturnValue({
      apiKey: "api-key",
      model: "custom-model",
      baseUrl: "https://api.example.com"
    });
  });

  it("parses a 30-item plan response from minimax", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        base_resp: { status_code: 0 },
        choices: [{ message: { content: `<think>draft</think>${JSON.stringify(buildPayload())}` } }]
      })
    }));

    const result = await generateChattingSeoPlan(profile, analysis);

    expect(result.source).toBe("ai");
    expect(result.items).toHaveLength(30);
    expect(result.items[0]?.targetKeyword).toBe("keyword 1");
    expect(result.items[0]?.notes).toContain("stored external keyword corpus");
  });

  it("maps provider and invalid payload failures", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ base_resp: { status_code: 1 } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ base_resp: { status_code: 0 }, choices: [{ message: { content: "{}" } }] }) }));

    await expect(generateChattingSeoPlan(profile, analysis)).rejects.toThrow("CHATTING_SEO_PLAN_PROVIDER_FAILED");
    await expect(generateChattingSeoPlan(profile, analysis)).rejects.toThrow("INVALID_CHATTING_SEO_PLAN_RESPONSE");
  });
});
