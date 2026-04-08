import { DEFAULT_INTEGRATIONS_STATE } from "@/lib/dashboard-integrations";
import {
  buildSlackIntegrationState,
  readSlackAccessToken,
  serializeSlackIntegrationSettings
} from "@/lib/slack-integration-state";

describe("slack integration state", () => {
  it("falls back to the dashboard defaults when no row exists", () => {
    expect(buildSlackIntegrationState(null)).toEqual(
      DEFAULT_INTEGRATIONS_STATE.slack
    );
  });

  it("maps stored workspace settings and credentials into the dashboard shape", () => {
    const row = {
      status: "connected",
      account_label: "Acme Corp",
      error_message: null,
      last_validated_at: "2026-04-06T12:00:00.000Z",
      settings_json: JSON.stringify({
        channelId: "sales-pipeline",
        notifications: { newConversation: false, allMessages: true },
        replyFromSlack: false
      }),
      credentials_json: JSON.stringify({ accessToken: "xoxb-live" })
    };

    expect(
      buildSlackIntegrationState(row as never)
    ).toMatchObject({
      status: "connected",
      workspaceName: "Acme Corp",
      channelId: "sales-pipeline",
      channelName: "#sales-pipeline",
      lastValidatedAt: "2026-04-06T12:00:00.000Z",
      notifications: {
        newConversation: false,
        assignedToMe: true,
        resolved: false,
        allMessages: true
      },
      replyFromSlack: false
    });
    expect(readSlackAccessToken(row as never)).toBe("xoxb-live");
  });

  it("serializes the persisted Slack settings payload", () => {
    expect(
      serializeSlackIntegrationSettings({
        ...DEFAULT_INTEGRATIONS_STATE.slack,
        channelId: "vip-customers",
        channelName: "#wrong-name"
      })
    ).toBe(
      JSON.stringify({
        channelId: "vip-customers",
        channelName: "#vip-customers",
        notifications: DEFAULT_INTEGRATIONS_STATE.slack.notifications,
        replyFromSlack: true
      })
    );
  });
});
