const mocks = vi.hoisted(() => ({
  extractVisitorMetadata: vi.fn(),
  recordPublicSitePresence: vi.fn()
}));

vi.mock("@/lib/conversation-io", () => ({
  extractVisitorMetadata: mocks.extractVisitorMetadata
}));
vi.mock("@/lib/services/public-sites", () => ({
  recordPublicSitePresence: mocks.recordPublicSitePresence
}));

import { OPTIONS, POST } from "./route";

describe("public site-presence route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.extractVisitorMetadata.mockReturnValue({
      pageUrl: "https://example.com/pricing",
      referrer: "https://google.com",
      userAgent: "Mozilla/5.0",
      country: "GB",
      region: "England",
      city: "London",
      timezone: "Europe/London",
      locale: "en-GB"
    });
  });

  it("returns the shared cors preflight response", async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("requires a site id", async () => {
    const response = await POST(new Request("http://localhost/api/public/site-presence", { method: "POST" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "siteId is required." });
  });

  it("records widget presence from a beacon-style form body", async () => {
    const response = await POST(
      new Request("http://localhost/api/public/site-presence", {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
          "user-agent": "Mozilla/5.0"
        },
        body: new URLSearchParams({
          siteId: "site_123",
          sessionId: "session_123",
          conversationId: "conv_123",
          email: "alex@example.com",
          pageUrl: "https://example.com/pricing",
          referrer: "https://google.com",
          timezone: "Europe/London",
          locale: "en-GB"
        }).toString()
      })
    );

    expect(mocks.recordPublicSitePresence).toHaveBeenCalledWith({
      siteId: "site_123",
      pageUrl: "https://example.com/pricing",
      sessionId: "session_123",
      conversationId: "conv_123",
      email: "alex@example.com",
      referrer: "https://google.com",
      userAgent: "Mozilla/5.0",
      country: "GB",
      region: "England",
      city: "London",
      timezone: "Europe/London",
      locale: "en-GB"
    });
    expect(response.status).toBe(204);
  });

  it("maps unexpected failures to a stable error response", async () => {
    mocks.recordPublicSitePresence.mockRejectedValueOnce(new Error("boom"));

    const response = await POST(
      new Request("http://localhost/api/public/site-presence", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ siteId: "site_123" })
      })
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to record site presence." });
  });
});
