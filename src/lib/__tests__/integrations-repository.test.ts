const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  deleteWorkspaceIntegrationRow,
  deleteWorkspaceWebhookRow,
  findWorkspaceIntegrationRowByExternalAccountId,
  findWorkspaceIntegrationRow,
  findWorkspaceWebhookRow,
  listWorkspaceIntegrationRows,
  listWorkspaceWebhookRows,
  updateWorkspaceWebhookDeliveryResult,
  upsertWorkspaceIntegrationRow,
  upsertWorkspaceWebhookRow
} from "@/lib/repositories/integrations-repository";

describe("integrations repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists and finds workspace integration rows", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ provider: "slack" }] })
      .mockResolvedValueOnce({ rows: [{ provider: "shopify" }] })
      .mockResolvedValueOnce({ rows: [{ provider: "slack", external_account_id: "T123" }] });

    await expect(listWorkspaceIntegrationRows("owner_1")).resolves.toEqual([{ provider: "slack" }]);
    await expect(findWorkspaceIntegrationRow("owner_1", "shopify")).resolves.toEqual({ provider: "shopify" });
    await expect(findWorkspaceIntegrationRowByExternalAccountId("slack", "T123")).resolves.toEqual({
      provider: "slack",
      external_account_id: "T123"
    });

    expect(mocks.query.mock.calls[0]?.[0]).toContain("FROM workspace_integrations");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual(["owner_1"]);
    expect(mocks.query.mock.calls[1]?.[1]).toEqual(["owner_1", "shopify"]);
    expect(mocks.query.mock.calls[2]?.[1]).toEqual(["slack", "T123"]);
  });

  it("upserts and deletes workspace integration rows", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ provider: "slack", status: "connected" }] })
      .mockResolvedValueOnce({ rowCount: 1 });

    await expect(
      upsertWorkspaceIntegrationRow({
        ownerUserId: "owner_1",
        provider: "slack",
        status: "connected",
        accountLabel: "Acme Corp",
        externalAccountId: "T123",
        settingsJson: "{\"channel\":\"support\"}",
        credentialsJson: "{\"accessToken\":\"xoxb-demo\"}",
        errorMessage: null,
        connectedAt: "2026-04-06T09:00:00.000Z",
        lastValidatedAt: "2026-04-06T09:10:00.000Z"
      })
    ).resolves.toEqual({ provider: "slack", status: "connected" });

    await expect(deleteWorkspaceIntegrationRow("owner_1", "slack")).resolves.toBe(true);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("INSERT INTO workspace_integrations");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual([
      "owner_1",
      "slack",
      "connected",
      "Acme Corp",
      "T123",
      "{\"channel\":\"support\"}",
      "{\"accessToken\":\"xoxb-demo\"}",
      null,
      "2026-04-06T09:00:00.000Z",
      "2026-04-06T09:10:00.000Z"
    ]);
    expect(mocks.query.mock.calls[1]?.[0]).toContain("DELETE FROM workspace_integrations");
    expect(mocks.query.mock.calls[1]?.[1]).toEqual(["owner_1", "slack"]);
  });

  it("lists, upserts, updates delivery state, and deletes workspace webhooks", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ id: "wh_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "wh_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "wh_1", status: "active" }] })
      .mockResolvedValueOnce({ rows: [{ id: "wh_1", last_response_code: 200 }] })
      .mockResolvedValueOnce({ rowCount: 1 });

    await expect(listWorkspaceWebhookRows("owner_1")).resolves.toEqual([{ id: "wh_1" }]);
    await expect(findWorkspaceWebhookRow("wh_1", "owner_1")).resolves.toEqual({ id: "wh_1" });
    await expect(
      upsertWorkspaceWebhookRow({
        id: "wh_1",
        ownerUserId: "owner_1",
        url: "https://api.example.com/chatting",
        eventsJson: "[\"conversation.created\"]",
        secret: "whsec_demo"
      })
    ).resolves.toEqual({ id: "wh_1", status: "active" });

    await expect(
      updateWorkspaceWebhookDeliveryResult({
        id: "wh_1",
        ownerUserId: "owner_1",
        lastTriggeredAt: "2026-04-06T10:00:00.000Z",
        lastResponseCode: 200,
        lastResponseBody: "{\"ok\":true}"
      })
    ).resolves.toEqual({ id: "wh_1", last_response_code: 200 });

    await expect(deleteWorkspaceWebhookRow("wh_1", "owner_1")).resolves.toBe(true);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("FROM workspace_webhooks");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("INSERT INTO workspace_webhooks");
    expect(mocks.query.mock.calls[2]?.[1]).toEqual([
      "wh_1",
      "owner_1",
      "https://api.example.com/chatting",
      "[\"conversation.created\"]",
      "whsec_demo",
      "active",
      null,
      null,
      null
    ]);
    expect(mocks.query.mock.calls[3]?.[0]).toContain("UPDATE workspace_webhooks SET last_triggered_at");
    expect(mocks.query.mock.calls[4]?.[0]).toContain("DELETE FROM workspace_webhooks");
  });
});
