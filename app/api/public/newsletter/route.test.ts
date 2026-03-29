const mocks = vi.hoisted(() => ({
  subscribeToNewsletter: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  subscribeToNewsletter: mocks.subscribeToNewsletter
}));

import { POST } from "./route";

describe("public newsletter route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success for a new subscriber", async () => {
    mocks.subscribeToNewsletter.mockResolvedValueOnce({ alreadySubscribed: false });

    const response = await POST(
      new Request("http://localhost/api/public/newsletter", {
        method: "POST",
        body: JSON.stringify({
          email: "hello@example.com",
          source: "blog-newsletter-card"
        })
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      alreadySubscribed: false
    });
  });

  it("maps validation errors to 400 responses", async () => {
    mocks.subscribeToNewsletter.mockRejectedValueOnce(new Error("INVALID_EMAIL"));

    const response = await POST(
      new Request("http://localhost/api/public/newsletter", {
        method: "POST",
        body: JSON.stringify({
          email: "bad-email",
          source: "blog-newsletter-card"
        })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "invalid_email"
    });
  });

  it("maps provider failures to a delivery error", async () => {
    mocks.subscribeToNewsletter.mockRejectedValueOnce(
      new Error("NEWSLETTER_PROVIDER_SYNC_FAILED")
    );

    const response = await POST(
      new Request("http://localhost/api/public/newsletter", {
        method: "POST",
        body: JSON.stringify({
          email: "hello@example.com",
          source: "blog-footer-newsletter"
        })
      })
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "newsletter_delivery_failed"
    });
  });
});
