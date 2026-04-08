const mocks = vi.hoisted(() => ({
  getConversationReplyDeliveryState: vi.fn(),
  markConversationRead: vi.fn(),
  insertMessage: vi.fn(),
  hasConversationAccess: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  sendOfflineReplyTemplateEmail: vi.fn(),
  publishConversationLive: vi.fn(),
  publishDashboardLive: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getConversationReplyDeliveryState: mocks.getConversationReplyDeliveryState,
  markConversationRead: mocks.markConversationRead
}));

vi.mock("@/lib/data/conversations-internals", () => ({
  insertMessage: mocks.insertMessage
}));

vi.mock("@/lib/repositories/shared-conversation-repository", () => ({
  hasConversationAccess: mocks.hasConversationAccess
}));

vi.mock("@/lib/workspace-access", () => ({
  getWorkspaceAccess: mocks.getWorkspaceAccess
}));

vi.mock("@/lib/conversation-template-emails", () => ({
  sendOfflineReplyTemplateEmail: mocks.sendOfflineReplyTemplateEmail
}));

vi.mock("@/lib/live-events", () => ({
  publishConversationLive: mocks.publishConversationLive,
  publishDashboardLive: mocks.publishDashboardLive
}));

import { deliverConversationTeamReply } from "@/lib/conversation-team-reply-delivery";

describe("conversation team reply delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
    mocks.hasConversationAccess.mockResolvedValue(true);
    mocks.markConversationRead.mockResolvedValue(true);
    mocks.insertMessage.mockResolvedValue({
      id: "msg_1",
      createdAt: "2026-04-07T09:00:00.000Z"
    });
  });

  it("returns null when the actor cannot reply in the conversation", async () => {
    mocks.getConversationReplyDeliveryState.mockResolvedValueOnce(null);

    await expect(
      deliverConversationTeamReply({
        conversationId: "conv_1",
        actorUserId: "user_1",
        workspaceOwnerId: "owner_1",
        content: "Hello"
      })
    ).resolves.toBeNull();
  });

  it("publishes the reply and skips email fallback when the visitor is live", async () => {
    mocks.getConversationReplyDeliveryState.mockResolvedValueOnce({
      email: "visitor@example.com",
      visitor_is_live: true
    });

    await expect(
      deliverConversationTeamReply({
        conversationId: "conv_1",
        actorUserId: "user_1",
        workspaceOwnerId: "owner_1",
        content: "Hello",
        authorUserId: "user_1",
        markReadUserId: "user_1"
      })
    ).resolves.toEqual({
      conversationId: "conv_1",
      message: {
        id: "msg_1",
        createdAt: "2026-04-07T09:00:00.000Z"
      },
      emailDelivery: "skipped"
    });

    expect(mocks.markConversationRead).toHaveBeenCalledWith("conv_1", "user_1");
    expect(mocks.sendOfflineReplyTemplateEmail).not.toHaveBeenCalled();
    expect(mocks.publishConversationLive).toHaveBeenCalledWith(
      "conv_1",
      expect.objectContaining({ type: "message.created", sender: "team" })
    );
    expect(mocks.publishDashboardLive).toHaveBeenCalledTimes(2);
  });

  it("sends the offline reply email when the visitor is away", async () => {
    mocks.getConversationReplyDeliveryState.mockResolvedValueOnce({
      email: "visitor@example.com",
      visitor_is_live: false
    });
    mocks.sendOfflineReplyTemplateEmail.mockResolvedValueOnce("sent");

    const attachment = {
      fileName: "brief.pdf",
      contentType: "application/pdf",
      sizeBytes: 5,
      content: Buffer.from("hello")
    };

    const result = await deliverConversationTeamReply({
      conversationId: "conv_1",
      actorUserId: "owner_1",
      workspaceOwnerId: "owner_1",
      content: "Hello",
      attachments: [attachment],
      authorUserId: null,
      markReadUserId: "owner_1"
    });

    expect(result?.emailDelivery).toBe("sent");
    expect(mocks.sendOfflineReplyTemplateEmail).toHaveBeenCalledWith({
      conversationId: "conv_1",
      userId: "owner_1",
      messageId: "msg_1",
      attachments: [
        {
          fileName: "brief.pdf",
          contentType: "application/pdf",
          content: Buffer.from("hello")
        }
      ]
    });
  });
});
