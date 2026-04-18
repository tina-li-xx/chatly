const mocks = vi.hoisted(() => ({
  getPublicSiteWidgetConfig: vi.fn(),
  publicJsonResponse: vi.fn(),
  publicNoContentResponse: vi.fn()
}));

vi.mock("@/lib/services/public-sites", () => ({
  getPublicSiteWidgetConfig: mocks.getPublicSiteWidgetConfig
}));
vi.mock("@/lib/public-api", () => ({
  publicJsonResponse: mocks.publicJsonResponse,
  publicNoContentResponse: mocks.publicNoContentResponse
}));

import { GET, OPTIONS } from "./route";

describe("public site-config route extra coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.publicJsonResponse.mockImplementation((body: unknown, init?: ResponseInit) => Response.json(body, init));
    mocks.publicNoContentResponse.mockReturnValue(new Response(null, { status: 204 }));
  });

  it("handles OPTIONS, missing site ids, and missing sites", async () => {
    expect((await OPTIONS()).status).toBe(204);
    expect((await GET(new Request("https://chatting.test/api/public/site-config"))).status).toBe(400);

    mocks.getPublicSiteWidgetConfig.mockResolvedValueOnce(null);
    expect((await GET(new Request("https://chatting.test/api/public/site-config?siteId=site_1"))).status).toBe(404);
  });

  it("returns the site config without recording widget presence", async () => {
    mocks.getPublicSiteWidgetConfig.mockResolvedValueOnce({ id: "site_1", name: "Main site" });
    const response = await GET(new Request("https://chatting.test/api/public/site-config?siteId=site_1&pageUrl=%2Fpricing&sessionId=session_1&conversationId=conversation_1&email=hello@example.com"));

    expect(await response.json()).toEqual({ ok: true, site: { id: "site_1", name: "Main site" } });
  });

  it("maps unexpected failures to a stable 500 response", async () => {
    mocks.getPublicSiteWidgetConfig.mockRejectedValueOnce(new Error("boom"));
    const response = await GET(new Request("https://chatting.test/api/public/site-config?siteId=site_1"));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to load site config." });
  });
});
