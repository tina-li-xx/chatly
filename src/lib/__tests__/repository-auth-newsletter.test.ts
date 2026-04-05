const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  consumeAuthEmailToken,
  findActiveAuthEmailToken,
  insertAuthEmailToken,
  invalidateAuthEmailTokens
} from "@/lib/repositories/auth-token-repository";
import {
  findNewsletterSubscriberById,
  findNewsletterSubscriberByEmail,
  insertNewsletterSubscriberRecord,
  markNewsletterWelcomeEmailSent,
  updateNewsletterSubscriberSource,
  updateNewsletterSubscriberSubscription
} from "@/lib/repositories/newsletter-repository";
import {
  findUserOnboardingState,
  updateUserOnboardingStep
} from "@/lib/repositories/onboarding-repository";

describe("auth token, newsletter, and onboarding repositories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns onboarding rows and updates onboarding completion state", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ onboarding_step: "profile", onboarding_completed_at: null }] })
      .mockResolvedValueOnce({
        rows: [{ onboarding_step: "done", onboarding_completed_at: "2026-03-29T10:00:00.000Z" }]
      });

    await expect(findUserOnboardingState("user_1")).resolves.toEqual({
      onboarding_step: "profile",
      onboarding_completed_at: null
    });
    await expect(updateUserOnboardingStep("user_1", "done")).resolves.toEqual({
      onboarding_step: "done",
      onboarding_completed_at: "2026-03-29T10:00:00.000Z"
    });

    expect(mocks.query.mock.calls[1]?.[0]).toContain("WHEN $2 = 'done'");
  });

  it("writes, finds, and consumes auth email tokens", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "token_1",
            user_id: "user_1",
            email: "owner@example.com",
            type: "password_reset",
            token_hash: "hash",
            expires_at: "2026-03-29T11:00:00.000Z",
            consumed_at: null
          }
        ]
      })
      .mockResolvedValueOnce({ rows: [] });

    await invalidateAuthEmailTokens("user_1", "password_reset");
    await insertAuthEmailToken({
      tokenId: "token_1",
      userId: "user_1",
      email: "owner@example.com",
      type: "password_reset",
      tokenHash: "hash",
      expiresAt: "2026-03-29T11:00:00.000Z"
    });
    await expect(findActiveAuthEmailToken("password_reset", "hash")).resolves.toMatchObject({
      id: "token_1",
      email: "owner@example.com"
    });
    await consumeAuthEmailToken("token_1");

    expect(mocks.query.mock.calls[0]?.[0]).toContain("SET consumed_at = COALESCE(consumed_at, NOW())");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("INSERT INTO auth_email_tokens");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("AND expires_at > NOW()");
    expect(mocks.query.mock.calls[3]?.[0]).toContain("WHERE id = $1");
  });

  it("reads and updates newsletter subscribers", async () => {
    const subscriber = {
      id: "sub_1",
      email: "owner@example.com",
      source: "landing",
      last_source: "landing",
      unsubscribed_at: null,
      welcome_email_sent_at: null,
      created_at: "2026-03-29T10:00:00.000Z",
      updated_at: "2026-03-29T10:00:00.000Z"
    };
    mocks.query
      .mockResolvedValueOnce({ rows: [subscriber] })
      .mockResolvedValueOnce({ rows: [subscriber] })
      .mockResolvedValueOnce({ rows: [subscriber] })
      .mockResolvedValueOnce({ rows: [{ ...subscriber, last_source: "blog" }] })
      .mockResolvedValueOnce({
        rows: [{ ...subscriber, unsubscribed_at: "2026-03-30T10:00:00.000Z" }]
      })
      .mockResolvedValueOnce({ rows: [] });

    await expect(findNewsletterSubscriberByEmail("owner@example.com")).resolves.toEqual(subscriber);
    await expect(
      insertNewsletterSubscriberRecord({ id: "sub_1", email: "owner@example.com", source: "landing" })
    ).resolves.toEqual(subscriber);
    await expect(findNewsletterSubscriberById("sub_1")).resolves.toEqual(subscriber);
    await expect(updateNewsletterSubscriberSource("sub_1", "blog")).resolves.toMatchObject({
      last_source: "blog"
    });
    await expect(updateNewsletterSubscriberSubscription("sub_1", false)).resolves.toMatchObject({
      unsubscribed_at: "2026-03-30T10:00:00.000Z"
    });
    await markNewsletterWelcomeEmailSent("sub_1");

    expect(mocks.query.mock.calls[0]?.[0]).toContain("FROM newsletter_subscribers");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("VALUES ($1, $2, $3, $3)");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("WHERE id = $1");
    expect(mocks.query.mock.calls[3]?.[0]).toContain("SET last_source = $2");
    expect(mocks.query.mock.calls[4]?.[0]).toContain("SET unsubscribed_at = CASE WHEN $2 THEN NULL ELSE NOW() END");
    expect(mocks.query.mock.calls[5]?.[0]).toContain("SET welcome_email_sent_at = NOW()");
  });
});
