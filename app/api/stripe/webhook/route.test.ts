const mocks = vi.hoisted(() => ({
  syncStripeBillingStateFromEvent: vi.fn(),
  constructEvent: vi.fn(),
  getStripeWebhookSecret: vi.fn()
}));

vi.mock("@/lib/stripe-billing", () => ({
  syncStripeBillingStateFromEvent: mocks.syncStripeBillingStateFromEvent
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: {
      constructEvent: mocks.constructEvent
    }
  }),
  getStripeWebhookSecret: mocks.getStripeWebhookSecret
}));

import { POST } from "./route";

describe("stripe webhook route", () => {
  beforeEach(() => {
    mocks.getStripeWebhookSecret.mockReturnValue("whsec_test");
  });

  it("rejects missing webhook signatures", async () => {
    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        body: JSON.stringify({})
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "missing signature" });
  });

  it("syncs checkout completion events", async () => {
    mocks.constructEvent.mockReturnValueOnce({
      type: "checkout.session.completed",
      data: {
        object: {
          customer: "cus_123",
          subscription: "sub_123",
          metadata: {
            userId: "user_123"
          }
        }
      }
    });

    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "sig_123"
        },
        body: "{}"
      })
    );

    expect(response.status).toBe(200);
    expect(mocks.syncStripeBillingStateFromEvent).toHaveBeenCalledWith({
      customerId: "cus_123",
      subscriptionId: "sub_123",
      userId: "user_123"
    });
  });

  it("syncs invoice subscription context from the new stripe invoice shape", async () => {
    mocks.constructEvent.mockReturnValueOnce({
      type: "invoice.paid",
      data: {
        object: {
          customer: "cus_123",
          metadata: {},
          parent: {
            subscription_details: {
              subscription: "sub_789",
              metadata: {
                userId: "user_invoice"
              }
            }
          }
        }
      }
    });

    await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "sig_123"
        },
        body: "{}"
      })
    );

    expect(mocks.syncStripeBillingStateFromEvent).toHaveBeenCalledWith({
      customerId: "cus_123",
      subscriptionId: "sub_789",
      userId: "user_invoice"
    });
  });

  it("ignores invoice draft/finalization update events", async () => {
    mocks.constructEvent.mockReturnValueOnce({
      type: "invoice.updated",
      data: {
        object: {
          customer: "cus_123"
        }
      }
    });

    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "sig_123"
        },
        body: "{}"
      })
    );

    expect(response.status).toBe(200);
    expect(mocks.syncStripeBillingStateFromEvent).not.toHaveBeenCalled();
  });

  it("ignores payment method attachment events", async () => {
    mocks.constructEvent.mockReturnValueOnce({
      type: "payment_method.attached",
      data: {
        object: {
          customer: "cus_123"
        }
      }
    });

    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "sig_123"
        },
        body: "{}"
      })
    );

    expect(response.status).toBe(200);
    expect(mocks.syncStripeBillingStateFromEvent).not.toHaveBeenCalled();
  });

  it("returns invalid webhook when stripe verification fails", async () => {
    mocks.constructEvent.mockImplementationOnce(() => {
      throw new Error("bad signature");
    });

    const response = await POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "sig_123"
        },
        body: "{}"
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid webhook" });
  });
});
