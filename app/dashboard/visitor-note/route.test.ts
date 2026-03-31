const mocks = vi.hoisted(() => ({
  getConversationVisitorNote: vi.fn(),
  getSiteVisitorNote: vi.fn(),
  sendConversationMentionNotifications: vi.fn(),
  updateConversationVisitorNote: vi.fn(),
  updateSiteVisitorNote: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getConversationVisitorNote: mocks.getConversationVisitorNote,
  getSiteVisitorNote: mocks.getSiteVisitorNote,
  updateConversationVisitorNote: mocks.updateConversationVisitorNote,
  updateSiteVisitorNote: mocks.updateSiteVisitorNote
}));
vi.mock("@/lib/mention-notifications", () => ({
  sendConversationMentionNotifications: mocks.sendConversationMentionNotifications
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { GET, POST } from "./route";

describe("dashboard visitor-note route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@chatly.example",
        createdAt: "2026-03-27T00:00:00.000Z",
        workspaceOwnerId: "owner_123"
      }
    });
  });

  it("loads a conversation-scoped visitor note", async () => {
    mocks.getConversationVisitorNote.mockResolvedValueOnce({
      note: "Asked about enterprise rollout.",
      updatedAt: "2026-03-29T10:00:00.000Z"
    });

    const response = await GET(
      new Request("http://localhost/dashboard/visitor-note?conversationId=conv_1")
    );

    expect(mocks.getConversationVisitorNote).toHaveBeenCalledWith("conv_1", "user_123");
    expect(await response.json()).toEqual({
      ok: true,
      note: "Asked about enterprise rollout.",
      updatedAt: "2026-03-29T10:00:00.000Z"
    });
  });

  it("requires a site identity when no conversation id is present", async () => {
    const response = await GET(new Request("http://localhost/dashboard/visitor-note?siteId=site_1"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "missing-fields" });
  });

  it("saves a site-scoped visitor note", async () => {
    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set("sessionId", "session_1");
    formData.set("note", "Warm lead from pricing page.");
    mocks.updateSiteVisitorNote.mockResolvedValueOnce({
      note: "Warm lead from pricing page.",
      updatedAt: "2026-03-29T11:00:00.000Z"
    });

    const response = await POST(
      new Request("http://localhost/dashboard/visitor-note", { method: "POST", body: formData })
    );

    expect(mocks.updateSiteVisitorNote).toHaveBeenCalledWith({
      siteId: "site_1",
      sessionId: "session_1",
      email: null,
      note: "Warm lead from pricing page.",
      userId: "user_123"
    });
    expect(await response.json()).toEqual({
      ok: true,
      note: "Warm lead from pricing page.",
      updatedAt: "2026-03-29T11:00:00.000Z"
    });
    expect(mocks.sendConversationMentionNotifications).not.toHaveBeenCalled();
  });

  it("returns not found when a conversation note cannot be updated", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_missing");
    formData.set("note", "Need to follow up.");
    mocks.updateConversationVisitorNote.mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost/dashboard/visitor-note", { method: "POST", body: formData })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "not-found" });
  });

  it("sends mention emails for saved conversation notes", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("note", "@Tina can you confirm this pricing edge case?");
    mocks.updateConversationVisitorNote.mockResolvedValueOnce({
      note: "@Tina can you confirm this pricing edge case?",
      updatedAt: "2026-03-30T15:42:00.000Z"
    });

    const response = await POST(
      new Request("http://localhost/dashboard/visitor-note", { method: "POST", body: formData })
    );

    expect(response.status).toBe(200);
    expect(mocks.sendConversationMentionNotifications).toHaveBeenCalledWith({
      conversationId: "conv_1",
      note: "@Tina can you confirm this pricing edge case?",
      updatedAt: "2026-03-30T15:42:00.000Z",
      mentionerUserId: "user_123",
      mentionerEmail: "hello@chatly.example",
      workspaceOwnerId: "owner_123"
    });
  });
});
