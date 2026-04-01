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

import {
  runScheduledDailyDigests,
  sendUserDailyDigest,
  shouldRunDailyDigests
} from "@/lib/daily-digest";

describe("daily digest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T13:15:00.000Z"));
    mocks.getPublicAppUrl.mockReturnValue("https://usechatting.com");
    mocks.hasDailyDigestDelivery.mockResolvedValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends a daily digest with today's metrics and open conversations", async () => {
    mocks.getAnalyticsDataset.mockResolvedValue({
      conversations: [
        {
          id: "conv_1",
          createdAt: "2026-03-29T12:00:00.000Z",
          updatedAt: "2026-03-29T12:10:00.000Z",
          status: "open",
          pageUrl: "https://usechatting.com/pricing",
          referrer: null,
          rating: null,
          firstResponseSeconds: 120,
          resolutionSeconds: null,
          tags: []
        },
        {
          id: "conv_2",
          createdAt: "2026-03-30T02:00:00.000Z",
          updatedAt: "2026-03-30T02:30:00.000Z",
          status: "resolved",
          pageUrl: "https://usechatting.com/docs",
          referrer: null,
          rating: null,
          firstResponseSeconds: 1800,
          resolutionSeconds: 3600,
          tags: []
        }
      ],
      replyEvents: []
    });
    mocks.listConversationSummaries.mockResolvedValue([
      {
        id: "conv_1",
        siteId: "site_1",
        siteName: "Chatting",
        email: "alex@example.com",
        sessionId: "session_1",
        status: "open",
        createdAt: "2026-03-30T08:00:00.000Z",
        updatedAt: "2026-03-30T10:00:00.000Z",
        pageUrl: "https://usechatting.com/pricing",
        referrer: null,
        userAgent: null,
        country: null,
        region: null,
        city: null,
        timezone: null,
        locale: null,
        lastMessageAt: "2026-03-30T13:00:00.000Z",
        lastMessagePreview: "Can I remove Chatting branding on Growth?",
        unreadCount: 1,
        rating: null,
        tags: []
      }
    ]);

    await expect(
      sendUserDailyDigest({
        userId: "user_1",
        notificationEmail: "team@example.com",
        timeZone: "America/New_York",
        now: new Date("2026-03-30T13:15:00.000Z")
      })
    ).resolves.toBe("sent");

    expect(mocks.sendDailyDigestEmail).toHaveBeenCalledWith({
      to: "team@example.com",
      date: "March 29, 2026",
      metrics: [
        { value: "2", label: "new conversations" },
        { value: "16m", label: "avg first response" },
        { value: "50%", label: "replied within 15 min" }
      ],
      openConversations: [
        {
          title: "Alex from pricing page",
          preview: "Can I remove Chatting branding on Growth?",
          meta: "15 minutes ago • https://usechatting.com/pricing"
        }
      ],
      inboxUrl: "https://usechatting.com/dashboard/inbox"
    });
    expect(mocks.insertDailyDigestDelivery).toHaveBeenCalledWith("user_1", "2026-03-29");
  });

  it("skips already-sent and no-activity digests", async () => {
    mocks.hasDailyDigestDelivery.mockResolvedValueOnce(true);
    await expect(
      sendUserDailyDigest({
        userId: "user_1",
        notificationEmail: "team@example.com",
        now: new Date("2026-03-30T13:15:00.000Z")
      })
    ).resolves.toBe("already-sent");

    mocks.getAnalyticsDataset.mockResolvedValueOnce({ conversations: [], replyEvents: [] });
    mocks.listConversationSummaries.mockResolvedValueOnce([]);
    await expect(
      sendUserDailyDigest({
        userId: "user_2",
        notificationEmail: "team@example.com",
        now: new Date("2026-03-30T13:15:00.000Z")
      })
    ).resolves.toBe("skipped");

    expect(mocks.sendDailyDigestEmail).not.toHaveBeenCalled();
    expect(mocks.insertDailyDigestDelivery).not.toHaveBeenCalled();
  });

  it("uses each recipient's local send window instead of a global UTC gate", async () => {
    mocks.listDailyDigestRecipientRows.mockResolvedValue([
      { user_id: "user_1", email: "owner@example.com", notification_email: null, timezone: "UTC" },
      { user_id: "user_2", email: "member@example.com", notification_email: "team@example.com", timezone: "America/New_York" }
    ]);
    mocks.getAnalyticsDataset.mockResolvedValue({ conversations: [], replyEvents: [] });
    mocks.listConversationSummaries.mockResolvedValue([
      {
        id: "conv_1",
        siteId: "site_1",
        siteName: "Chatting",
        email: null,
        sessionId: "session_1",
        status: "open",
        createdAt: "2026-03-29T08:00:00.000Z",
        updatedAt: "2026-03-30T09:45:00.000Z",
        pageUrl: null,
        referrer: null,
        userAgent: null,
        country: null,
        region: null,
        city: null,
        timezone: null,
        locale: null,
        lastMessageAt: "2026-03-30T09:45:00.000Z",
        lastMessagePreview: "Need help",
        unreadCount: 1,
        rating: null,
        tags: []
      }
    ]);

    expect(shouldRunDailyDigests(new Date("2026-03-30T08:59:00.000Z"))).toBe(false);
    expect(shouldRunDailyDigests(new Date("2026-03-30T12:59:00.000Z"), "America/New_York")).toBe(false);
    await expect(runScheduledDailyDigests(new Date("2026-03-30T08:59:00.000Z"))).resolves.toEqual({
      processedRecipients: 2,
      sent: 0,
      skipped: 2
    });

    expect(shouldRunDailyDigests(new Date("2026-03-30T13:00:00.000Z"), "America/New_York")).toBe(true);
    await expect(runScheduledDailyDigests(new Date("2026-03-30T13:15:00.000Z"))).resolves.toEqual({
      processedRecipients: 2,
      sent: 2,
      skipped: 0
    });
  });
});
