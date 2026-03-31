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
  jsonError: (error: string, status: number) => Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) => Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { GET, POST } from "./route";

describe("visitor note route extra coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_1",
        email: "owner@example.com",
        workspaceOwnerId: "owner_1"
      }
    });
  });

  it("returns auth responses and missing records for gets", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });
    expect((await GET(new Request("https://chatting.test"))).status).toBe(401);

    mocks.getConversationVisitorNote.mockResolvedValueOnce(null);
    expect((await GET(new Request("https://chatting.test?conversationId=conv_1"))).status).toBe(404);

    mocks.getSiteVisitorNote.mockResolvedValueOnce(null);
    expect((await GET(new Request("https://chatting.test?siteId=site_1&email=hello@example.com"))).status).toBe(404);
  });

  it("loads and saves site-scoped notes", async () => {
    mocks.getSiteVisitorNote.mockResolvedValueOnce({ note: "Warm lead" });
    const loaded = await GET(new Request("https://chatting.test?siteId=site_1&sessionId=session_1"));
    expect(await loaded.json()).toEqual({ ok: true, note: "Warm lead" });

    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set("email", "hello@example.com");
    formData.set("note", "Follow up tomorrow");
    mocks.updateSiteVisitorNote.mockResolvedValueOnce({ note: "Follow up tomorrow" });
    const saved = await POST(new Request("https://chatting.test", { method: "POST", body: formData }));
    expect(await saved.json()).toEqual({ ok: true, note: "Follow up tomorrow" });
  });

  it("covers post validation and site-scoped not-found responses", async () => {
    const missing = await POST(new Request("https://chatting.test", { method: "POST", body: new FormData() }));
    expect(missing.status).toBe(400);

    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set("sessionId", "session_1");
    formData.set("note", "Follow up tomorrow");
    mocks.updateSiteVisitorNote.mockResolvedValueOnce(null);
    const saved = await POST(new Request("https://chatting.test", { method: "POST", body: formData }));
    expect(saved.status).toBe(404);
  });

  it("keeps note saves successful when mention email delivery fails", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("note", "@Tina can you take this one?");
    mocks.updateConversationVisitorNote.mockResolvedValueOnce({
      note: "@Tina can you take this one?",
      updatedAt: "2026-03-30T15:44:00.000Z"
    });
    mocks.sendConversationMentionNotifications.mockRejectedValueOnce(new Error("mail down"));

    const response = await POST(new Request("https://chatting.test", { method: "POST", body: formData }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      note: "@Tina can you take this one?",
      updatedAt: "2026-03-30T15:44:00.000Z"
    });
  });
});
