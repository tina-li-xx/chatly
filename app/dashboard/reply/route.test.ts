const mocks = vi.hoisted(() => ({
  deliverConversationTeamReply: vi.fn(),
  extractUploadedAttachments: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/conversation-team-reply-delivery", () => ({
  deliverConversationTeamReply: mocks.deliverConversationTeamReply
}));

vi.mock("@/lib/conversation-io", () => ({
  extractUploadedAttachments: mocks.extractUploadedAttachments
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("dashboard reply route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@chatting.example",
        createdAt: "2026-03-27T00:00:00.000Z",
        workspaceOwnerId: "owner_123",
        workspaceRole: "admin"
      }
    });
    mocks.extractUploadedAttachments.mockResolvedValue([]);
  });

  it("rejects empty replies", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");

    const response = await POST(
      new Request("http://localhost/dashboard/reply", { method: "POST", body: formData })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "empty-reply" });
  });

  it("returns not found when the conversation cannot be loaded", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_404");
    formData.set("content", "Hello");
    mocks.deliverConversationTeamReply.mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost/dashboard/reply", { method: "POST", body: formData })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "not-found" });
  });

  it("returns success and skips email delivery when no visitor email exists", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("content", "Hello there");
    mocks.deliverConversationTeamReply.mockResolvedValueOnce({
      conversationId: "conv_1",
      message: {
        id: "msg_1",
        createdAt: "2026-03-27T12:00:00.000Z"
      },
      emailDelivery: "skipped"
    });

    const response = await POST(
      new Request("http://localhost/dashboard/reply", { method: "POST", body: formData })
    );

    expect(mocks.deliverConversationTeamReply).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: "conv_1",
        actorUserId: "user_123",
        workspaceOwnerId: "owner_123",
        authorUserId: "user_123",
        markReadUserId: "user_123"
      })
    );
    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      message: {
        id: "msg_1",
        createdAt: "2026-03-27T12:00:00.000Z"
      },
      emailDelivery: "skipped"
    });
  });

  it("skips email fallback while the visitor is still live in chat", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("content", "Hello there");
    mocks.deliverConversationTeamReply.mockResolvedValueOnce({
      conversationId: "conv_1",
      message: {
        id: "msg_1",
        createdAt: "2026-03-27T12:00:00.000Z"
      },
      emailDelivery: "skipped"
    });

    const response = await POST(
      new Request("http://localhost/dashboard/reply", { method: "POST", body: formData })
    );

    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      message: {
        id: "msg_1",
        createdAt: "2026-03-27T12:00:00.000Z"
      },
      emailDelivery: "skipped"
    });
  });

  it("marks email delivery as failed when offline reply email sending throws", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("content", "Hello there");
    mocks.deliverConversationTeamReply.mockResolvedValueOnce({
      conversationId: "conv_1",
      message: {
        id: "msg_1",
        createdAt: "2026-03-27T12:00:00.000Z"
      },
      emailDelivery: "failed"
    });

    const response = await POST(
      new Request("http://localhost/dashboard/reply", { method: "POST", body: formData })
    );

    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      message: {
        id: "msg_1",
        createdAt: "2026-03-27T12:00:00.000Z"
      },
      emailDelivery: "failed"
    });
  });

  it("marks email delivery as queued_retry when the email is stored for retry", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("content", "Hello there");
    mocks.deliverConversationTeamReply.mockResolvedValueOnce({
      conversationId: "conv_1",
      message: {
        id: "msg_1",
        createdAt: "2026-03-27T12:00:00.000Z"
      },
      emailDelivery: "queued_retry"
    });

    const response = await POST(
      new Request("http://localhost/dashboard/reply", { method: "POST", body: formData })
    );

    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      message: {
        id: "msg_1",
        createdAt: "2026-03-27T12:00:00.000Z"
      },
      emailDelivery: "queued_retry"
    });
  });

  it("maps known attachment errors", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("content", "Hello there");
    mocks.deliverConversationTeamReply.mockRejectedValueOnce(new Error("ATTACHMENT_LIMIT"));

    const response = await POST(
      new Request("http://localhost/dashboard/reply", { method: "POST", body: formData })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "attachment-limit" });
  });
});
