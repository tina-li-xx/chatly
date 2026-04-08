const mocks = vi.hoisted(() => ({
  deleteDashboardContact: vi.fn(),
  getDashboardContact: vi.fn(),
  getDashboardContactSettings: vi.fn(),
  requireJsonRouteUser: vi.fn(),
  updateDashboardContact: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  deleteDashboardContact: mocks.deleteDashboardContact,
  getDashboardContact: mocks.getDashboardContact,
  getDashboardContactSettings: mocks.getDashboardContactSettings,
  updateDashboardContact: mocks.updateDashboardContact
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { GET } from "./route";

describe("contact detail route", () => {
  it("returns the auth response when the request is not authorized", async () => {
    const response = Response.json({ ok: false }, { status: 401 });
    mocks.requireJsonRouteUser.mockResolvedValueOnce({ response });

    await expect(GET(new Request("https://chatting.test/api/contacts/contact_1"), {
      params: Promise.resolve({ id: "contact_1" })
    })).resolves.toBe(response);
  });

  it("returns the contact without loading settings by default", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({ user: { id: "user_1" } });
    mocks.getDashboardContact.mockResolvedValueOnce({
      id: "contact_1",
      siteId: "site_1",
      siteName: "Chatting",
      email: "tina@letterflow.so",
      name: "Tina",
      phone: null,
      company: "Letterflow",
      role: null,
      avatarUrl: null,
      status: "customer",
      tags: ["enterprise"],
      customFields: {},
      firstSeenAt: "2026-04-01T10:00:00.000Z",
      lastSeenAt: "2026-04-05T10:00:00.000Z",
      totalVisits: 1,
      totalPageViews: 2,
      conversationCount: 3,
      avgSessionSeconds: 120,
      location: { city: null, region: null, country: null },
      source: {
        firstLandingPage: "/pricing",
        referrer: "google.com",
        utmSource: "google",
        utmMedium: "organic",
        utmCampaign: null
      },
      latestConversationId: "conv_1",
      latestSessionId: "session_1",
      notes: [],
      pageHistory: [],
      conversations: []
    });
    mocks.getDashboardContactSettings.mockResolvedValueOnce({
      settings: {
        statuses: [{ key: "customer", label: "Customer", color: "green" }],
        customFields: []
      }
    });

    const response = await GET(new Request("https://chatting.test/api/contacts/contact_1"), {
      params: Promise.resolve({ id: "contact_1" })
    });

    expect(mocks.getDashboardContact).toHaveBeenCalledWith("user_1", "contact_1");
    expect(mocks.getDashboardContactSettings).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({
      ok: true,
      contact: expect.objectContaining({
        id: "contact_1",
        email: "tina@letterflow.so"
      })
    });
  });

  it("returns settings when explicitly requested", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({ user: { id: "user_1" } });
    mocks.getDashboardContact.mockResolvedValueOnce({
      id: "contact_1",
      email: "tina@letterflow.so"
    });
    mocks.getDashboardContactSettings.mockResolvedValueOnce({
      settings: {
        statuses: [{ key: "customer", label: "Customer", color: "green" }],
        customFields: []
      }
    });

    const response = await GET(new Request("https://chatting.test/api/contacts/contact_1?includeSettings=1"), {
      params: Promise.resolve({ id: "contact_1" })
    });

    expect(mocks.getDashboardContactSettings).toHaveBeenCalledWith("user_1");
    expect(await response.json()).toEqual({
      ok: true,
      contact: { id: "contact_1", email: "tina@letterflow.so" },
      settings: {
        statuses: [{ key: "customer", label: "Customer", color: "green" }],
        customFields: []
      }
    });
  });
});
