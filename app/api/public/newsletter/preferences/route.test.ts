const mocks = vi.hoisted(() => ({
  updateNewsletterPreferencesByToken: vi.fn()
}));

vi.mock("@/lib/data/newsletter", () => ({
  updateNewsletterPreferencesByToken: mocks.updateNewsletterPreferencesByToken
}));

import { POST } from "./route";

describe("public newsletter preferences route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates subscriber preferences for a valid token", async () => {
    mocks.updateNewsletterPreferencesByToken.mockResolvedValueOnce({
      email: "hello@example.com",
      subscribed: false
    });

    const response = await POST(
      new Request("http://localhost/api/public/newsletter/preferences", {
        method: "POST",
        body: JSON.stringify({ token: "token_123", subscribed: false })
      })
    );

    expect(mocks.updateNewsletterPreferencesByToken).toHaveBeenCalledWith({
      token: "token_123",
      subscribed: false
    });
    expect(await response.json()).toEqual({
      ok: true,
      email: "hello@example.com",
      subscribed: false
    });
  });

  it("rejects invalid payloads and invalid tokens", async () => {
    const badPayload = await POST(
      new Request("http://localhost/api/public/newsletter/preferences", {
        method: "POST",
        body: JSON.stringify({ token: "token_123" })
      })
    );

    mocks.updateNewsletterPreferencesByToken.mockRejectedValueOnce(
      new Error("INVALID_NEWSLETTER_PREFERENCES_TOKEN")
    );
    const invalidToken = await POST(
      new Request("http://localhost/api/public/newsletter/preferences", {
        method: "POST",
        body: JSON.stringify({ token: "bad", subscribed: true })
      })
    );

    expect(badPayload.status).toBe(400);
    expect(await badPayload.json()).toEqual({ error: "invalid_preferences_request" });
    expect(invalidToken.status).toBe(404);
    expect(await invalidToken.json()).toEqual({ error: "invalid_preferences_token" });
  });
});
