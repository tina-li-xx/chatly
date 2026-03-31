const mocks = vi.hoisted(() => ({
  createTeamInvite: vi.fn(),
  listSitesForUser: vi.fn(),
  requireJsonRouteUser: vi.fn(),
  setUserOnboardingStep: vi.fn(),
  updateSiteOnboardingSetup: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  createTeamInvite: mocks.createTeamInvite,
  listSitesForUser: mocks.listSitesForUser,
  setUserOnboardingStep: mocks.setUserOnboardingStep,
  updateSiteOnboardingSetup: mocks.updateSiteOnboardingSetup
}));
vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) => Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) => Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("onboarding team route extra coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireJsonRouteUser.mockResolvedValue({ user: { id: "user_1" } });
    mocks.listSitesForUser.mockResolvedValue([{ id: "site_1" }, { id: "site_2" }]);
    mocks.updateSiteOnboardingSetup.mockResolvedValue({ id: "site_1", name: "Support" });
    mocks.createTeamInvite.mockResolvedValue([{ id: "invite_1", email: "one@example.com" }]);
  });

  it("returns auth responses and site-not-found cases", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });
    expect((await POST(new Request("https://chatting.test", { method: "POST", body: "{}" }))).status).toBe(401);

    mocks.listSitesForUser.mockResolvedValueOnce([]);
    const noSite = await POST(new Request("https://chatting.test", { method: "POST", body: JSON.stringify({}) }));
    expect(noSite.status).toBe(404);

    mocks.updateSiteOnboardingSetup.mockResolvedValueOnce(null);
    const missingUpdated = await POST(new Request("https://chatting.test", { method: "POST", body: JSON.stringify({}) }));
    expect(missingUpdated.status).toBe(404);
  });

  it("normalizes invite emails and advances onboarding", async () => {
    const response = await POST(new Request("https://chatting.test", {
      method: "POST",
      body: JSON.stringify({
        siteId: "site_2",
        teamName: "Support",
        domain: "usechatting.com",
        inviteEmails: [" One@Example.com ", "one@example.com", "", "two@example.com"]
      })
    }));

    expect(mocks.updateSiteOnboardingSetup).toHaveBeenCalledWith("site_2", "user_1", { name: "Support", domain: "usechatting.com" });
    expect(mocks.createTeamInvite).toHaveBeenNthCalledWith(1, expect.objectContaining({ email: "one@example.com" }));
    expect(mocks.createTeamInvite).toHaveBeenNthCalledWith(2, expect.objectContaining({ email: "two@example.com" }));
    expect(mocks.setUserOnboardingStep).toHaveBeenCalledWith("user_1", "customize");
    expect((await response.json()).step).toBe("customize");
  });

  it("maps validation and unexpected failures", async () => {
    mocks.updateSiteOnboardingSetup.mockRejectedValueOnce(new Error("MISSING_SITE_NAME"));
    expect((await POST(new Request("https://chatting.test", { method: "POST", body: "{}" }))).status).toBe(400);

    mocks.updateSiteOnboardingSetup.mockRejectedValueOnce(new Error("MISSING_DOMAIN"));
    expect((await POST(new Request("https://chatting.test", { method: "POST", body: "{}" }))).status).toBe(400);

    mocks.createTeamInvite.mockRejectedValueOnce(new Error("MISSING_EMAIL"));
    expect((await POST(new Request("https://chatting.test", { method: "POST", body: JSON.stringify({ inviteEmails: ["one@example.com"] }) }))).status).toBe(400);

    mocks.updateSiteOnboardingSetup.mockRejectedValueOnce(new Error("kaboom"));
    expect((await POST(new Request("https://chatting.test", { method: "POST", body: "{}" }))).status).toBe(500);
  });
});
