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

describe("dashboard shopify integration route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("loads the current workspace Shopify state", async () => {
    mocks.findWorkspaceIntegrationRow.mockResolvedValueOnce({
      provider: "shopify",
      status: "connected",
      account_label: "acme-store.myshopify.com",
      external_account_id: "acme-store.myshopify.com",
      settings_json: JSON.stringify({ domain: "acme-store.myshopify.com" }),
      credentials_json: encryptIntegrationCredentials({
        accessToken: "shpat_live"
      }),
      error_message: null,
      connected_at: "2026-04-07T10:00:00.000Z",
      last_validated_at: "2026-04-07T10:05:00.000Z"
    });

    const response = await GET();

    expect(await response.json()).toMatchObject({
      ok: true,
      shopify: {
        status: "connected",
        domain: "acme-store.myshopify.com"
      }
    });
  });

  it("upgrades a legacy plaintext credentials row when loading shopify settings", async () => {
    mocks.findWorkspaceIntegrationRow.mockResolvedValueOnce({
      provider: "shopify",
      status: "connected",
      account_label: "acme-store.myshopify.com",
      external_account_id: "acme-store.myshopify.com",
      settings_json: JSON.stringify({ domain: "acme-store.myshopify.com" }),
      credentials_json: JSON.stringify({ accessToken: "shpat_legacy" }),
      error_message: null,
      connected_at: "2026-04-07T10:00:00.000Z",
      last_validated_at: "2026-04-07T10:05:00.000Z"
    });
    mocks.upsertWorkspaceIntegrationRow.mockResolvedValueOnce({
      provider: "shopify",
      status: "connected",
      account_label: "acme-store.myshopify.com",
      external_account_id: "acme-store.myshopify.com",
      settings_json: JSON.stringify({ domain: "acme-store.myshopify.com" }),
      credentials_json: encryptIntegrationCredentials({
        accessToken: "shpat_legacy"
      }),
      error_message: null,
      connected_at: "2026-04-07T10:00:00.000Z",
      last_validated_at: "2026-04-07T10:05:00.000Z"
    });

    await GET();

    expect(mocks.upsertWorkspaceIntegrationRow).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: "owner_1",
        credentialsJson: expect.stringMatching(/^enc:v1:/)
      })
    );
  });

  it("disconnects the workspace Shopify integration", async () => {
    mocks.deleteWorkspaceIntegrationRow.mockResolvedValueOnce(true);

    const response = await DELETE();

    expect(mocks.deleteWorkspaceIntegrationRow).toHaveBeenCalledWith(
      "owner_1",
      "shopify"
    );
    expect(await response.json()).toMatchObject({
      ok: true,
      shopify: {
        status: "disconnected"
      }
    });
  });
});
