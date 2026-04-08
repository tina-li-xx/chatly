const liveEventMocks = vi.hoisted(() => ({
  publishConversationLive: vi.fn(),
  publishDashboardLive: vi.fn()
}));

const mocks = vi.hoisted(() => ({
  updateConversationTyping: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  updateConversationTyping: mocks.updateConversationTyping
}));

vi.mock("@/lib/live-events", () => ({
  publishConversationLive: liveEventMocks.publishConversationLive,
  publishDashboardLive: liveEventMocks.publishDashboardLive
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("dashboard typing route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@chatting.example",
        createdAt: "2026-03-27T00:00:00.000Z",
        workspaceOwnerId: "owner_123",
        workspaceRole: "admin"
      }
    });
  });

  it("rejects missing conversation ids", async () => {
    const response = await POST(
      new Request("http://localhost/dashboard/typing", {
        method: "POST",
        body: JSON.stringify({ typing: true })
      })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "not-found" });
  });

  it("returns not found when typing state cannot be updated", async () => {
    mocks.updateConversationTyping.mockResolvedValueOnce(false);

    const response = await POST(
      new Request("http://localhost/dashboard/typing", {
        method: "POST",
        body: JSON.stringify({ conversationId: "conv_404", typing: true })
      })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "not-found" });
  });

  it("publishes typing updates to the conversation and dashboard streams", async () => {
    mocks.updateConversationTyping.mockResolvedValueOnce(true);

    const response = await POST(
      new Request("http://localhost/dashboard/typing", {
        method: "POST",
        body: JSON.stringify({ conversationId: "conv_1", typing: true })
      })
    );

    expect(mocks.updateConversationTyping).toHaveBeenCalledWith({
      conversationId: "conv_1",
      userId: "user_123",
      typing: true
    });
    expect(liveEventMocks.publishConversationLive).toHaveBeenCalledWith("conv_1", {
      type: "typing.updated",
      conversationId: "conv_1",
      actor: "team",
      typing: true
    });
    expect(liveEventMocks.publishDashboardLive).toHaveBeenCalledWith("owner_123", {
      type: "typing.updated",
      conversationId: "conv_1",
      actor: "team",
      typing: true
    });
    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      typing: true
    });
  });
});
