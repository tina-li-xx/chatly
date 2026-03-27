const mocks = vi.hoisted(() => ({
  createTeamInvite: vi.fn(),
  listSitesForUser: vi.fn(),
  setUserOnboardingStep: vi.fn(),
  updateSiteOnboardingSetup: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  createTeamInvite: mocks.createTeamInvite,
  listSitesForUser: mocks.listSitesForUser,
  setUserOnboardingStep: mocks.setUserOnboardingStep,
  updateSiteOnboardingSetup: mocks.updateSiteOnboardingSetup
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("onboarding team route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: { id: "user_123", email: "hello@chatly.example", createdAt: "2026-03-27T00:00:00.000Z" }
    });
    mocks.listSitesForUser.mockResolvedValue([
      { id: "site_1", name: "My site" }
    ]);
    mocks.setUserOnboardingStep.mockResolvedValue({
      onboarding_step: "customize",
      onboarding_completed_at: null
    });
  });

  it("updates the site setup, creates invites, and advances onboarding", async () => {
    mocks.updateSiteOnboardingSetup.mockResolvedValueOnce({
      id: "site_1",
      name: "Acme Support",
      domain: "https://acme.com"
    });
    mocks.createTeamInvite
      .mockResolvedValueOnce([{ id: "invite_1", email: "sam@acme.com" }])
      .mockResolvedValueOnce([
        { id: "invite_1", email: "sam@acme.com" },
        { id: "invite_2", email: "lee@acme.com" }
      ]);

    const response = await POST(
      new Request("http://localhost/onboarding/team", {
        method: "POST",
        body: JSON.stringify({
          siteId: "site_1",
          teamName: "Acme Support",
          domain: "https://acme.com",
          inviteEmails: ["sam@acme.com", "lee@acme.com", "sam@acme.com"]
        })
      })
    );

    expect(mocks.updateSiteOnboardingSetup).toHaveBeenCalledWith("site_1", "user_123", {
      name: "Acme Support",
      domain: "https://acme.com"
    });
    expect(mocks.createTeamInvite).toHaveBeenCalledTimes(2);
    expect(mocks.setUserOnboardingStep).toHaveBeenCalledWith("user_123", "customize");
    expect(await response.json()).toEqual({
      ok: true,
      site: {
        id: "site_1",
        name: "Acme Support",
        domain: "https://acme.com"
      },
      invites: [
        { id: "invite_1", email: "sam@acme.com" },
        { id: "invite_2", email: "lee@acme.com" }
      ],
      step: "customize"
    });
  });

  it("maps missing team data to readable errors", async () => {
    mocks.updateSiteOnboardingSetup.mockRejectedValueOnce(new Error("MISSING_DOMAIN"));

    const response = await POST(
      new Request("http://localhost/onboarding/team", {
        method: "POST",
        body: JSON.stringify({
          siteId: "site_1",
          teamName: "Acme Support",
          domain: ""
        })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "missing-domain" });
  });
});
