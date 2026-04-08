const mocks = vi.hoisted(() => ({
  countActiveWorkspaceZapierWebhookRows: vi.fn(),
  deactivateWorkspaceZapierWebhookRows: vi.fn(),
  deleteWorkspaceIntegrationRow: vi.fn(),
  findActiveWorkspaceZapierApiKeyRow: vi.fn(),
  findWorkspaceIntegrationRow: vi.fn(),
  insertWorkspaceZapierApiKeyRow: vi.fn(),
  requireJsonRouteUser: vi.fn(),
  revokeWorkspaceZapierApiKeys: vi.fn(),
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
vi.mock("@/lib/repositories/zapier-api-keys-repository", () => ({
  findActiveWorkspaceZapierApiKeyRow: mocks.findActiveWorkspaceZapierApiKeyRow,
  insertWorkspaceZapierApiKeyRow: mocks.insertWorkspaceZapierApiKeyRow,
  revokeWorkspaceZapierApiKeys: mocks.revokeWorkspaceZapierApiKeys
}));
vi.mock("@/lib/repositories/zapier-webhooks-repository", () => ({
  countActiveWorkspaceZapierWebhookRows:
    mocks.countActiveWorkspaceZapierWebhookRows,
  deactivateWorkspaceZapierWebhookRows:
    mocks.deactivateWorkspaceZapierWebhookRows
}));

vi.mock("@/lib/zapier-integration", () => ({
  buildZapierApiKeyPrefix: (apiKey: string) => apiKey.slice(0, 20),
  generateZapierApiKey: () => "ck_live_generated",
  hashZapierApiKey: () => ({
    keyPrefix: "ck_live_generated".slice(0, 20),
    keyHash: "hash",
    keySalt: "salt"
  })
}));

import { encryptIntegrationCredentials } from "@/lib/integration-credentials";
import { DELETE, GET, POST } from "./route";

describe("dashboard zapier integration route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.countActiveWorkspaceZapierWebhookRows.mockResolvedValue(0);
    mocks.deactivateWorkspaceZapierWebhookRows.mockResolvedValue([]);
    mocks.findActiveWorkspaceZapierApiKeyRow.mockResolvedValue(null);
    mocks.insertWorkspaceZapierApiKeyRow.mockResolvedValue({ id: "key_1" });
    mocks.revokeWorkspaceZapierApiKeys.mockResolvedValue([]);
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_1",
        email: "owner@chatting.example",
        createdAt: "2026-04-07T00:00:00.000Z",
        workspaceOwnerId: "owner_1",
        workspaceRole: "admin"
      }
    });
  });

  it("loads the current workspace Zapier state", async () => {
    mocks.findWorkspaceIntegrationRow.mockResolvedValueOnce({
      provider: "zapier",
      status: "connected",
      account_label: "Zapier",
      external_account_id: "zapier",
      settings_json: JSON.stringify({ activeZapCount: 3 }),
      credentials_json: encryptIntegrationCredentials({ apiKey: "ck_live_saved" }),
      error_message: null,
      connected_at: "2026-04-07T10:00:00.000Z",
      last_validated_at: "2026-04-07T10:05:00.000Z"
    });
    mocks.countActiveWorkspaceZapierWebhookRows.mockResolvedValueOnce(3);
    mocks.findActiveWorkspaceZapierApiKeyRow.mockResolvedValueOnce({
      key_prefix: "ck_live_saved".slice(0, 20)
    });

    const response = await GET();

    expect(await response.json()).toMatchObject({
      ok: true,
      zapier: {
        connected: true,
        apiKeyReady: true,
        apiKey: "ck_live_saved",
        activeZapCount: 3
      }
    });
  });

  it("provisions a workspace Zapier API key", async () => {
    mocks.findWorkspaceIntegrationRow.mockResolvedValueOnce(null);
    mocks.countActiveWorkspaceZapierWebhookRows.mockResolvedValueOnce(0);
    mocks.upsertWorkspaceIntegrationRow.mockResolvedValueOnce({
      provider: "zapier",
      status: "connected",
      account_label: "Zapier",
      external_account_id: "zapier",
      settings_json: JSON.stringify({ activeZapCount: null }),
      credentials_json: encryptIntegrationCredentials({ apiKey: "ck_live_generated" }),
      error_message: null,
      connected_at: "2026-04-07T10:00:00.000Z",
      last_validated_at: "2026-04-07T10:05:00.000Z"
    });

    const response = await POST();

    expect(mocks.upsertWorkspaceIntegrationRow).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: "owner_1",
        provider: "zapier",
        status: "connected",
        credentialsJson: expect.stringMatching(/^enc:v1:/)
      })
    );
    expect(mocks.insertWorkspaceZapierApiKeyRow).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: "owner_1",
        keyHash: "hash",
        keySalt: "salt"
      })
    );
    expect(await response.json()).toMatchObject({
      ok: true,
      zapier: {
        connected: false,
        apiKeyReady: true,
        apiKey: "ck_live_generated"
      }
    });
  });

  it("disconnects the workspace Zapier integration", async () => {
    mocks.deleteWorkspaceIntegrationRow.mockResolvedValueOnce(true);

    const response = await DELETE();

    expect(mocks.deleteWorkspaceIntegrationRow).toHaveBeenCalledWith(
      "owner_1",
      "zapier"
    );
    expect(mocks.revokeWorkspaceZapierApiKeys).toHaveBeenCalledWith("owner_1");
    expect(mocks.deactivateWorkspaceZapierWebhookRows).toHaveBeenCalledWith(
      "owner_1"
    );
    expect(await response.json()).toMatchObject({
      ok: true,
      zapier: {
        connected: false,
        apiKeyReady: false,
        apiKey: ""
      }
    });
  });
});
