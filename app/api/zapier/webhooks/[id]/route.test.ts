const mocks = vi.hoisted(() => ({
  deactivateWorkspaceZapierWebhookRow: vi.fn(),
  requireZapierApiAuth: vi.fn()
}));

vi.mock("@/lib/zapier-api-auth", () => ({
  requireZapierApiAuth: mocks.requireZapierApiAuth
}));
vi.mock("@/lib/repositories/zapier-webhooks-repository", () => ({
  deactivateWorkspaceZapierWebhookRow:
    mocks.deactivateWorkspaceZapierWebhookRow
}));

import { DELETE } from "./route";

describe("zapier webhook unsubscribe route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireZapierApiAuth.mockResolvedValue({
      auth: { ownerUserId: "owner_1" }
    });
  });

  it("deactivates webhook subscriptions", async () => {
    mocks.deactivateWorkspaceZapierWebhookRow.mockResolvedValueOnce({
      id: "wh_1",
      active: false
    });

    const response = await DELETE(
      new Request("https://chatting.test/api/zapier/webhooks/wh_1", {
        method: "DELETE"
      }),
      { params: Promise.resolve({ id: "wh_1" }) }
    );

    expect(mocks.deactivateWorkspaceZapierWebhookRow).toHaveBeenCalledWith(
      "wh_1",
      "owner_1"
    );
    expect(await response.json()).toEqual({
      ok: true,
      id: "wh_1",
      active: false
    });
  });
});
