const mocks = vi.hoisted(() => ({
  getPublicSitePresenceStatus: vi.fn()
}));

vi.mock("@/lib/services/public-sites", () => ({
  getPublicSitePresenceStatus: mocks.getPublicSitePresenceStatus
}));

import { GET } from "./route";
import { OPTIONS } from "./route";

describe("public site-status route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the shared cors preflight response", async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("requires a site id", async () => {
    const response = await GET(new Request("http://localhost/api/public/site-status"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "siteId is required." });
  });

  it("returns a not-found response when the site does not exist", async () => {
    mocks.getPublicSitePresenceStatus.mockResolvedValueOnce(null);

    const response = await GET(new Request("http://localhost/api/public/site-status?siteId=missing"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Site not found." });
  });

  it("returns status without recording widget presence", async () => {
    mocks.getPublicSitePresenceStatus.mockResolvedValueOnce({
      online: true,
      lastSeenAt: "2026-03-29T12:00:00.000Z"
    });

    const response = await GET(new Request("http://localhost/api/public/site-status?siteId=site_123"));

    expect(await response.json()).toEqual({
      ok: true,
      online: true,
      lastSeenAt: "2026-03-29T12:00:00.000Z"
    });
  });

  it("maps unexpected failures to a stable error response", async () => {
    mocks.getPublicSitePresenceStatus.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(new Request("http://localhost/api/public/site-status?siteId=site_123"));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to load site status." });
  });
});
