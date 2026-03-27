const mocks = vi.hoisted(() => ({
  listConversationSummaries: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  listConversationSummaries: mocks.listConversationSummaries
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { GET } from "./route";

describe("dashboard conversations route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: { id: "user_123", email: "hello@chatly.example", createdAt: "2026-03-27T00:00:00.000Z" }
    });
  });

  it("returns auth responses directly", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("returns conversation summaries for the current user", async () => {
    mocks.listConversationSummaries.mockResolvedValueOnce([{ id: "conv_1" }, { id: "conv_2" }]);

    const response = await GET();

    expect(mocks.listConversationSummaries).toHaveBeenCalledWith("user_123");
    expect(await response.json()).toEqual({
      ok: true,
      conversations: [{ id: "conv_1" }, { id: "conv_2" }]
    });
  });
});
