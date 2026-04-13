const mocks = vi.hoisted(() => ({
  getMiniMaxConfig: vi.fn()
}));

vi.mock("@/lib/env.server", () => ({
  getMiniMaxConfig: mocks.getMiniMaxConfig
}));

import { generateChattingSeoDraft } from "@/lib/chatting-seo-draft-service";

const profile = {
  messaging: {
    positioning: ["Live chat for small teams"],
    bestFit: ["Founder-led teams"],
    contentFit: ["Comparison content"],
    claimsDiscipline: ["No invented claims"]
  },
  ctas: [{ id: "see-pricing", label: "See pricing", href: "/#pricing" }]
} as never;

const planItem = {
  title: "HubSpot chat alternative for small teams",
  target_keyword: "hubspot chat alternative",
  target_publish_at: "2026-04-20T09:00:00.000Z",
  category_slug: "comparisons",
  cta_id: "see-pricing",
  rationale: "High-intent keyword."
} as never;

describe("chatting seo draft service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMiniMaxConfig.mockReturnValue({
      apiKey: "api-key",
      model: "custom-model",
      baseUrl: "https://api.example.com"
    });
  });

  it("parses a minimax article draft response into a blog post", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        base_resp: { status_code: 0 },
        choices: [{ message: { content: '<think>draft</think>{"title":"HubSpot chat alternative for small teams","excerpt":"Excerpt","subtitle":"Subtitle","seoTitle":"SEO Title","intro":"Intro paragraph","summaryBullets":["One","Two"],"sectionTwoTitle":"What matters","sectionTwoParagraphs":["Paragraph one","Paragraph two"],"sectionThreeTitle":"How to compare","sectionThreeBullets":["Point one","Point two"],"bottomLineTitle":"Bottom line","bottomLineParagraphs":["Bottom paragraph"],"faq":[{"question":"Question?","answer":"Answer."}]}' } }]
      })
    }));

    const post = await generateChattingSeoDraft(profile, planItem);

    expect(post.title).toBe("HubSpot chat alternative for small teams");
    expect(post.sections.length).toBe(5);
    expect(post.categorySlug).toBe("comparisons");
    expect(post.sections.at(-2)?.title).toBe("Bottom line");
    expect(post.sections.at(-1)).toMatchObject({
      title: "FAQ",
      blocks: [{ type: "faq", items: [{ question: "Question?", answer: "Answer." }] }]
    });
  });

  it("maps provider and invalid payload failures", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ base_resp: { status_code: 1 } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ base_resp: { status_code: 0 }, choices: [{ message: { content: "{}" } }] }) }));

    await expect(generateChattingSeoDraft(profile, planItem)).rejects.toThrow("CHATTING_SEO_DRAFT_PROVIDER_FAILED");
    await expect(generateChattingSeoDraft(profile, planItem)).rejects.toThrow("INVALID_CHATTING_SEO_DRAFT_RESPONSE");
  });
});
