const mocks = vi.hoisted(() => ({
  findNewsletterSubscriberById: vi.fn(),
  findNewsletterSubscriberByEmail: vi.fn(),
  insertNewsletterSubscriberRecord: vi.fn(),
  updateNewsletterSubscriberSource: vi.fn(),
  updateNewsletterSubscriberSubscription: vi.fn(),
  sendNewsletterWelcomeEmail: vi.fn(),
  markNewsletterWelcomeEmailSent: vi.fn()
}));

vi.mock("@/lib/newsletter-preferences-token", () => ({
  buildNewsletterPreferencesToken: vi.fn((id: string) => `token-${id}`),
  parseNewsletterPreferencesToken: vi.fn((token: string) =>
    token === "token-sub_1" ? { subscriberId: "sub_1" } : null
  )
}));

vi.mock("@/lib/repositories/newsletter-repository", () => ({
  findNewsletterSubscriberById: mocks.findNewsletterSubscriberById,
  findNewsletterSubscriberByEmail: mocks.findNewsletterSubscriberByEmail,
  insertNewsletterSubscriberRecord: mocks.insertNewsletterSubscriberRecord,
  updateNewsletterSubscriberSource: mocks.updateNewsletterSubscriberSource,
  updateNewsletterSubscriberSubscription: mocks.updateNewsletterSubscriberSubscription,
  markNewsletterWelcomeEmailSent: mocks.markNewsletterWelcomeEmailSent
}));

vi.mock("@/lib/newsletter-email", () => ({
  sendNewsletterWelcomeEmail: mocks.sendNewsletterWelcomeEmail
}));

vi.mock("@/lib/env", () => ({
  getPublicAppUrl: () => "https://usechatting.com"
}));

import {
  getNewsletterPreferencesByToken,
  subscribeToNewsletter,
  updateNewsletterPreferencesByToken
} from "@/lib/data/newsletter";

describe("newsletter subscriptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates, syncs, welcomes, and marks a new subscriber", async () => {
    mocks.findNewsletterSubscriberByEmail.mockResolvedValueOnce(null);
    mocks.insertNewsletterSubscriberRecord.mockResolvedValueOnce({
      id: "sub_1",
      email: "hello@example.com"
    });

    const result = await subscribeToNewsletter({
      email: "Hello@Example.com ",
      source: "blog-footer-newsletter"
    });

    expect(result).toEqual({ alreadySubscribed: false });
    expect(mocks.insertNewsletterSubscriberRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "hello@example.com",
        source: "blog-footer-newsletter"
      })
    );
    expect(mocks.sendNewsletterWelcomeEmail).toHaveBeenCalledWith({
      email: "hello@example.com",
      preferencesUrl: "https://usechatting.com/newsletter/preferences?token=token-sub_1"
    });
    expect(mocks.markNewsletterWelcomeEmailSent).toHaveBeenCalledWith("sub_1");
  });

  it("returns a friendly duplicate success when the subscriber already exists", async () => {
    mocks.findNewsletterSubscriberByEmail.mockResolvedValueOnce({
      id: "sub_2",
      email: "hello@example.com",
      welcome_email_sent_at: "2026-03-29T10:00:00.000Z"
    });

    const result = await subscribeToNewsletter({
      email: "hello@example.com",
      source: "blog-newsletter-card"
    });

    expect(result).toEqual({ alreadySubscribed: true });
    expect(mocks.updateNewsletterSubscriberSource).toHaveBeenCalledWith(
      "sub_2",
      "blog-newsletter-card"
    );
    expect(mocks.sendNewsletterWelcomeEmail).not.toHaveBeenCalled();
  });

  it("rejects invalid email addresses before touching persistence", async () => {
    await expect(
      subscribeToNewsletter({
        email: "not-an-email",
        source: "blog"
      })
    ).rejects.toThrow("INVALID_EMAIL");

    expect(mocks.findNewsletterSubscriberByEmail).not.toHaveBeenCalled();
  });

  it("resubscribes returning subscribers and updates token-based preferences", async () => {
    mocks.findNewsletterSubscriberByEmail.mockResolvedValueOnce({
      id: "sub_1",
      email: "hello@example.com",
      unsubscribed_at: "2026-03-30T10:00:00.000Z",
      welcome_email_sent_at: "2026-03-29T10:00:00.000Z"
    });
    mocks.updateNewsletterSubscriberSubscription.mockResolvedValueOnce({
      email: "hello@example.com",
      unsubscribed_at: null
    });
    mocks.findNewsletterSubscriberById.mockResolvedValueOnce({
      id: "sub_1",
      email: "hello@example.com",
      unsubscribed_at: "2026-03-30T10:00:00.000Z"
    });
    mocks.findNewsletterSubscriberById.mockResolvedValueOnce({
      id: "sub_1",
      email: "hello@example.com",
      unsubscribed_at: "2026-03-30T10:00:00.000Z"
    });
    mocks.updateNewsletterSubscriberSubscription.mockResolvedValueOnce({
      id: "sub_1",
      email: "hello@example.com",
      unsubscribed_at: null
    });

    await expect(
      subscribeToNewsletter({
        email: "hello@example.com",
        source: "blog-newsletter-card"
      })
    ).resolves.toEqual({ alreadySubscribed: false });
    await expect(getNewsletterPreferencesByToken("token-sub_1")).resolves.toEqual({
      email: "hello@example.com",
      subscribed: false
    });
    await expect(
      updateNewsletterPreferencesByToken({ token: "token-sub_1", subscribed: true })
    ).resolves.toEqual({
      email: "hello@example.com",
      subscribed: true
    });
    expect(mocks.updateNewsletterSubscriberSource).toHaveBeenCalledWith(
      "sub_1",
      "blog-newsletter-card"
    );
  });

  it("surfaces welcome-email failures as delivery errors", async () => {
    mocks.findNewsletterSubscriberByEmail.mockResolvedValueOnce(null);
    mocks.insertNewsletterSubscriberRecord.mockResolvedValueOnce({
      id: "sub_3",
      email: "hello@example.com"
    });
    mocks.sendNewsletterWelcomeEmail.mockRejectedValueOnce(new Error("boom"));

    await expect(
      subscribeToNewsletter({
        email: "hello@example.com",
        source: "blog-newsletter-card"
      })
    ).rejects.toThrow("NEWSLETTER_DELIVERY_FAILED");
  });
});
