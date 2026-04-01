const mocks = vi.hoisted(() => ({
  getAnalyticsDataset: vi.fn(),
  getPublicAppUrl: vi.fn(),
  hasDailyDigestDelivery: vi.fn(),
  insertDailyDigestDelivery: vi.fn(),
  listConversationSummaries: vi.fn(),
  listDailyDigestRecipientRows: vi.fn(),
  sendDailyDigestEmail: vi.fn()
}));

vi.mock("@/lib/chatly-notification-email-senders", () => ({
  sendDailyDigestEmail: mocks.sendDailyDigestEmail
}));
vi.mock("@/lib/data/analytics", () => ({
  getAnalyticsDataset: mocks.getAnalyticsDataset
}));
vi.mock("@/lib/data/conversations", () => ({
  listConversationSummaries: mocks.listConversationSummaries
}));
vi.mock("@/lib/env", () => ({
  getPublicAppUrl: mocks.getPublicAppUrl
}));
vi.mock("@/lib/repositories/daily-digest-repository", () => ({
  hasDailyDigestDelivery: mocks.hasDailyDigestDelivery,
  insertDailyDigestDelivery: mocks.insertDailyDigestDelivery,
  listDailyDigestRecipientRows: mocks.listDailyDigestRecipientRows
}));

import { runScheduledDailyDigests } from "@/lib/daily-digest";

describe("daily digest runner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T13:15:00.000Z"));
    mocks.getPublicAppUrl.mockReturnValue("https://usechatting.com");
    mocks.hasDailyDigestDelivery.mockResolvedValue(false);
    mocks.getAnalyticsDataset.mockResolvedValue({ conversations: [], replyEvents: [] });
    mocks.listConversationSummaries.mockResolvedValue([
      {
        id: "conv_1",
        siteId: "site_1",
        siteName: "Chatting",
        email: "alex@example.com",
        sessionId: "session_1",
        status: "open",
        createdAt: "2026-03-29T08:00:00.000Z",
        updatedAt: "2026-03-30T10:00:00.000Z",
        pageUrl: "https://usechatting.com/pricing",
        referrer: null,
        userAgent: null,
        country: null,
        region: null,
        city: null,
        timezone: null,
        locale: null,
        lastMessageAt: "2026-03-30T10:00:00.000Z",
        lastMessagePreview: "Can I remove Chatting branding on Growth?",
        unreadCount: 1,
        rating: null,
        tags: []
      }
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("continues sending other teammate digests when one recipient fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mocks.listDailyDigestRecipientRows.mockResolvedValue([
      { user_id: "user_1", email: "owner@example.com", notification_email: null, timezone: "UTC" },
      { user_id: "user_2", email: "member@example.com", notification_email: "team@example.com", timezone: "UTC" }
    ]);
    mocks.sendDailyDigestEmail.mockRejectedValueOnce(new Error("SEND_FAILED")).mockResolvedValueOnce(undefined);

    await expect(runScheduledDailyDigests(new Date("2026-03-30T13:15:00.000Z"))).resolves.toEqual({
      processedRecipients: 2,
      sent: 1,
      skipped: 1
    });

    expect(mocks.sendDailyDigestEmail).toHaveBeenCalledTimes(2);
    expect(mocks.insertDailyDigestDelivery).toHaveBeenCalledTimes(1);
    expect(mocks.insertDailyDigestDelivery).toHaveBeenCalledWith("user_2", "2026-03-29");
    expect(errorSpy).toHaveBeenCalledWith("daily digest send failed", "user_1", expect.any(Error));
  });
});
