const mocks = vi.hoisted(() => ({
  hasConversationAccess: vi.fn(),
  requireJsonRouteUser: vi.fn(),
  subscribeDashboardLive: vi.fn(),
  unsubscribe: vi.fn()
}));

vi.mock("@/lib/live-events", () => ({
  subscribeDashboardLive: mocks.subscribeDashboardLive
}));

vi.mock("@/lib/repositories/shared-repository", () => ({
  hasConversationAccess: mocks.hasConversationAccess
}));

vi.mock("@/lib/route-helpers", () => ({
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { GET } from "./route";

describe("dashboard live route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the auth response when the request is not authorized", async () => {
    const response = Response.json({ ok: false }, { status: 401 });
    mocks.requireJsonRouteUser.mockResolvedValueOnce({ response });

    await expect(GET(new Request("http://localhost/dashboard/live"))).resolves.toBe(response);
  });

  it("streams dashboard live events for the authenticated workspace owner", async () => {
    const controller = new AbortController();
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      user: { id: "owner_1", workspaceOwnerId: "owner_1", workspaceRole: "owner" }
    });
    mocks.subscribeDashboardLive.mockImplementationOnce((_ownerId, onEvent) => {
      onEvent({ type: "message.created", conversationId: "conv_1" });
      return mocks.unsubscribe;
    });

    const response = await GET(new Request("http://localhost/dashboard/live", { signal: controller.signal }));

    controller.abort();
    const body = await response.text();

    expect(response.headers.get("Content-Type")).toBe("text/event-stream; charset=utf-8");
    expect(body).toContain('"type":"connected"');
    expect(body).toContain('"type":"message.created"');
    expect(mocks.subscribeDashboardLive).toHaveBeenCalledWith("owner_1", expect.any(Function));
    expect(mocks.unsubscribe).toHaveBeenCalled();
  });

  it("filters member events for conversations they cannot access", async () => {
    const controller = new AbortController();
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      user: { id: "member_1", workspaceOwnerId: "owner_1", workspaceRole: "member" }
    });
    mocks.hasConversationAccess.mockResolvedValueOnce(false);
    mocks.subscribeDashboardLive.mockImplementationOnce((_ownerId, onEvent) => {
      onEvent({ type: "conversation.updated", conversationId: "conv_2", status: "open", updatedAt: "2026-04-12T00:00:00.000Z" });
      return mocks.unsubscribe;
    });

    const response = await GET(new Request("http://localhost/dashboard/live", { signal: controller.signal }));

    await Promise.resolve();
    controller.abort();
    const body = await response.text();

    expect(body).toContain('"type":"connected"');
    expect(body).not.toContain('"conversationId":"conv_2"');
    expect(mocks.hasConversationAccess).toHaveBeenCalledWith("conv_2", "owner_1", "member_1");
  });
});
