const mocks = vi.hoisted(() => ({
  getSiteByPublicId: vi.fn(),
  markSiteWidgetInstallVerified: vi.fn(),
  verifySiteWidgetSnippet: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getSiteByPublicId: mocks.getSiteByPublicId,
  markSiteWidgetInstallVerified: mocks.markSiteWidgetInstallVerified
}));

vi.mock("@/lib/site-installation-verifier", () => ({
  verifySiteWidgetSnippet: mocks.verifySiteWidgetSnippet
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("dashboard verify-installation route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: { id: "user_123", email: "hello@chatly.example", createdAt: "2026-03-27T00:00:00.000Z" }
    });
  });

  it("requires a site id", async () => {
    const response = await POST(
      new Request("http://localhost/dashboard/sites/verify-installation", {
        method: "POST",
        body: JSON.stringify({})
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "site-id-missing" });
  });

  it("rejects sites not owned by the current user", async () => {
    mocks.getSiteByPublicId.mockResolvedValueOnce({
      id: "site_db",
      userId: "other_user",
      domain: "https://chatly.example"
    });

    const response = await POST(
      new Request("http://localhost/dashboard/sites/verify-installation", {
        method: "POST",
        body: JSON.stringify({ siteId: "site_public" })
      })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "site-not-found" });
  });

  it("returns detected false when the snippet is not found", async () => {
    mocks.getSiteByPublicId.mockResolvedValueOnce({
      id: "site_db",
      userId: "user_123",
      domain: "https://chatly.example"
    });
    mocks.verifySiteWidgetSnippet.mockResolvedValueOnce({
      ok: false,
      error: "not-found"
    });

    const response = await POST(
      new Request("http://localhost/dashboard/sites/verify-installation", {
        method: "POST",
        body: JSON.stringify({ siteId: "site_public" })
      })
    );

    expect(await response.json()).toEqual({
      ok: true,
      detected: false,
      error: "not-found",
      site: {
        id: "site_db",
        userId: "user_123",
        domain: "https://chatly.example"
      }
    });
  });

  it("marks sites verified when the snippet is detected", async () => {
    mocks.getSiteByPublicId.mockResolvedValueOnce({
      id: "site_db",
      userId: "user_123",
      domain: "https://chatly.example"
    });
    mocks.verifySiteWidgetSnippet.mockResolvedValueOnce({
      ok: true,
      url: "https://chatly.example"
    });
    mocks.markSiteWidgetInstallVerified.mockResolvedValueOnce({
      id: "site_db",
      widgetInstallVerifiedAt: "2026-03-27T12:00:00.000Z"
    });

    const response = await POST(
      new Request("http://localhost/dashboard/sites/verify-installation", {
        method: "POST",
        body: JSON.stringify({ siteId: "site_public" })
      })
    );

    expect(mocks.markSiteWidgetInstallVerified).toHaveBeenCalledWith("site_db", "user_123", "https://chatly.example");
    expect(await response.json()).toEqual({
      ok: true,
      detected: true,
      checkedUrl: "https://chatly.example",
      site: {
        id: "site_db",
        widgetInstallVerifiedAt: "2026-03-27T12:00:00.000Z"
      }
    });
  });
});
