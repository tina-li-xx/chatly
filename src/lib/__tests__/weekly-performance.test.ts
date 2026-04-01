const mocks = vi.hoisted(() => ({
  getAnalyticsDataset: vi.fn(),
  getPublicAppUrl: vi.fn(),
  hasWeeklyPerformanceDelivery: vi.fn(),
  insertWeeklyPerformanceDelivery: vi.fn(),
  listWeeklyPerformanceRecipientRows: vi.fn(),
  sendWeeklyPerformanceEmail: vi.fn()
}));

vi.mock("@/lib/chatly-notification-email-senders", () => ({
  sendWeeklyPerformanceEmail: mocks.sendWeeklyPerformanceEmail
}));
vi.mock("@/lib/data/analytics", () => ({
  getAnalyticsDataset: mocks.getAnalyticsDataset
}));
vi.mock("@/lib/env", () => ({
  getPublicAppUrl: mocks.getPublicAppUrl
}));
vi.mock("@/lib/repositories/weekly-performance-repository", () => ({
  hasWeeklyPerformanceDelivery: mocks.hasWeeklyPerformanceDelivery,
  insertWeeklyPerformanceDelivery: mocks.insertWeeklyPerformanceDelivery,
  listWeeklyPerformanceRecipientRows: mocks.listWeeklyPerformanceRecipientRows
}));

import {
  runScheduledWeeklyPerformanceEmails,
  sendUserWeeklyPerformanceEmail,
  shouldRunWeeklyPerformanceEmails
} from "@/lib/weekly-performance";

function conversation(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "conv_1",
    createdAt: "2026-03-23T10:00:00.000Z",
    updatedAt: "2026-03-23T10:05:00.000Z",
    status: "open",
    pageUrl: "https://usechatting.com/pricing",
    referrer: null,
    rating: null,
    firstResponseSeconds: null,
    resolutionSeconds: null,
    tags: [],
    ...overrides
  };
}

