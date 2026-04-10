const mocks = vi.hoisted(() => ({
  listDueWorkspaceZapierDeliveryRows: vi.fn(),
  recordWorkspaceZapierWebhookDelivery: vi.fn(),
  updateWorkspaceZapierDeliveryRow: vi.fn()
}));

vi.mock("@/lib/repositories/zapier-deliveries-repository", () => ({
  listDueWorkspaceZapierDeliveryRows: mocks.listDueWorkspaceZapierDeliveryRows,
  updateWorkspaceZapierDeliveryRow: mocks.updateWorkspaceZapierDeliveryRow
}));
vi.mock("@/lib/repositories/zapier-webhooks-repository", () => ({
  recordWorkspaceZapierWebhookDelivery: mocks.recordWorkspaceZapierWebhookDelivery
}));

import { runScheduledZapierDeliveries } from "@/lib/zapier-delivery-runner";

describe("zapier delivery runner", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateWorkspaceZapierDeliveryRow.mockResolvedValue({});
    mocks.recordWorkspaceZapierWebhookDelivery.mockResolvedValue({});
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("marks successful deliveries complete", async () => {
    mocks.listDueWorkspaceZapierDeliveryRows
      .mockResolvedValueOnce([
        {
          id: "delivery_1",
          owner_user_id: "owner_1",
          webhook_id: "wh_1",
          payload_json: "{\"event\":\"conversation.created\",\"timestamp\":\"2026-04-07T12:00:00.000Z\",\"data\":{\"conversation_id\":\"conv_1\"}}",
          attempt_count: 0,
          target_url: "https://hooks.zapier.com/one"
        }
      ])
      .mockResolvedValueOnce([]);
    global.fetch = vi.fn().mockResolvedValue(new Response("{\"ok\":true}", { status: 200 }));

    await runScheduledZapierDeliveries();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mocks.updateWorkspaceZapierDeliveryRow).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "delivery_1",
        attemptCount: 1,
        deliveredAt: expect.any(String),
        nextAttemptAt: null,
        lastResponseCode: 200
      })
    );
  });

  it("reschedules retryable failures with backoff", async () => {
    mocks.listDueWorkspaceZapierDeliveryRows
      .mockResolvedValueOnce([
        {
          id: "delivery_1",
          owner_user_id: "owner_1",
          webhook_id: "wh_1",
          payload_json: "{\"event\":\"conversation.created\",\"timestamp\":\"2026-04-07T12:00:00.000Z\",\"data\":{\"conversation_id\":\"conv_1\"}}",
          attempt_count: 0,
          target_url: "https://hooks.zapier.com/one"
        }
      ])
      .mockResolvedValueOnce([]);
    global.fetch = vi.fn().mockResolvedValue(new Response("retry", { status: 500 }));

    await runScheduledZapierDeliveries();

    expect(mocks.updateWorkspaceZapierDeliveryRow).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "delivery_1",
        attemptCount: 1,
        deliveredAt: null,
        nextAttemptAt: expect.any(String),
        lastResponseCode: 500
      })
    );
  });

  it("retries the delivery query when Postgres auth times out", async () => {
    mocks.listDueWorkspaceZapierDeliveryRows
      .mockRejectedValueOnce(new Error("Authentication timed out"))
      .mockResolvedValueOnce([
        {
          id: "delivery_1",
          owner_user_id: "owner_1",
          webhook_id: "wh_1",
          payload_json: "{\"event\":\"conversation.created\",\"timestamp\":\"2026-04-07T12:00:00.000Z\",\"data\":{\"conversation_id\":\"conv_1\"}}",
          attempt_count: 0,
          target_url: "https://hooks.zapier.com/one"
        }
      ])
      .mockResolvedValueOnce([]);
    global.fetch = vi.fn().mockResolvedValue(
      new Response("{\"ok\":true}", { status: 200 })
    );

    await runScheduledZapierDeliveries();

    expect(mocks.listDueWorkspaceZapierDeliveryRows).toHaveBeenCalledTimes(2);
    expect(mocks.updateWorkspaceZapierDeliveryRow).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "delivery_1",
        deliveredAt: expect.any(String),
        lastResponseCode: 200
      })
    );
  });

  it("retries delivery state writes when Postgres auth times out", async () => {
    mocks.listDueWorkspaceZapierDeliveryRows
      .mockResolvedValueOnce([
        {
          id: "delivery_1",
          owner_user_id: "owner_1",
          webhook_id: "wh_1",
          payload_json: "{\"event\":\"conversation.created\",\"timestamp\":\"2026-04-07T12:00:00.000Z\",\"data\":{\"conversation_id\":\"conv_1\"}}",
          attempt_count: 0,
          target_url: "https://hooks.zapier.com/one"
        }
      ])
      .mockResolvedValueOnce([]);
    mocks.recordWorkspaceZapierWebhookDelivery
      .mockRejectedValueOnce(new Error("Authentication timed out"))
      .mockResolvedValue({});
    global.fetch = vi.fn().mockResolvedValue(
      new Response("{\"ok\":true}", { status: 200 })
    );

    await runScheduledZapierDeliveries();

    expect(mocks.recordWorkspaceZapierWebhookDelivery).toHaveBeenCalledTimes(2);
    expect(mocks.updateWorkspaceZapierDeliveryRow).toHaveBeenCalledTimes(2);
  });

  it("stops retrying after the final attempt", async () => {
    mocks.listDueWorkspaceZapierDeliveryRows
      .mockResolvedValueOnce([
        {
          id: "delivery_1",
          owner_user_id: "owner_1",
          webhook_id: "wh_1",
          payload_json: "{\"event\":\"conversation.created\",\"timestamp\":\"2026-04-07T12:00:00.000Z\",\"data\":{\"conversation_id\":\"conv_1\"}}",
          attempt_count: 2,
          target_url: "https://hooks.zapier.com/one"
        }
      ])
      .mockResolvedValueOnce([]);
    global.fetch = vi.fn().mockResolvedValue(new Response("retry", { status: 500 }));

    await runScheduledZapierDeliveries();

    expect(mocks.updateWorkspaceZapierDeliveryRow).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "delivery_1",
        attemptCount: 3,
        nextAttemptAt: null,
        deliveredAt: null
      })
    );
  });
});
