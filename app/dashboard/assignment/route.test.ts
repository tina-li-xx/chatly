const liveEventMocks = vi.hoisted(() => ({
  publishDashboardLive: vi.fn()
}));

const mocks = vi.hoisted(() => ({
  getConversationSummaryById: vi.fn(),
  updateConversationAssignment: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getConversationSummaryById: mocks.getConversationSummaryById,
  updateConversationAssignment: mocks.updateConversationAssignment
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

describe("dashboard assignment route", () => {
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
    mocks.getConversationSummaryById.mockResolvedValue({
      status: "open",
      updatedAt: "2026-03-27T12:00:00.000Z"
    });
  });

  it("returns auth responses directly", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });

    const response = await POST(
      new Request("http://localhost/dashboard/assignment", { method: "POST", body: new FormData() })
    );

    expect(response.status).toBe(401);
  });

  it("rejects missing conversation ids", async () => {
    const response = await POST(
      new Request("http://localhost/dashboard/assignment", { method: "POST", body: new FormData() })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "missing-fields" });
  });

  it("returns not found when the assignment update fails", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_404");
    mocks.updateConversationAssignment.mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost/dashboard/assignment", { method: "POST", body: formData })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "not-found" });
  });

  it("maps invalid assignees to a 400 response", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("assignedUserId", "outsider");
    mocks.updateConversationAssignment.mockRejectedValueOnce(new Error("INVALID_ASSIGNEE"));

    const response = await POST(
      new Request("http://localhost/dashboard/assignment", { method: "POST", body: formData })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "invalid-assignee" });
  });

  it("updates the assignee and publishes a dashboard live event", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("assignedUserId", "member_1");
    mocks.updateConversationAssignment.mockResolvedValueOnce({ assignedUserId: "member_1" });

    const response = await POST(
      new Request("http://localhost/dashboard/assignment", { method: "POST", body: formData })
    );

    expect(mocks.updateConversationAssignment).toHaveBeenCalledWith("conv_1", "member_1", "user_123");
    expect(liveEventMocks.publishDashboardLive).toHaveBeenCalledWith(
      "owner_123",
      expect.objectContaining({
        type: "conversation.updated",
        conversationId: "conv_1",
        status: "open",
        updatedAt: "2026-03-27T12:00:00.000Z"
      })
    );
    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      assignedUserId: "member_1"
    });
  });
});
