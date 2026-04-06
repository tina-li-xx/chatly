const mocks = vi.hoisted(() => ({
  getWorkspaceAccess: vi.fn(),
  hasConversationAccess: vi.fn(),
  insertWorkspaceAiAssistEvent: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("node:crypto", () => ({
  randomUUID: () => "event_123"
}));

vi.mock("@/lib/repositories/ai-assist-events-repository", () => ({
  insertWorkspaceAiAssistEvent: mocks.insertWorkspaceAiAssistEvent
}));
vi.mock("@/lib/repositories/shared-conversation-repository", () => ({
  hasConversationAccess: mocks.hasConversationAccess
}));
vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));
vi.mock("@/lib/workspace-access", () => ({
  getWorkspaceAccess: mocks.getWorkspaceAccess
}));

import { POST } from "./route";

describe("dashboard ai assist events route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@chatting.example",
        createdAt: "2026-04-02T00:00:00.000Z",
        workspaceOwnerId: "owner_123",
        workspaceRole: "admin"
      }
    });
    mocks.getWorkspaceAccess.mockResolvedValue({
      ownerUserId: "owner_123",
      role: "admin"
    });
    mocks.hasConversationAccess.mockResolvedValue(true);
  });

  it("returns auth responses and rejects invalid events", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });

    const authResponse = await POST(
      new Request("http://localhost/dashboard/ai-assist/events", {
        method: "POST",
        body: "{}"
      })
    );
    const invalidEvent = await POST(
      new Request("http://localhost/dashboard/ai-assist/events", {
        method: "POST",
        body: JSON.stringify({ name: "ai.unknown", conversationId: "conv_1" })
      })
    );

    expect(authResponse.status).toBe(401);
    expect(invalidEvent.status).toBe(400);
    expect(await invalidEvent.json()).toEqual({
      ok: false,
      error: "invalid-event"
    });
  });

  it("returns not found when the actor cannot access the conversation", async () => {
    mocks.hasConversationAccess.mockResolvedValueOnce(false);

    const response = await POST(
      new Request("http://localhost/dashboard/ai-assist/events", {
        method: "POST",
        body: JSON.stringify({
          name: "ai.reply.used",
          conversationId: "conv_404"
        })
      })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "not-found" });
  });

  it("logs valid ai assist events with sanitized metadata", async () => {
    const response = await POST(
      new Request("http://localhost/dashboard/ai-assist/events", {
        method: "POST",
        body: JSON.stringify({
          name: "ai.reply.used",
          conversationId: "conv_1",
          metadata: {
            edited: true,
            editLevel: "light",
            ignored: "value"
          }
        })
      })
    );

    expect(mocks.insertWorkspaceAiAssistEvent).toHaveBeenCalledWith({
      id: "event_123",
      ownerUserId: "owner_123",
      actorUserId: "user_123",
      conversationId: "conv_1",
      feature: "reply",
      action: "used",
      metadataJson: {
        eventName: "ai.reply.used",
        edited: true,
        editLevel: "light"
      }
    });
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ ok: true, logged: true });
  });
});
