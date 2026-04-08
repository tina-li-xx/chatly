const mocks = vi.hoisted(() => ({
  requireZapierApiAuth: vi.fn(),
  upsertWorkspaceZapierWebhookRow: vi.fn()
}));

vi.mock("@/lib/zapier-api-auth", () => ({
  requireZapierApiAuth: mocks.requireZapierApiAuth
}));
vi.mock("@/lib/repositories/zapier-webhooks-repository", () => ({
  upsertWorkspaceZapierWebhookRow: mocks.upsertWorkspaceZapierWebhookRow
}));

import { POST } from "./route";

describe("zapier webhook subscribe route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireZapierApiAuth.mockResolvedValue({
      auth: { ownerUserId: "owner_1" }
    });
  });

  it("subscribes Zapier webhook targets", async () => {
    mocks.upsertWorkspaceZapierWebhookRow.mockResolvedValueOnce({
      id: "wh_1",
      event_type: "conversation.created",
      active: true
    });

    const response = await POST(
      new Request("https://chatting.test/api/zapier/webhooks/subscribe", {
        method: "POST",
        body: JSON.stringify({
          event: "conversation.created",
          target_url: "https://hooks.zapier.com/hooks/catch/1"
        })
      })
    );

    expect(mocks.upsertWorkspaceZapierWebhookRow).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: "owner_1",
        eventType: "conversation.created"
      })
    );
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      ok: true,
      id: "wh_1",
      event: "conversation.created",
      active: true
    });
  });
});
