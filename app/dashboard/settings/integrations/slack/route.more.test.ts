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
import { DELETE, GET } from "./route";

describe("dashboard slack integration route more", () => {
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

  it("upgrades a legacy plaintext credentials row when loading slack settings", async () => {
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
      credentials_json: JSON.stringify({ accessToken: "xoxb-legacy" }),
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
        channelId: "support-chat",
        channelName: "#support-chat",
        notifications: { newConversation: true },
        replyFromSlack: true
      }),
      credentials_json: encryptIntegrationCredentials({ accessToken: "xoxb-legacy" }),
      error_message: null,
      connected_at: "2026-04-06T10:00:00.000Z",
      last_validated_at: "2026-04-06T10:05:00.000Z"
    });

    await GET();

    expect(mocks.upsertWorkspaceIntegrationRow).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: "owner_1",
        credentialsJson: expect.stringMatching(/^enc:v1:/)
      })
    );
  });

  it("disconnects the workspace Slack integration", async () => {
    mocks.deleteWorkspaceIntegrationRow.mockResolvedValueOnce(true);

    const response = await DELETE();

    expect(mocks.deleteWorkspaceIntegrationRow).toHaveBeenCalledWith(
      "owner_1",
      "slack"
    );
    expect(await response.json()).toMatchObject({
      ok: true,
      slack: {
        status: "disconnected"
      }
    });
  });
});
