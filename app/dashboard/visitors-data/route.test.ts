const mocks = vi.hoisted(() => ({
  listVisitorsPageConversationSummaries: vi.fn(),
  listVisitorPresenceSessions: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/services", () => ({
  listVisitorsPageConversationSummaries: mocks.listVisitorsPageConversationSummaries,
  listVisitorPresenceSessions: mocks.listVisitorPresenceSessions
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { GET } from "./route";

describe("dashboard visitors-data route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: { id: "user_123", email: "hello@chatting.example", createdAt: "2026-03-27T00:00:00.000Z" }
    });
  });

  it("returns auth responses directly", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("returns conversations and live visitor sessions", async () => {
    mocks.listVisitorsPageConversationSummaries.mockResolvedValueOnce([{ id: "conv_1" }]);
    mocks.listVisitorPresenceSessions.mockResolvedValueOnce([{ siteId: "site_1", sessionId: "session_1" }]);

    const response = await GET();

    expect(mocks.listVisitorsPageConversationSummaries).toHaveBeenCalledWith("user_123");
    expect(mocks.listVisitorPresenceSessions).toHaveBeenCalledWith("user_123");
    expect(await response.json()).toEqual({
      ok: true,
      conversations: [{ id: "conv_1" }],
      liveSessions: [{ siteId: "site_1", sessionId: "session_1" }]
    });
  });
});
