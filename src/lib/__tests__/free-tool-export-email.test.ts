const mocks = vi.hoisted(() => ({
  buildAbsoluteUrl: vi.fn((value: string) => `https://usechatting.com${value}`),
  sendRichEmail: vi.fn(),
  getFreeToolBySlug: vi.fn((slug: string) => ({
    slug,
    href: `/${slug}`,
    title: slug.replace(/-/g, " ")
  }))
}));

vi.mock("@/lib/blog-utils", () => ({ buildAbsoluteUrl: mocks.buildAbsoluteUrl }));
vi.mock("@/lib/email", () => ({ sendRichEmail: mocks.sendRichEmail }));
vi.mock("@/lib/free-tools-data", () => ({ getFreeToolBySlug: mocks.getFreeToolBySlug }));

import { isSupportedFreeToolExportSlug, sendFreeToolExportEmail } from "@/lib/free-tool-export-email";

describe("free tool export email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("recognizes supported export slugs", () => {
    expect(isSupportedFreeToolExportSlug("live-chat-roi-calculator")).toBe(true);
    expect(isSupportedFreeToolExportSlug("not-real")).toBe(false);
  });

  it("builds exports for each supported tool", async () => {
    await sendFreeToolExportEmail({
      email: "alex@example.com",
      toolSlug: "live-chat-roi-calculator",
      resultPayload: { monthlyVisitors: 1000, conversionRate: 0.12, averageOrderValue: 500, result: { annualRevenueLift: 24000, monthlyRevenueLift: 2000, newConversionRate: 0.18, roiPercent: 320 } }
    });
    await sendFreeToolExportEmail({
      email: "alex@example.com",
      toolSlug: "response-time-calculator",
      resultPayload: { industryLabel: "SaaS", result: { responseTimeMinutes: 10, teamSize: 3, grade: "A", summary: "Fast", averageBenchmark: 45, topPerformerBenchmark: 5, tips: ["Keep it up"] } }
    });
    await sendFreeToolExportEmail({
      email: "alex@example.com",
      toolSlug: "welcome-message-generator",
      resultPayload: { scenarioLabel: "Pricing page", toneLabel: "Warm", variants: [{ label: "Default", message: "Hi there" }] }
    });
    await sendFreeToolExportEmail({
      email: "alex@example.com",
      toolSlug: "response-tone-checker",
      resultPayload: { contextLabel: "Support", message: "We can help", analysis: { overall_score: 8, overall_label: "Good", dimensions: { friendliness: { score: 8 } }, issues: [{ text: "No empathy", suggestion: "Acknowledge concern" }], strengths: ["Clear"], rewritten: "Happy to help" } }
    });

    expect(mocks.sendRichEmail).toHaveBeenCalledTimes(4);
    expect(mocks.sendRichEmail.mock.calls[0]?.[0]).toEqual(expect.objectContaining({ subject: "Your live chat roi calculator report" }));
    expect(mocks.sendRichEmail.mock.calls[1]?.[0].bodyText).toContain("Industry: SaaS");
    expect(mocks.sendRichEmail.mock.calls[2]?.[0].bodyHtml).toContain("max-width:600px");
    expect(mocks.sendRichEmail.mock.calls[2]?.[0].bodyHtml).toContain("Open the tool again");
    expect(mocks.sendRichEmail.mock.calls[3]?.[0].bodyText).toContain("Rewrite: Happy to help");
    expect(mocks.sendRichEmail.mock.calls[3]?.[0].bodyHtml).toContain("A text export is attached to this email.");
    expect(mocks.sendRichEmail.mock.calls[3]?.[0].bodyHtml).toContain("hyphens:none");
  });

  it("rejects unsupported export slugs", async () => {
    mocks.getFreeToolBySlug.mockReturnValueOnce(null);
    await expect(
      sendFreeToolExportEmail({ email: "alex@example.com", toolSlug: "unknown", resultPayload: {} })
    ).rejects.toThrow("UNSUPPORTED_TOOL_EXPORT");
  });
});
