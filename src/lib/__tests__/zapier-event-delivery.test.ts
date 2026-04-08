const mocks = vi.hoisted(() => ({
  insertWorkspaceZapierDeliveryRow: vi.fn(),
  listActiveWorkspaceZapierWebhookRows: vi.fn()
}));

vi.mock("@/lib/repositories/zapier-deliveries-repository", () => ({
  insertWorkspaceZapierDeliveryRow: mocks.insertWorkspaceZapierDeliveryRow,
}));
vi.mock("@/lib/repositories/zapier-webhooks-repository", () => ({
  listActiveWorkspaceZapierWebhookRows: mocks.listActiveWorkspaceZapierWebhookRows
}));

import { deliverZapierEvent } from "@/lib/zapier-event-delivery";

describe("zapier event delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.insertWorkspaceZapierDeliveryRow.mockResolvedValue({ id: "delivery_1" });
  });

  it("queues payloads for each active webhook", async () => {
    mocks.listActiveWorkspaceZapierWebhookRows.mockResolvedValueOnce([
      {
        id: "wh_1",
        owner_user_id: "owner_1",
        target_url: "https://hooks.zapier.com/one"
      },
      {
        id: "wh_2",
        owner_user_id: "owner_1",
        target_url: "https://hooks.zapier.com/two"
      }
    ]);

    await deliverZapierEvent({
      ownerUserId: "owner_1",
      eventType: "conversation.created",
      payload: {
        event: "conversation.created",
        timestamp: "2026-04-07T12:00:00.000Z",
        data: { conversation_id: "conv_1" }
      } as never
    });

    expect(mocks.insertWorkspaceZapierDeliveryRow).toHaveBeenCalledTimes(2);
    expect(mocks.insertWorkspaceZapierDeliveryRow).toHaveBeenCalledWith(
      expect.objectContaining({
        webhookId: "wh_1",
        ownerUserId: "owner_1",
        payloadJson: expect.stringContaining("\"conversation_id\":\"conv_1\"")
      })
    );
  });

  it("uses the same event key for every webhook on the same payload", async () => {
    mocks.listActiveWorkspaceZapierWebhookRows.mockResolvedValueOnce([
      {
        id: "wh_1",
        owner_user_id: "owner_1",
        target_url: "https://hooks.zapier.com/one"
      }
    ]);

    await deliverZapierEvent({
      ownerUserId: "owner_1",
      eventType: "conversation.created",
      payload: {
        event: "conversation.created",
        timestamp: "2026-04-07T12:00:00.000Z",
        data: { conversation_id: "conv_1" }
      } as never
    });

    expect(mocks.insertWorkspaceZapierDeliveryRow).toHaveBeenCalledWith(
      expect.objectContaining({
        eventKey: expect.any(String)
      })
    );
  });
});
