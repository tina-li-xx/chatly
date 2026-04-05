const mocks = vi.hoisted(() => ({
  claimDailyDigestDelivery: vi.fn(),
  getAnalyticsDatasetForOwnerUserId: vi.fn(),
  getPublicAppUrl: vi.fn(),
  listDailyDigestRecipientRows: vi.fn(),
  mapSummary: vi.fn((row) => row),
  queryConversationSummaries: vi.fn(),
  releaseDailyDigestDelivery: vi.fn(),
  sendDailyDigestEmail: vi.fn()
}));

vi.mock("@/lib/chatly-notification-email-senders", () => ({
  sendDailyDigestEmail: mocks.sendDailyDigestEmail
}));
vi.mock("@/lib/data/analytics", () => ({
  getAnalyticsDatasetForOwnerUserId: mocks.getAnalyticsDatasetForOwnerUserId
}));
vi.mock("@/lib/data/shared", () => ({
  mapSummary: mocks.mapSummary,
  queryConversationSummaries: mocks.queryConversationSummaries
}));
vi.mock("@/lib/env", () => ({
  getPublicAppUrl: mocks.getPublicAppUrl
}));
vi.mock("@/lib/repositories/daily-digest-repository", () => ({
  claimDailyDigestDelivery: mocks.claimDailyDigestDelivery,
  listDailyDigestRecipientRows: mocks.listDailyDigestRecipientRows,
  releaseDailyDigestDelivery: mocks.releaseDailyDigestDelivery
}));

import { runScheduledDailyDigests } from "@/lib/daily-digest";
import { openConversation } from "@/lib/__tests__/daily-digest-test-fixtures";

describe("daily digest runner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T13:15:00.000Z"));
    mocks.getPublicAppUrl.mockReturnValue("https://usechatting.com");
    mocks.claimDailyDigestDelivery.mockResolvedValue(true);
    mocks.getAnalyticsDatasetForOwnerUserId.mockResolvedValue({ conversations: [], replyEvents: [] });
    mocks.queryConversationSummaries.mockResolvedValue({
      rows: [openConversation]
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("continues sending other teammate digests when one recipient fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mocks.listDailyDigestRecipientRows.mockResolvedValue([
      { user_id: "user_1", owner_user_id: "owner_1", email: "owner@example.com", notification_email: null, timezone: "UTC" },
      { user_id: "user_2", owner_user_id: "owner_2", email: "member@example.com", notification_email: "team@example.com", timezone: "UTC" }
    ]);
    mocks.sendDailyDigestEmail.mockRejectedValueOnce(new Error("SEND_FAILED")).mockResolvedValueOnce(undefined);

    await expect(runScheduledDailyDigests(new Date("2026-03-30T13:15:00.000Z"))).resolves.toEqual({
      processedRecipients: 2,
      sent: 1,
      skipped: 1
    });

    expect(mocks.sendDailyDigestEmail).toHaveBeenCalledTimes(2);
    expect(mocks.claimDailyDigestDelivery).toHaveBeenCalledTimes(2);
    expect(mocks.releaseDailyDigestDelivery).toHaveBeenCalledTimes(1);
    expect(mocks.releaseDailyDigestDelivery).toHaveBeenCalledWith("user_1", "owner_1", "2026-03-29");
    expect(errorSpy).toHaveBeenCalledWith("daily digest send failed", "user_1", "owner_1", expect.any(Error));
  });
});
