const mocks = vi.hoisted(() => ({
  updateDashboardSettings: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  updateDashboardSettings: mocks.updateDashboardSettings
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("dashboard settings update route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: { id: "user_123", email: "hello@chatly.example", createdAt: "2026-03-27T00:00:00.000Z" }
    });
  });

  it("saves profile, notification, email, and password payloads", async () => {
    mocks.updateDashboardSettings.mockResolvedValueOnce({ profile: { firstName: "Tina" }, teamName: "Chatting Team" });

    const response = await POST(
      new Request("http://localhost/dashboard/settings/update", {
        method: "POST",
        body: JSON.stringify({
          profile: { firstName: "Tina" },
          teamName: "Chatting Team",
          notifications: { browserNotifications: true },
          email: { notificationEmail: "team@example.com" },
          reports: { weeklyReportEnabled: true, weeklyReportSendTime: "09:30" },
          automation: { offline: { autoReplyEnabled: true } },
          password: null
        })
      })
    );

    expect(mocks.updateDashboardSettings).toHaveBeenCalledWith("user_123", {
      profile: { firstName: "Tina" },
      teamName: "Chatting Team",
      notifications: { browserNotifications: true },
      email: { notificationEmail: "team@example.com" },
      reports: { weeklyReportEnabled: true, weeklyReportSendTime: "09:30" },
      automation: { offline: { autoReplyEnabled: true } },
      password: null
    });
    expect(await response.json()).toEqual({
      ok: true,
      settings: { profile: { firstName: "Tina" }, teamName: "Chatting Team" }
    });
  });

  it("maps validation errors into 400 responses", async () => {
    mocks.updateDashboardSettings.mockRejectedValueOnce(new Error("MISSING_TEAM_NAME"));

    const response = await POST(
      new Request("http://localhost/dashboard/settings/update", {
        method: "POST",
        body: JSON.stringify({})
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "missing_team_name" });
  });

  it("maps unexpected failures to a generic server error", async () => {
    mocks.updateDashboardSettings.mockRejectedValueOnce(new Error("kaboom"));

    const response = await POST(
      new Request("http://localhost/dashboard/settings/update", {
        method: "POST",
        body: JSON.stringify({})
      })
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ ok: false, error: "settings-save-failed" });
  });
});
