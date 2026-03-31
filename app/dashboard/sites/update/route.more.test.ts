const mocks = vi.hoisted(() => ({
  findBillingAccountRow: vi.fn(),
  updateSiteWidgetSettings: vi.fn(),
  updateSiteWidgetTitle: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  updateSiteWidgetSettings: mocks.updateSiteWidgetSettings,
  updateSiteWidgetTitle: mocks.updateSiteWidgetTitle
}));
vi.mock("@/lib/repositories/billing-repository", () => ({ findBillingAccountRow: mocks.findBillingAccountRow }));
vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) => Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) => Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("dashboard sites update route edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: { id: "user_123", email: "hello@example.com", createdAt: "2026-03-27T00:00:00.000Z" }
    });
    mocks.findBillingAccountRow.mockResolvedValue({ plan_key: "starter" });
  });

  it("returns the auth response when the request is not authorized", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "unauthorized" }, { status: 401 })
    });

    const response = await POST(new Request("http://localhost/dashboard/sites/update", { method: "POST" }));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false, error: "unauthorized" });
  });

  it("falls back to safe widget settings defaults", async () => {
    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set(
      "settings",
      JSON.stringify({
        domain: "example.com/",
        launcherPosition: "center",
        avatarStyle: "emoji",
        responseTimeMode: "weeks",
        autoOpenPaths: "bad",
        offlineTitle: 42,
        awayMessage: false,
        operatingHoursEnabled: 0,
        operatingHours: "bad"
      })
    );
    mocks.updateSiteWidgetSettings.mockResolvedValueOnce({ id: "site_1", widgetTitle: "Support" });

    await POST(new Request("http://localhost/dashboard/sites/update", { method: "POST", body: formData }));

    expect(mocks.updateSiteWidgetSettings).toHaveBeenCalledWith(
      "site_1",
      "user_123",
      expect.objectContaining({
        domain: "example.com",
        launcherPosition: "right",
        avatarStyle: "initials",
        offlineTitle: "42",
        awayMessage: "false",
        autoOpenPaths: [],
        responseTimeMode: "minutes",
        operatingHoursEnabled: false
      })
    );
  });

  it("returns not found when the settings update cannot find the site", async () => {
    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set("settings", JSON.stringify({ domain: "https://example.com" }));
    mocks.updateSiteWidgetSettings.mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost/dashboard/sites/update", { method: "POST", body: formData })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "site-not-found" });
  });

  it("returns not found when the title update cannot find the site", async () => {
    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set("widgetTitle", "Support");
    mocks.updateSiteWidgetTitle.mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost/dashboard/sites/update", { method: "POST", body: formData })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "site-not-found" });
  });
});
