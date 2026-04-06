const mocks = vi.hoisted(() => ({
  maybeSendAiAssistWarningEmails: vi.fn(),
  countWorkspaceAiAssistRequestsForRange: vi.fn(),
  generateDashboardAiAssist: vi.fn(),
  getDashboardAiAssistBillingCycle: vi.fn(),
  getDashboardAiAssistAccess: vi.fn(),
  getDashboardConversationThreadById: vi.fn(),
  insertWorkspaceAiAssistEvent: vi.fn(),
  listSavedReplyRows: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data/dashboard-conversation-thread", () => ({
  getDashboardConversationThreadById: mocks.getDashboardConversationThreadById
}));
vi.mock("@/lib/data/settings-ai-assist-access", () => ({
  getDashboardAiAssistAccess: mocks.getDashboardAiAssistAccess
}));
vi.mock("@/lib/data/dashboard-ai-assist-billing-cycle", () => ({
  getDashboardAiAssistBillingCycle: mocks.getDashboardAiAssistBillingCycle
}));
vi.mock("@/lib/ai-assist-warning-emails", () => ({
  maybeSendAiAssistWarningEmails: mocks.maybeSendAiAssistWarningEmails
}));
vi.mock("@/lib/repositories/saved-replies-repository", () => ({
  listSavedReplyRows: mocks.listSavedReplyRows
}));
vi.mock("@/lib/repositories/ai-assist-events-repository", () => ({
  insertWorkspaceAiAssistEvent: mocks.insertWorkspaceAiAssistEvent
}));
vi.mock("@/lib/repositories/ai-assist-events-read-repository", () => ({
  countWorkspaceAiAssistRequestsForRange:
    mocks.countWorkspaceAiAssistRequestsForRange
}));

vi.mock("@/lib/dashboard-ai-assist-service", () => ({
  generateDashboardAiAssist: mocks.generateDashboardAiAssist
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("dashboard ai assist route", () => {
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
    mocks.getDashboardAiAssistAccess.mockResolvedValue({
      ownerUserId: "owner_123",
      planKey: "growth",
      settings: {
        replySuggestionsEnabled: true,
        conversationSummariesEnabled: true,
        rewriteAssistanceEnabled: true,
        suggestedTagsEnabled: true
      }
    });
    mocks.listSavedReplyRows.mockResolvedValue([]);
    mocks.insertWorkspaceAiAssistEvent.mockResolvedValue(undefined);
    mocks.countWorkspaceAiAssistRequestsForRange.mockResolvedValue(0);
    mocks.getDashboardAiAssistBillingCycle.mockResolvedValue({
      startIso: "2026-04-01T00:00:00.000Z",
      nextIso: "2026-05-01T00:00:00.000Z",
      limit: 2000
    });
    mocks.maybeSendAiAssistWarningEmails.mockResolvedValue(undefined);
  });

  it("returns auth responses and validates required fields", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });
    const authResponse = await POST(new Request("http://localhost/dashboard/ai-assist", { method: "POST", body: "{}" }));
    const missingResponse = await POST(
      new Request("http://localhost/dashboard/ai-assist", {
        method: "POST",
        body: JSON.stringify({ action: "summarize", conversationId: "" })
      })
    );

    expect(authResponse.status).toBe(401);
    expect(missingResponse.status).toBe(400);
    expect(await missingResponse.json()).toEqual({ ok: false, error: "missing-fields" });
  });

  it("maps draft validation, missing conversations, and provider failures", async () => {
    const draftRequired = await POST(
      new Request("http://localhost/dashboard/ai-assist", {
        method: "POST",
        body: JSON.stringify({ action: "rewrite", conversationId: "conv_1", draft: "" })
      })
    );

    mocks.getDashboardConversationThreadById.mockResolvedValueOnce(null);
    const missingConversation = await POST(
      new Request("http://localhost/dashboard/ai-assist", {
        method: "POST",
        body: JSON.stringify({ action: "reply", conversationId: "conv_404" })
      })
    );

    mocks.getDashboardConversationThreadById.mockResolvedValueOnce({ id: "conv_1", messages: [] });
    mocks.generateDashboardAiAssist.mockRejectedValueOnce(new Error("MINIMAX_NOT_CONFIGURED"));
    const providerFailure = await POST(
      new Request("http://localhost/dashboard/ai-assist", {
        method: "POST",
        body: JSON.stringify({ action: "reply", conversationId: "conv_1" })
      })
    );

    expect(draftRequired.status).toBe(422);
    expect(await draftRequired.json()).toEqual({ ok: false, error: "draft-required" });
    expect(missingConversation.status).toBe(404);
    expect(await missingConversation.json()).toEqual({ ok: false, error: "not-found" });
    expect(providerFailure.status).toBe(500);
    expect(await providerFailure.json()).toEqual({ ok: false, error: "ai-provider-not-configured" });
  });

  it("pauses ai assist when the monthly limit has been reached", async () => {
    mocks.getDashboardConversationThreadById.mockResolvedValueOnce({ id: "conv_1", messages: [] });
    mocks.countWorkspaceAiAssistRequestsForRange.mockResolvedValueOnce(2000);

    const response = await POST(
      new Request("http://localhost/dashboard/ai-assist", {
        method: "POST",
        body: JSON.stringify({ action: "reply", conversationId: "conv_1" })
      })
    );

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        ok: false,
        error: "ai-assist-limit-reached"
      })
    );
    expect(mocks.generateDashboardAiAssist).not.toHaveBeenCalled();
  });

  it("returns generated ai assist results for valid requests", async () => {
    mocks.getDashboardConversationThreadById.mockResolvedValueOnce({ id: "conv_1", messages: [] });
    mocks.generateDashboardAiAssist.mockResolvedValueOnce({
      action: "reply",
      draft: "Happy to help. What plan size are you looking at?"
    });

    const response = await POST(
      new Request("http://localhost/dashboard/ai-assist", {
        method: "POST",
        body: JSON.stringify({ action: "reply", conversationId: "conv_1" })
      })
    );

    expect(mocks.getDashboardConversationThreadById).toHaveBeenCalledWith("conv_1", "user_123");
    expect(mocks.insertWorkspaceAiAssistEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: "owner_123",
        actorUserId: "user_123",
        conversationId: "conv_1",
        feature: "reply",
        action: "requested",
        metadataJson: {
          eventName: "ai.reply.requested"
        }
      })
    );
    expect(mocks.maybeSendAiAssistWarningEmails).toHaveBeenCalledWith({
      ownerUserId: "owner_123",
      used: 1,
      limit: 2000,
      cycleStart: "2026-04-01",
      resetsAt: "2026-05-01T00:00:00.000Z"
    });
    expect(mocks.generateDashboardAiAssist).toHaveBeenCalledWith({
      action: "reply",
      conversation: { id: "conv_1", messages: [] },
      draft: "",
      tone: "",
      savedReplies: []
    });
    expect(await response.json()).toEqual({
      ok: true,
      action: "reply",
      result: {
        action: "reply",
        draft: "Happy to help. What plan size are you looking at?"
      }
    });
  });
});
