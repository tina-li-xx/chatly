const mocks = vi.hoisted(() => ({
  getPublicAppUrl: vi.fn(() => "https://usechatting.com"),
  findWorkspaceIntegrationRow: vi.fn(),
  upsertWorkspaceIntegrationRow: vi.fn(),
  upsertSlackThreadRow: vi.fn(),
  postSlackMessage: vi.fn()
}));

vi.mock("@/lib/env", () => ({
  getPublicAppUrl: mocks.getPublicAppUrl
}));

vi.mock("@/lib/repositories/integrations-repository", () => ({
  findWorkspaceIntegrationRow: mocks.findWorkspaceIntegrationRow,
  upsertWorkspaceIntegrationRow: mocks.upsertWorkspaceIntegrationRow
}));

vi.mock("@/lib/repositories/slack-thread-repository", () => ({
  upsertSlackThreadRow: mocks.upsertSlackThreadRow
}));

vi.mock("@/lib/slack-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/slack-api")>("@/lib/slack-api");
  return {
    ...actual,
    postSlackMessage: mocks.postSlackMessage
  };
});

import { SlackApiError } from "@/lib/slack-api";
import { maybeSendSlackConversationNotification } from "@/lib/slack-conversation-notifications";

const connectedRow = {
  owner_user_id: "owner_1",
  provider: "slack",
  status: "connected",
  account_label: "Acme",
  external_account_id: "T123",
  settings_json: JSON.stringify({
    channelId: "support-chat",
    channelName: "#support-chat",
    notifications: { newConversation: true },
    replyFromSlack: true
  }),
  credentials_json: JSON.stringify({ accessToken: "xoxb-live" }),
  error_message: null,
  connected_at: "2026-04-07T09:00:00.000Z",
  last_validated_at: null
};

describe("slack conversation notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("posts new conversations to slack and stores the thread mapping", async () => {
    mocks.findWorkspaceIntegrationRow.mockResolvedValueOnce(connectedRow);
    mocks.postSlackMessage.mockResolvedValueOnce({
      channelId: "C123",
      ts: "171.1",
      threadTs: "171.1"
    });
    mocks.upsertWorkspaceIntegrationRow.mockResolvedValue(undefined);
    mocks.upsertSlackThreadRow.mockResolvedValue(undefined);

    await maybeSendSlackConversationNotification({
      ownerUserId: "owner_1",
      userId: "owner_1",
      conversationId: "conv_1",
      preview: "Need help with pricing",
      siteName: "Acme",
      visitorLabel: "alex@example.com",
      pageUrl: "https://acme.example/pricing",
      location: "London",
      attachmentsCount: 0,
      isNewConversation: true,
      isNewVisitor: true,
      highIntent: true
    });

    expect(mocks.postSlackMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "xoxb-live",
        channel: "#support-chat"
      })
    );
    expect(mocks.upsertSlackThreadRow).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: "conv_1",
        slackTeamId: "T123",
        slackChannelId: "C123"
      })
    );
    expect(mocks.upsertWorkspaceIntegrationRow).toHaveBeenCalled();
  });

  it("marks the integration unhealthy when Slack rejects delivery", async () => {
    mocks.findWorkspaceIntegrationRow.mockResolvedValueOnce(connectedRow);
    mocks.postSlackMessage.mockRejectedValueOnce(new SlackApiError("invalid_auth"));

    await maybeSendSlackConversationNotification({
      userId: "owner_1",
      conversationId: "conv_1",
      preview: "Need help",
      siteName: "Acme",
      visitorLabel: "alex@example.com",
      pageUrl: null,
      location: null,
      attachmentsCount: 0,
      isNewConversation: true,
      isNewVisitor: false,
      highIntent: false
    });

    expect(mocks.upsertWorkspaceIntegrationRow).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "reconnect",
        errorMessage: "invalid auth"
      })
    );
  });
});
