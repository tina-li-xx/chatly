const mocks = vi.hoisted(() => ({
  deleteWorkspaceIntegrationRow: vi.fn(),
  findWorkspaceIntegrationRow: vi.fn(),
  requireJsonRouteUser: vi.fn(),
  upsertWorkspaceIntegrationRow: vi.fn()
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

vi.mock("@/lib/repositories/integrations-repository", () => ({
  deleteWorkspaceIntegrationRow: mocks.deleteWorkspaceIntegrationRow,
  findWorkspaceIntegrationRow: mocks.findWorkspaceIntegrationRow,
  upsertWorkspaceIntegrationRow: mocks.upsertWorkspaceIntegrationRow
}));

import { encryptIntegrationCredentials } from "@/lib/integration-credentials";
import { GET, POST } from "./route";

describe("dashboard slack integration route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_1",
        email: "owner@chatting.example",
        createdAt: "2026-04-06T00:00:00.000Z",
        workspaceOwnerId: "owner_1",
        workspaceRole: "admin"
      }
    });
  });
  it("loads the current workspace Slack state", async () => {
    mocks.findWorkspaceIntegrationRow.mockResolvedValueOnce({
      provider: "slack",
      status: "connected",
      account_label: "Acme Corp",
      external_account_id: "T123",
      settings_json: JSON.stringify({
        channelId: "support-chat",
        channelName: "#support-chat",
        notifications: { newConversation: true },
        replyFromSlack: true
      }),
      credentials_json: encryptIntegrationCredentials({ accessToken: "xoxb-live" }),
      error_message: null,
      connected_at: "2026-04-06T10:00:00.000Z",
      last_validated_at: "2026-04-06T10:05:00.000Z"
    });

    const response = await GET();

    expect(await response.json()).toMatchObject({
      ok: true,
      slack: {
        status: "connected",
        workspaceName: "Acme Corp",
        channelName: "#support-chat"
      }
    });
  });
  it("rejects Slack settings saves before OAuth has produced a token", async () => {
    mocks.findWorkspaceIntegrationRow.mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost/dashboard/settings/integrations/slack", {
        method: "POST",
        body: JSON.stringify({})
      })
    );

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      ok: false,
      error: "slack-not-connected"
    });
  });
  it("persists updated Slack channel settings", async () => {
    mocks.findWorkspaceIntegrationRow.mockResolvedValueOnce({
      provider: "slack",
      status: "connected",
      account_label: "Acme Corp",
      external_account_id: "T123",
      settings_json: JSON.stringify({
        channelId: "support-chat",
        channelName: "#support-chat",
        notifications: { newConversation: true, assignedToMe: true, resolved: false, allMessages: false },
        replyFromSlack: true
      }),
      credentials_json: encryptIntegrationCredentials({ accessToken: "xoxb-live" }),
      error_message: null,
      connected_at: "2026-04-06T10:00:00.000Z",
      last_validated_at: "2026-04-06T10:05:00.000Z"
    });
    mocks.upsertWorkspaceIntegrationRow.mockResolvedValueOnce({
      provider: "slack",
      status: "connected",
      account_label: "Acme Corp",
      external_account_id: "T123",
      settings_json: JSON.stringify({
        channelId: "vip-customers",
        channelName: "#vip-customers",
        notifications: { newConversation: false, assignedToMe: true, resolved: true, allMessages: false },
        replyFromSlack: false
      }),
      credentials_json: encryptIntegrationCredentials({ accessToken: "xoxb-live" }),
      error_message: null,
      connected_at: "2026-04-06T10:00:00.000Z",
      last_validated_at: "2026-04-06T11:00:00.000Z"
    });
    const response = await POST(
      new Request("http://localhost/dashboard/settings/integrations/slack", {
        method: "POST",
        body: JSON.stringify({
          channelId: "vip-customers",
          notifications: {
            newConversation: false,
            assignedToMe: true,
            resolved: true,
            allMessages: false
          },
          replyFromSlack: false
        })
      })
    );

    expect(mocks.upsertWorkspaceIntegrationRow).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: "owner_1",
        provider: "slack",
        status: "connected",
        credentialsJson: expect.stringMatching(/^enc:v1:/)
      })
    );
    expect(await response.json()).toMatchObject({
      ok: true,
      slack: {
        channelId: "vip-customers",
        channelName: "#vip-customers",
        replyFromSlack: false
      }
    });
  });
});
