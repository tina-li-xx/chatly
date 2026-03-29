const mocks = vi.hoisted(() => ({
  analyzeResponseToneWithClaude: vi.fn()
}));

vi.mock("@/lib/response-tone-checker-service", () => ({
  analyzeResponseToneWithClaude: mocks.analyzeResponseToneWithClaude
}));

import { POST } from "./route";

describe("public response tone checker route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns analysis for a valid message", async () => {
    mocks.analyzeResponseToneWithClaude.mockResolvedValueOnce({
      overall_score: 8,
      overall_label: "Good",
      dimensions: {
        friendliness: { score: 8, note: "Warm." },
        professionalism: { score: 7, note: "Clear." },
        empathy: { score: 6, note: "Could be softer." },
        clarity: { score: 9, note: "Easy to follow." },
        helpfulness: { score: 8, note: "Actionable." }
      },
      issues: [],
      strengths: ["Clear next steps"],
      rewritten: "Hi there! Here's what I can do."
    });

    const response = await POST(
      new Request("http://localhost/api/public/response-tone-checker", {
        method: "POST",
        body: JSON.stringify({ message: "Hi there! Here's what I can do for you today.", context: "general" })
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.objectContaining({ ok: true }));
  });

  it("rejects messages that are too short", async () => {
    const response = await POST(
      new Request("http://localhost/api/public/response-tone-checker", {
        method: "POST",
        body: JSON.stringify({ message: "short", context: "general" })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "message_too_short" });
  });

  it("maps provider failures to a stable response", async () => {
    mocks.analyzeResponseToneWithClaude.mockRejectedValueOnce(new Error("RESPONSE_TONE_PROVIDER_FAILED"));

    const response = await POST(
      new Request("http://localhost/api/public/response-tone-checker", {
        method: "POST",
        body: JSON.stringify({ message: "Hi there! Here's what I can do for you today.", context: "general" })
      })
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "response_tone_analysis_failed" });
  });
});
