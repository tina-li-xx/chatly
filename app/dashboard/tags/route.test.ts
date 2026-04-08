const mocks = vi.hoisted(() => ({
  deliverZapierEvent: vi.fn(),
  getConversationSummaryById: vi.fn(),
  toggleTag: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getConversationSummaryById: mocks.getConversationSummaryById,
  toggleTag: mocks.toggleTag
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

describe("dashboard tags route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@chatting.example",
        createdAt: "2026-03-27T00:00:00.000Z",
        workspaceOwnerId: "owner_123"
      }
    });
    mocks.getConversationSummaryById
      .mockResolvedValueOnce({ tags: [] })
      .mockResolvedValueOnce({ tags: ["pricing"] });
  });

  it("rejects missing fields", async () => {
    const response = await POST(
      new Request("http://localhost/dashboard/tags", { method: "POST", body: new FormData() })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "missing-fields" });
  });

  it("returns not found when the tag toggle fails", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("tag", "pricing");
    mocks.toggleTag.mockResolvedValueOnce(false);

    const response = await POST(
      new Request("http://localhost/dashboard/tags", { method: "POST", body: formData })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "not-found" });
  });

  it("toggles tags for the current user", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("tag", "pricing");
    mocks.toggleTag.mockResolvedValueOnce(true);

    const response = await POST(
      new Request("http://localhost/dashboard/tags", { method: "POST", body: formData })
    );

    expect(mocks.toggleTag).toHaveBeenCalledWith("conv_1", "pricing", "user_123");
    expect(mocks.deliverZapierEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: "owner_123",
        eventType: "tag.added"
      })
    );
    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      tag: "pricing"
    });
  });
});
