const mocks = vi.hoisted(() => ({
  getSiteWidgetConfig: vi.fn(),
  recordSiteWidgetSeen: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getSiteWidgetConfig: mocks.getSiteWidgetConfig,
  recordSiteWidgetSeen: mocks.recordSiteWidgetSeen
}));

import { GET } from "./route";

describe("public site-config route", () => {
  it("requires a site id", async () => {
    const response = await GET(new Request("http://localhost/api/public/site-config"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "siteId is required." });
  });

  it("returns the widget config including free-plan branding fields", async () => {
    mocks.getSiteWidgetConfig.mockResolvedValueOnce({
      id: "site_123",
      widgetTitle: "Talk to the team",
      autoOpenPaths: [],
      proactivePrompts: [
        {
          id: "prompt_1",
          pagePath: "/pricing",
          message: "Need help choosing a plan?",
          delaySeconds: 30,
          autoOpenWidget: true
        }
      ],
      showBranding: true,
      brandingLabel: "Powered by Chatting",
      brandingUrl: "https://chatly.example"
    });

    const response = await GET(
      new Request(
        "http://localhost/api/public/site-config?siteId=site_123&pageUrl=https://example.com/pricing&sessionId=session_123&conversationId=conv_123&email=alex%40example.com&referrer=https%3A%2F%2Fgoogle.com&timezone=Europe%2FLondon&locale=en-GB",
        {
          headers: {
            "user-agent": "Mozilla/5.0"
          }
        }
      )
    );

    expect(mocks.recordSiteWidgetSeen).toHaveBeenCalledWith({
      siteId: "site_123",
      pageUrl: "https://example.com/pricing",
      sessionId: "session_123",
      conversationId: "conv_123",
      email: "alex@example.com",
      referrer: "https://google.com",
      userAgent: "Mozilla/5.0",
      country: null,
      region: null,
      city: null,
      timezone: "Europe/London",
      locale: "en-GB"
    });
    expect(await response.json()).toEqual({
      ok: true,
      site: {
        id: "site_123",
        widgetTitle: "Talk to the team",
        autoOpenPaths: [],
        proactivePrompts: [
          {
            id: "prompt_1",
            pagePath: "/pricing",
            message: "Need help choosing a plan?",
            delaySeconds: 30,
            autoOpenWidget: true
          }
        ],
        showBranding: true,
        brandingLabel: "Powered by Chatting",
        brandingUrl: "https://chatly.example"
      }
    });
  });
});