describe("weekly performance email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T13:15:00.000Z"));
    mocks.getPublicAppUrl.mockReturnValue("https://usechatting.com");
    mocks.hasWeeklyPerformanceDelivery.mockResolvedValue(false);
    mocks.listWeeklyPerformanceRecipientRows.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("sends the previous week's analytics summary", async () => {
    mocks.getAnalyticsDataset.mockResolvedValue({
      conversations: [
        conversation({ id: "conv_1", createdAt: "2026-03-23T10:00:00.000Z", status: "resolved", firstResponseSeconds: 180 }),
        conversation({ id: "conv_2", createdAt: "2026-03-24T11:00:00.000Z", status: "resolved", firstResponseSeconds: 240 }),
        conversation({ id: "conv_3", createdAt: "2026-03-25T14:00:00.000Z", pageUrl: "https://usechatting.com/contact", status: "open", firstResponseSeconds: 600 }),
        conversation({ id: "conv_4", createdAt: "2026-03-26T15:00:00.000Z", status: "resolved" }),
        conversation({ id: "conv_5", createdAt: "2026-03-16T09:00:00.000Z" }),
        conversation({ id: "conv_6", createdAt: "2026-03-17T09:00:00.000Z" })
      ],
      replyEvents: []
    });

    await expect(
      sendUserWeeklyPerformanceEmail({
        userId: "user_1",
        notificationEmail: "team@example.com",
        timeZone: "UTC",
        now: new Date("2026-03-30T13:15:00.000Z")
      })
    ).resolves.toBe("sent");

    expect(mocks.sendWeeklyPerformanceEmail).toHaveBeenCalledWith({
      to: "team@example.com",
      dateRange: "Mar 23 - Mar 29",
      highlights: [
        "Conversation volume was up 100% from last week",
        "Replies were under 5 minutes for 67% of responded conversations",
        "Resolved 75% of this week's conversations"
      ],
      busiestHours: "10am-12pm and 2pm-4pm",
      topPages: ["/pricing — 3 conversations", "/contact — 1 conversation"],
      reportUrl: "https://usechatting.com/dashboard/analytics"
    });
    expect(mocks.insertWeeklyPerformanceDelivery).toHaveBeenCalledWith("user_1", "2026-03-23");
  });

  it("skips before the weekly send window and for already-sent reports", async () => {
    expect(shouldRunWeeklyPerformanceEmails(new Date("2026-03-30T08:59:00.000Z"))).toBe(false);
    expect(shouldRunWeeklyPerformanceEmails(new Date("2026-03-30T12:59:00.000Z"), "America/New_York")).toBe(false);
    await expect(
      runScheduledWeeklyPerformanceEmails(new Date("2026-03-30T08:59:00.000Z"))
    ).resolves.toEqual({ processedRecipients: 0, sent: 0, skipped: 0 });

    mocks.hasWeeklyPerformanceDelivery.mockResolvedValueOnce(true);
    await expect(
      sendUserWeeklyPerformanceEmail({
        userId: "user_1",
        notificationEmail: "team@example.com",
        timeZone: "UTC",
        now: new Date("2026-03-30T13:15:00.000Z")
      })
    ).resolves.toBe("already-sent");
  });

  it("uses the teammate timezone for the local week window", async () => {
    mocks.getAnalyticsDataset.mockResolvedValue({
      conversations: [
        conversation({ id: "conv_before", createdAt: "2026-03-23T03:30:00.000Z", firstResponseSeconds: 60 }),
        conversation({ id: "conv_1", createdAt: "2026-03-23T05:30:00.000Z", firstResponseSeconds: 180 }),
        conversation({ id: "conv_2", createdAt: "2026-03-24T14:00:00.000Z", pageUrl: "https://usechatting.com/contact", status: "resolved", firstResponseSeconds: 240 }),
        conversation({ id: "conv_3", createdAt: "2026-03-29T23:00:00.000Z", status: "resolved", firstResponseSeconds: 600 }),
        conversation({ id: "conv_prev", createdAt: "2026-03-17T15:00:00.000Z", firstResponseSeconds: 900 })
      ],
      replyEvents: []
    });

    await expect(
      sendUserWeeklyPerformanceEmail({
        userId: "user_1",
        notificationEmail: "team@example.com",
        timeZone: "America/New_York",
        now: new Date("2026-03-30T13:15:00.000Z")
      })
    ).resolves.toBe("sent");

    expect(mocks.sendWeeklyPerformanceEmail).toHaveBeenCalledWith({
      to: "team@example.com",
      dateRange: "Mar 23 - Mar 29",
      highlights: [
        "Conversation volume was up 50% from last week",
        "Replies were under 5 minutes for 67% of responded conversations",
        "Resolved 67% of this week's conversations"
      ],
      busiestHours: "1am-3am and 10am-12pm",
      topPages: ["/pricing — 2 conversations", "/contact — 1 conversation"],
      reportUrl: "https://usechatting.com/dashboard/analytics"
    });
    expect(mocks.insertWeeklyPerformanceDelivery).toHaveBeenCalledWith("user_1", "2026-03-23");
  });

  it("keeps going when one teammate's weekly email fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mocks.listWeeklyPerformanceRecipientRows.mockResolvedValue([
      { user_id: "user_1", email: "owner@example.com", notification_email: null, timezone: "UTC" },
      { user_id: "user_2", email: "member@example.com", notification_email: "team@example.com", timezone: "America/New_York" }
    ]);
    mocks.getAnalyticsDataset.mockResolvedValue({
      conversations: [conversation({ id: "conv_1", createdAt: "2026-03-24T10:00:00.000Z", firstResponseSeconds: 180 })],
      replyEvents: []
    });
    mocks.sendWeeklyPerformanceEmail.mockRejectedValueOnce(new Error("SEND_FAILED")).mockResolvedValueOnce(undefined);

    await expect(
      runScheduledWeeklyPerformanceEmails(new Date("2026-03-30T13:15:00.000Z"))
    ).resolves.toEqual({ processedRecipients: 2, sent: 1, skipped: 1 });

    expect(mocks.sendWeeklyPerformanceEmail).toHaveBeenCalledTimes(2);
    expect(mocks.insertWeeklyPerformanceDelivery).toHaveBeenCalledTimes(1);
    expect(mocks.insertWeeklyPerformanceDelivery).toHaveBeenCalledWith("user_2", "2026-03-23");
    expect(errorSpy).toHaveBeenCalledWith("weekly performance email failed", "user_1", expect.any(Error));
  });
});
