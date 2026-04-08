const mocks = vi.hoisted(() => ({
  findAuthUserById: vi.fn(),
  findBillingAccountRow: vi.fn(),
  findBillingUsageRow: vi.fn(),
  countActiveTeamMembershipRows: vi.fn(),
  getGrowthDeliverySettings: vi.fn(),
  maybeSendGrowthEmail: vi.fn(),
  sendTrialEndingReminderEmail: vi.fn(),
  sendTrialExpiredEmail: vi.fn(),
  getPublicAppUrl: vi.fn(() => "https://usechatting.com")
}));

vi.mock("@/lib/repositories/auth-repository", () => ({
  findAuthUserById: mocks.findAuthUserById
}));
vi.mock("@/lib/repositories/billing-repository", () => ({
  findBillingAccountRow: mocks.findBillingAccountRow,
  findBillingUsageRow: mocks.findBillingUsageRow
}));
vi.mock("@/lib/repositories/workspace-repository", () => ({
  countActiveTeamMembershipRows: mocks.countActiveTeamMembershipRows
}));
vi.mock("@/lib/growth-outreach-shared", () => ({
  getGrowthDeliverySettings: mocks.getGrowthDeliverySettings,
  maybeSendGrowthEmail: mocks.maybeSendGrowthEmail
}));
vi.mock("@/lib/chatting-marketing-email-senders", () => ({
  sendTrialEndingReminderEmail: mocks.sendTrialEndingReminderEmail,
  sendTrialExpiredEmail: mocks.sendTrialExpiredEmail
}));
vi.mock("@/lib/env", () => ({
  getPublicAppUrl: mocks.getPublicAppUrl
}));

import {
  maybeSendTrialEndingReminder,
  maybeSendTrialExpiredEmail
} from "@/lib/growth-trial-outreach";

describe("growth trial outreach", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findAuthUserById.mockResolvedValue({
      id: "user_1",
      email: "tina@usechatting.com"
    });
    mocks.getGrowthDeliverySettings.mockResolvedValue({
      emailNotifications: true,
      notificationEmail: "tina@usechatting.com"
    });
    mocks.maybeSendGrowthEmail.mockImplementation(async (_userId, _key, _hours, send) => {
      await send();
    });
  });

  it("sends a trial-ending reminder once a growth trial enters the 3-day window", async () => {
    mocks.findBillingAccountRow.mockResolvedValue({
      plan_key: "growth",
      trial_ends_at: "2026-04-04T12:00:00.000Z"
    });
    mocks.findBillingUsageRow.mockResolvedValue({
      conversation_count: "12",
      site_count: "2"
    });
    mocks.countActiveTeamMembershipRows.mockResolvedValue(2);

    await maybeSendTrialEndingReminder("user_1", new Date("2026-04-01T12:00:00.000Z"));

    expect(mocks.maybeSendGrowthEmail).toHaveBeenCalledWith(
      "user_1",
      "trial-ending-2026-04-04",
      expect.any(Number),
      expect.any(Function)
    );
    expect(mocks.sendTrialEndingReminderEmail).toHaveBeenCalledWith({
      to: "tina@usechatting.com",
      firstName: "Tina",
      endDate: "4 April 2026",
      metrics: [
        { value: "12", label: "conversations" },
        { value: "2", label: "sites" },
        { value: "3", label: "teammates" }
      ],
      upgradeUrl: "https://usechatting.com/dashboard/settings?section=billing"
    });
  });

  it("skips trial-ending reminders outside the active window or when delivery is disabled", async () => {
    mocks.findBillingAccountRow.mockResolvedValue({
      plan_key: "growth",
      trial_ends_at: "2026-04-08T12:00:00.000Z"
    });

    await maybeSendTrialEndingReminder("user_1", new Date("2026-04-01T12:00:00.000Z"));

    mocks.getGrowthDeliverySettings.mockResolvedValueOnce({
      emailNotifications: false,
      notificationEmail: "tina@usechatting.com"
    });
    await maybeSendTrialEndingReminder("user_1", new Date("2026-04-06T12:00:00.000Z"));

    expect(mocks.sendTrialEndingReminderEmail).not.toHaveBeenCalled();
  });

  it("sends a post-downgrade trial-expired email", async () => {
    await maybeSendTrialExpiredEmail({
      userId: "user_1",
      trialEndedAt: "2026-04-01T09:00:00.000Z"
    });

    expect(mocks.maybeSendGrowthEmail).toHaveBeenCalledWith(
      "user_1",
      "trial-expired-2026-04-01",
      expect.any(Number),
      expect.any(Function)
    );
    expect(mocks.sendTrialExpiredEmail).toHaveBeenCalledWith({
      to: "tina@usechatting.com",
      firstName: "Tina",
      reactivateUrl: "https://usechatting.com/dashboard/settings?section=billing"
    });
  });
});
