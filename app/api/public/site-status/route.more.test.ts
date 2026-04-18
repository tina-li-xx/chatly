const mocks = vi.hoisted(() => ({
  getPublicSitePresenceStatus: vi.fn()
}));

vi.mock("@/lib/services/public-sites", () => ({
  getPublicSitePresenceStatus: mocks.getPublicSitePresenceStatus
}));

import { GET } from "./route";

describe("public site-status route more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns optional status fields when they are absent", async () => {
    mocks.getPublicSitePresenceStatus.mockResolvedValueOnce({ online: false, lastSeenAt: null });

    const response = await GET(new Request("http://localhost/api/public/site-status?siteId=site_123"));

    expect(await response.json()).toEqual({ ok: true, online: false, lastSeenAt: null });
  });

  it("returns a stable 500 when loading site status fails", async () => {
    mocks.getPublicSitePresenceStatus.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(new Request("http://localhost/api/public/site-status?siteId=site_123"));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to load site status." });
  });
});
