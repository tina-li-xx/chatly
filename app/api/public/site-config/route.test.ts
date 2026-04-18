const mocks = vi.hoisted(() => ({
  getPublicSiteWidgetConfig: vi.fn()
}));

vi.mock("@/lib/services/public-sites", () => ({
  getPublicSiteWidgetConfig: mocks.getPublicSiteWidgetConfig
}));

import { GET } from "./route";

describe("public site-config route", () => {
  it("requires a site id", async () => {
    const response = await GET(new Request("http://localhost/api/public/site-config"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "siteId is required." });
  });

  it("returns the widget config including free-plan branding fields", async () => {
    mocks.getPublicSiteWidgetConfig.mockResolvedValueOnce({
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
      brandingUrl: "https://chatting.example"
    });

    const response = await GET(new Request("http://localhost/api/public/site-config?siteId=site_123"));

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
        brandingUrl: "https://chatting.example"
      }
    });
    expect(response.headers.get("cache-control")).toBe("public, max-age=60, stale-while-revalidate=300");
  });
});
