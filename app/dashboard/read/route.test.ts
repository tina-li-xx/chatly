const liveEventMocks = vi.hoisted(() => ({
  publishDashboardLive: vi.fn()
}));

const mocks = vi.hoisted(() => ({
  markConversationRead: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  markConversationRead: mocks.markConversationRead
}));

vi.mock("@/lib/live-events", () => ({
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

describe("dashboard read route", () => {
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
      new Request("http://localhost/dashboard/read", {
        method: "POST",
        body: JSON.stringify({})
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "missing-fields" });
  });

  it("returns not found when the read marker cannot be updated", async () => {
    mocks.markConversationRead.mockResolvedValueOnce(false);

    const response = await POST(
      new Request("http://localhost/dashboard/read", {
        method: "POST",
        body: JSON.stringify({ conversationId: "conv_404" })
      })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "not-found" });
  });

  it("publishes a dashboard read event after marking the conversation as read", async () => {
    mocks.markConversationRead.mockResolvedValueOnce(true);

    const response = await POST(
      new Request("http://localhost/dashboard/read", {
        method: "POST",
        body: JSON.stringify({ conversationId: "conv_1" })
      })
    );

    expect(liveEventMocks.publishDashboardLive).toHaveBeenCalledWith(
      "owner_123",
      expect.objectContaining({
        type: "conversation.read",
        conversationId: "conv_1"
      })
    );
    expect(await response.json()).toEqual({ ok: true, conversationId: "conv_1" });
  });
});
