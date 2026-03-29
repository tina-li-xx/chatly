const mocks = vi.hoisted(() => ({
  requestDashboardTrialExtension: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  requestDashboardTrialExtension: mocks.requestDashboardTrialExtension
}));

vi.mock("@/lib/route-helpers", async () => ({
  jsonError: (error: string, status: number) => Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) => Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("billing trial extension route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@chatly.example",
        createdAt: "2026-03-27T00:00:00.000Z",
        workspaceOwnerId: "owner_123",
        workspaceRole: "admin"
      }
    });
  });

  it("returns extended billing summaries", async () => {
    mocks.requestDashboardTrialExtension.mockResolvedValueOnce({
      billing: {
        planKey: "growth",
        trialEndsAt: "April 12, 2026"
      },
      outreachQueued: true
    });

    const response = await POST();

    expect(await response.json()).toEqual({
      ok: true,
      billing: {
        planKey: "growth",
        trialEndsAt: "April 12, 2026"
      },
      outreachQueued: true
    });
  });

  it("maps unavailable trial extensions", async () => {
    mocks.requestDashboardTrialExtension.mockRejectedValueOnce(new Error("TRIAL_EXTENSION_UNAVAILABLE"));

    const response = await POST();

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      ok: false,
      error: "trial_extension_unavailable"
    });
  });

  it("blocks members from requesting trial extensions", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      user: {
        id: "user_123",
        email: "hello@chatly.example",
        createdAt: "2026-03-27T00:00:00.000Z",
        workspaceOwnerId: "owner_123",
        workspaceRole: "member"
      }
    });

    const response = await POST();
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false, error: "forbidden" });
  });
});
