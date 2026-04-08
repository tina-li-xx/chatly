const mocks = vi.hoisted(() => ({
  deliverConversationTeamReply: vi.fn(),
  findWorkspaceIntegrationRowByExternalAccountId: vi.fn(),
  findSlackThreadByThreadKey: vi.fn()
}));

vi.mock("@/lib/conversation-team-reply-delivery", () => ({
  deliverConversationTeamReply: mocks.deliverConversationTeamReply
}));

vi.mock("@/lib/repositories/integrations-repository", () => ({
  findWorkspaceIntegrationRowByExternalAccountId: mocks.findWorkspaceIntegrationRowByExternalAccountId
}));

vi.mock("@/lib/repositories/slack-thread-repository", () => ({
  findSlackThreadByThreadKey: mocks.findSlackThreadByThreadKey
}));

import { handleSlackThreadReplyEvent } from "@/lib/slack-thread-replies";

describe("slack thread replies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ignores non-thread events and disconnected workspaces", async () => {
    await expect(
      handleSlackThreadReplyEvent({ type: "event_callback", team_id: "T123", event: { type: "message", ts: "1" } })
    ).resolves.toEqual({ ok: true, ignored: true });

    mocks.findWorkspaceIntegrationRowByExternalAccountId.mockResolvedValueOnce({
      owner_user_id: "owner_1",
      status: "reconnect",
      account_label: "Acme",
      settings_json: "{}"
    });

    await expect(
      handleSlackThreadReplyEvent({
        type: "event_callback",
        team_id: "T123",
        event: {
          type: "message",
          channel: "C123",
          channel_type: "channel",
          text: "Hello",
          ts: "171.2",
          thread_ts: "171.1",
          user: "U123"
        }
      })
    ).resolves.toEqual({ ok: true, ignored: true });
  });

  it("delivers mapped slack thread replies into the conversation", async () => {
    mocks.findWorkspaceIntegrationRowByExternalAccountId.mockResolvedValueOnce({
      owner_user_id: "owner_1",
      status: "connected",
      account_label: "Acme",
      settings_json: JSON.stringify({ replyFromSlack: true })
    });
    mocks.findSlackThreadByThreadKey.mockResolvedValueOnce({
      conversation_id: "conv_1"
    });
    mocks.deliverConversationTeamReply.mockResolvedValueOnce({
      conversationId: "conv_1",
      message: { id: "msg_1" }
    });

    await expect(
      handleSlackThreadReplyEvent({
        type: "event_callback",
        team_id: "T123",
        event: {
          type: "message",
          channel: "C123",
          channel_type: "channel",
          text: "Reply from Slack",
          ts: "171.2",
          thread_ts: "171.1",
          user: "U123"
        }
      })
    ).resolves.toEqual({ ok: true, conversationId: "conv_1", messageId: "msg_1" });

    expect(mocks.findSlackThreadByThreadKey).toHaveBeenCalledWith({
      slackTeamId: "T123",
      slackChannelId: "C123",
      slackThreadTs: "171.1"
    });
    expect(mocks.deliverConversationTeamReply).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: "conv_1",
        actorUserId: "owner_1",
        authorUserId: null
      })
    );
  });
});
