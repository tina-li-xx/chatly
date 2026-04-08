const mocks = vi.hoisted(() => ({
  getInboxConversationSummaryById: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getInboxConversationSummaryById: mocks.getInboxConversationSummaryById
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { GET } from "./route";

describe("dashboard inbox summary route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: { id: "user_123", email: "hello@chatting.example", createdAt: "2026-03-27T00:00:00.000Z" }
    });
  });

  it("returns auth responses directly", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });

    const response = await GET(
      new Request("http://localhost/dashboard/inbox-summary?conversationId=conv_1")
    );

    expect(response.status).toBe(401);
  });

  it("rejects missing conversation ids", async () => {
    const response = await GET(new Request("http://localhost/dashboard/inbox-summary"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "missing-fields" });
  });

  it("returns not found when the conversation does not exist", async () => {
    mocks.getInboxConversationSummaryById.mockResolvedValueOnce(null);

    const response = await GET(
      new Request("http://localhost/dashboard/inbox-summary?conversationId=conv_404")
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "not-found" });
  });

  it("returns the requested inbox summary", async () => {
    mocks.getInboxConversationSummaryById.mockResolvedValueOnce({ id: "conv_1" });

    const response = await GET(
      new Request("http://localhost/dashboard/inbox-summary?conversationId=conv_1")
    );

    expect(mocks.getInboxConversationSummaryById).toHaveBeenCalledWith("conv_1", "user_123");
    expect(await response.json()).toEqual({
      ok: true,
      summary: { id: "conv_1" }
    });
  });
});
