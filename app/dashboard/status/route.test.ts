const liveEventMocks = vi.hoisted(() => ({
  publishConversationLive: vi.fn(),
  publishDashboardLive: vi.fn()
}));

const mocks = vi.hoisted(() => ({
  deliverZapierEvent: vi.fn(),
  getConversationById: vi.fn(),
  sendResolvedConversationTemplateEmails: vi.fn(),
  getConversationSummaryById: vi.fn(),
  markConversationRead: vi.fn(),
  updateConversationStatus: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/conversation-template-emails", () => ({
  sendResolvedConversationTemplateEmails: mocks.sendResolvedConversationTemplateEmails
}));

vi.mock("@/lib/data", () => ({
  getConversationById: mocks.getConversationById,
  getConversationSummaryById: mocks.getConversationSummaryById,
  markConversationRead: mocks.markConversationRead,
  updateConversationStatus: mocks.updateConversationStatus
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
vi.mock("@/lib/zapier-event-delivery", () => ({
  deliverZapierEvent: mocks.deliverZapierEvent
}));

import { POST } from "./route";

describe("dashboard status route", () => {
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
    mocks.getConversationSummaryById.mockResolvedValue({
      updatedAt: "2026-03-27T12:00:00.000Z"
    });
    mocks.getConversationById.mockResolvedValue({
      email: "visitor@example.com",
      messages: [{ id: "msg_1" }, { id: "msg_2" }],
      createdAt: "2026-03-27T11:50:00.000Z",
      updatedAt: "2026-03-27T12:00:00.000Z"
    });
  });

  it("rejects invalid status updates", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("status", "archived");

    const response = await POST(
      new Request("http://localhost/dashboard/status", { method: "POST", body: formData })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "missing-fields" });
  });

  it("returns not found when the status update fails", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_404");
    formData.set("status", "resolved");
    mocks.updateConversationStatus.mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost/dashboard/status", { method: "POST", body: formData })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "not-found" });
  });

  it("marks resolved conversations as read and sends follow-up templates", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("status", "resolved");
    mocks.updateConversationStatus.mockResolvedValueOnce("resolved");

    const response = await POST(
      new Request("http://localhost/dashboard/status", { method: "POST", body: formData })
    );

    expect(mocks.markConversationRead).toHaveBeenCalledWith("conv_1", "user_123");
    expect(mocks.sendResolvedConversationTemplateEmails).toHaveBeenCalledWith({
      conversationId: "conv_1",
      userId: "user_123"
    });
    expect(mocks.deliverZapierEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: "owner_123",
        eventType: "conversation.resolved"
      })
    );
    expect(liveEventMocks.publishDashboardLive).toHaveBeenCalledWith(
      "owner_123",
      expect.objectContaining({
        type: "conversation.read",
        conversationId: "conv_1"
      })
    );
    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      status: "resolved"
    });
  });

  it("returns success for open updates without read/template side effects", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("status", "open");
    mocks.updateConversationStatus.mockResolvedValueOnce("open");

    const response = await POST(
      new Request("http://localhost/dashboard/status", { method: "POST", body: formData })
    );

    expect(mocks.markConversationRead).not.toHaveBeenCalled();
    expect(mocks.sendResolvedConversationTemplateEmails).not.toHaveBeenCalled();
    expect(mocks.deliverZapierEvent).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      status: "open"
    });
  });

  it("swallows template email failures after resolving", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("status", "resolved");
    mocks.updateConversationStatus.mockResolvedValueOnce("resolved");
    mocks.sendResolvedConversationTemplateEmails.mockRejectedValueOnce(new Error("mail down"));

    const response = await POST(
      new Request("http://localhost/dashboard/status", { method: "POST", body: formData })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      status: "resolved"
    });
  });
});
