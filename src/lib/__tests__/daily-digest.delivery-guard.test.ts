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

vi.mock("@/lib/chatting-notification-email-senders", () => ({ sendDailyDigestEmail: mocks.sendDailyDigestEmail }));
vi.mock("@/lib/data/analytics", () => ({ getAnalyticsDatasetForOwnerUserId: mocks.getAnalyticsDatasetForOwnerUserId }));
vi.mock("@/lib/data/shared", () => ({ mapSummary: mocks.mapSummary, queryConversationSummaries: mocks.queryConversationSummaries }));
vi.mock("@/lib/env", () => ({ getPublicAppUrl: mocks.getPublicAppUrl }));
vi.mock("@/lib/repositories/daily-digest-repository", () => ({
  claimDailyDigestDelivery: mocks.claimDailyDigestDelivery,
  listDailyDigestRecipientRows: mocks.listDailyDigestRecipientRows,
  releaseDailyDigestDelivery: mocks.releaseDailyDigestDelivery
}));

import { sendUserDailyDigest } from "@/lib/daily-digest";
import { openConversation } from "@/lib/__tests__/daily-digest-test-fixtures";

describe("daily digest delivery guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T13:15:00.000Z"));
    mocks.getPublicAppUrl.mockReturnValue("https://usechatting.com");
    mocks.getAnalyticsDatasetForOwnerUserId.mockResolvedValue({ conversations: [], replyEvents: [] });
    mocks.queryConversationSummaries.mockResolvedValue({ rows: [openConversation] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("releases a claimed delivery when email sending fails", async () => {
    mocks.claimDailyDigestDelivery.mockResolvedValueOnce(true);
    mocks.sendDailyDigestEmail.mockRejectedValueOnce(new Error("SEND_FAILED"));

    await expect(
      sendUserDailyDigest({
        userId: "user_1",
        ownerUserId: "owner_1",
        notificationEmail: "team@example.com",
        now: new Date("2026-03-30T13:15:00.000Z")
      })
    ).rejects.toThrow("SEND_FAILED");

    expect(mocks.releaseDailyDigestDelivery).toHaveBeenCalledWith("user_1", "owner_1", "2026-03-29");
  });
});
