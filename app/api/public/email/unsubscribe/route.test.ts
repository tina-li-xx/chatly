const mocks = vi.hoisted(() => ({
  updateEmailUnsubscribePreferencesByToken: vi.fn()
}));

vi.mock("@/lib/email-unsubscribe", () => ({
  updateEmailUnsubscribePreferencesByToken: mocks.updateEmailUnsubscribePreferencesByToken
}));

import { POST } from "./route";

describe("public email unsubscribe route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates preferences for a valid token", async () => {
    mocks.updateEmailUnsubscribePreferencesByToken.mockResolvedValueOnce({
      email: "hello@example.com",
      subscribed: false
    });

    const response = await POST(
      new Request("http://localhost/api/public/email/unsubscribe", {
        method: "POST",
        body: JSON.stringify({ token: "token_123", subscribed: false })
      })
    );

    expect(mocks.updateEmailUnsubscribePreferencesByToken).toHaveBeenCalledWith({
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
      new Request("http://localhost/api/public/email/unsubscribe", {
        method: "POST",
        body: JSON.stringify({ token: "token_123" })
      })
    );

    mocks.updateEmailUnsubscribePreferencesByToken.mockRejectedValueOnce(
      new Error("INVALID_EMAIL_UNSUBSCRIBE_TOKEN")
    );
    const invalidToken = await POST(
      new Request("http://localhost/api/public/email/unsubscribe", {
        method: "POST",
        body: JSON.stringify({ token: "bad", subscribed: true })
      })
    );

    expect(badPayload.status).toBe(400);
    expect(await badPayload.json()).toEqual({ error: "invalid_unsubscribe_request" });
    expect(invalidToken.status).toBe(404);
    expect(await invalidToken.json()).toEqual({ error: "invalid_unsubscribe_token" });
  });
});
