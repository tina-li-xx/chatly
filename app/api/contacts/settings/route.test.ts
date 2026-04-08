const mocks = vi.hoisted(() => ({
  getDashboardContactSettings: vi.fn(),
  requireJsonRouteUser: vi.fn(),
  updateDashboardContactSettings: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getDashboardContactSettings: mocks.getDashboardContactSettings,
  updateDashboardContactSettings: mocks.updateDashboardContactSettings
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { PATCH } from "./route";

describe("contact settings route", () => {
  it("saves custom fields against the existing workspace settings", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({ user: { id: "user_1" } });
    mocks.getDashboardContactSettings.mockResolvedValueOnce({
      planKey: "growth",
      limits: {
        fullProfiles: true,
        exportEnabled: true,
        apiEnabled: true,
        customStatusesLimit: null,
        customFieldsLimit: null
      },
      settings: {
        statuses: [{ key: "vip", label: "VIP", color: "amber" }],
        customFields: [],
        dataRetention: "forever"
      }
    });
    mocks.updateDashboardContactSettings.mockResolvedValueOnce({
      statuses: [{ key: "vip", label: "VIP", color: "amber" }],
      customFields: [
        {
          id: "field_1",
          key: "plan",
          label: "Plan",
          type: "dropdown",
          options: ["Free", "Pro"],
          prefix: null
        }
      ],
      dataRetention: "forever"
    });

    const response = await PATCH(
      new Request("https://chatting.test/api/contacts/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customFields: [
            {
              id: "field_1",
              key: "plan",
              label: "Plan",
              type: "dropdown",
              options: ["Free", "Pro"],
              prefix: null
            }
          ]
        })
      })
    );

    expect(mocks.updateDashboardContactSettings).toHaveBeenCalledWith("user_1", {
      statuses: [{ key: "vip", label: "VIP", color: "amber" }],
      customFields: [
        {
          id: "field_1",
          key: "plan",
          label: "Plan",
          type: "dropdown",
          options: ["Free", "Pro"],
          prefix: null
        }
      ],
      dataRetention: "forever"
    });
    expect(await response.json()).toEqual({
      ok: true,
      settings: {
        statuses: [{ key: "vip", label: "VIP", color: "amber" }],
        customFields: [
          {
            id: "field_1",
            key: "plan",
            label: "Plan",
            type: "dropdown",
            options: ["Free", "Pro"],
            prefix: null
          }
        ],
        dataRetention: "forever"
      },
      planKey: "growth",
      limits: {
        fullProfiles: true,
        exportEnabled: true,
        apiEnabled: true,
        customStatusesLimit: null,
        customFieldsLimit: null
      }
    });
  });
});
