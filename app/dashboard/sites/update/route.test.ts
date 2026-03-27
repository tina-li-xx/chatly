const mocks = vi.hoisted(() => ({
  updateSiteWidgetSettings: vi.fn(),
  updateSiteWidgetTitle: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  updateSiteWidgetSettings: mocks.updateSiteWidgetSettings,
  updateSiteWidgetTitle: mocks.updateSiteWidgetTitle
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("dashboard sites update route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: { id: "user_123", email: "hello@chatly.example", createdAt: "2026-03-27T00:00:00.000Z" }
    });
  });

  it("requires a site id", async () => {
    const response = await POST(
      new Request("http://localhost/dashboard/sites/update", {
        method: "POST",
        body: new FormData()
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "site-id-missing" });
  });

  it("normalizes widget settings before saving them", async () => {
    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set(
      "settings",
      JSON.stringify({
        domain: "https://example.com/pricing/",
        brandColor: "#2563EB",
        widgetTitle: "Chatting Team",
        greetingText: "Hi",
        launcherPosition: "left",
        avatarStyle: "photos",
        showOnlineStatus: true,
        requireEmailOffline: true,
        soundNotifications: false,
        autoOpenPaths: ["/pricing"],
        responseTimeMode: "hours",
        operatingHoursEnabled: true,
        operatingHoursTimezone: "Europe/London",
        operatingHours: {
          monday: { enabled: true, from: "09:00", to: "17:00" }
        }
      })
    );
    mocks.updateSiteWidgetSettings.mockResolvedValueOnce({
      widgetTitle: "Chatting Team",
      id: "site_1"
    });

    const response = await POST(
      new Request("http://localhost/dashboard/sites/update", { method: "POST", body: formData })
    );

    expect(mocks.updateSiteWidgetSettings).toHaveBeenCalledWith(
      "site_1",
      "user_123",
      expect.objectContaining({
        domain: "https://example.com/pricing",
        brandColor: "#2563EB",
        launcherPosition: "left",
        avatarStyle: "photos",
        autoOpenPaths: ["/pricing"],
        responseTimeMode: "hours"
      })
    );
    expect(await response.json()).toEqual({
      ok: true,
      siteId: "site_1",
      widgetTitle: "Chatting Team",
      site: {
        widgetTitle: "Chatting Team",
        id: "site_1"
      }
    });
  });

  it("rejects invalid settings payloads", async () => {
    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set("settings", "{not json");

    const response = await POST(
      new Request("http://localhost/dashboard/sites/update", { method: "POST", body: formData })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "invalid-settings" });
  });

  it("requires a site url in widget settings payloads", async () => {
    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set(
      "settings",
      JSON.stringify({
        domain: "",
        brandColor: "#2563EB",
        widgetTitle: "Chatting Team",
        greetingText: "Hi"
      })
    );

    const response = await POST(
      new Request("http://localhost/dashboard/sites/update", { method: "POST", body: formData })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "site-domain-required" });
  });

  it("falls back to title updates when no settings payload is provided", async () => {
    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set("widgetTitle", "Support");
    mocks.updateSiteWidgetTitle.mockResolvedValueOnce("Support");

    const response = await POST(
      new Request("http://localhost/dashboard/sites/update", { method: "POST", body: formData })
    );

    expect(mocks.updateSiteWidgetTitle).toHaveBeenCalledWith("site_1", "Support", "user_123");
    expect(await response.json()).toEqual({
      ok: true,
      siteId: "site_1",
      widgetTitle: "Support"
    });
  });
});
