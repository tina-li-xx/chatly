const mocks = vi.hoisted(() => ({
  querySites: vi.fn(),
  mapSite: vi.fn((row) => row),
  findAuthUserById: vi.fn(),
  findNotificationSettingsRow: vi.fn(),
  getDashboardGrowthSnapshot: vi.fn(),
  getDashboardHomeResponseMetrics: vi.fn(),
  findGrowthEmailNudgeRow: vi.fn(),
  upsertGrowthEmailNudgeRow: vi.fn(),
  isSiteWidgetInstalled: vi.fn(),
  sendActivationReminderEmail: vi.fn(),
  sendHealthReminderEmail: vi.fn(),
  sendExpansionReminderEmail: vi.fn(),
  getDashboardBillingSummary: vi.fn()
}));

vi.mock("@/lib/data/shared", () => ({ querySites: mocks.querySites, mapSite: mocks.mapSite }));
vi.mock("@/lib/repositories/auth-repository", () => ({ findAuthUserById: mocks.findAuthUserById }));
vi.mock("@/lib/repositories/settings-repository", () => ({ findNotificationSettingsRow: mocks.findNotificationSettingsRow }));
vi.mock("@/lib/repositories/dashboard-growth-repository", () => ({ getDashboardGrowthSnapshot: mocks.getDashboardGrowthSnapshot }));
vi.mock("@/lib/repositories/dashboard-home-repository", () => ({ getDashboardHomeResponseMetrics: mocks.getDashboardHomeResponseMetrics }));
vi.mock("@/lib/repositories/growth-email-nudges-repository", () => ({
  findGrowthEmailNudgeRow: mocks.findGrowthEmailNudgeRow,
  upsertGrowthEmailNudgeRow: mocks.upsertGrowthEmailNudgeRow
}));
vi.mock("@/lib/site-installation", () => ({ isSiteWidgetInstalled: mocks.isSiteWidgetInstalled }));
vi.mock("@/lib/growth-outreach-email", () => ({
  sendActivationReminderEmail: mocks.sendActivationReminderEmail,
  sendHealthReminderEmail: mocks.sendHealthReminderEmail,
  sendExpansionReminderEmail: mocks.sendExpansionReminderEmail
}));
vi.mock("@/lib/data/billing", () => ({ getDashboardBillingSummary: mocks.getDashboardBillingSummary }));

import { maybeSendSiteLifecycleEmails, maybeSendTeamExpansionEmail } from "@/lib/growth-outreach";

describe("growth outreach orchestration", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => "mockReset" in mock && mock.mockReset());
  });

  it("sends the missed-first-day activation email once the widget is live with no conversations", async () => {
    mocks.querySites.mockResolvedValueOnce({ rows: [{ id: "site_1", userId: "user_1", name: "Acme", widgetLastSeenUrl: "/pricing" }] });
    mocks.findAuthUserById.mockResolvedValueOnce({ created_at: "2026-03-28T00:00:00.000Z" });
    mocks.findNotificationSettingsRow.mockResolvedValueOnce({
      email: "owner@chatting.example",
      notification_email: null,
      email_notifications: true
    });
    mocks.getDashboardGrowthSnapshot.mockResolvedValueOnce({
      total_conversations: "0",
      first_conversation_at: null,
      conversations_last_7_days: "0",
      conversations_previous_7_days: "0",
      login_sessions_last_7_days: "0",
      last_login_at: null
    });
    mocks.getDashboardHomeResponseMetrics.mockResolvedValueOnce({ current_avg_seconds: null });
    mocks.findGrowthEmailNudgeRow.mockResolvedValueOnce(null);
    mocks.isSiteWidgetInstalled.mockReturnValue(true);

    await maybeSendSiteLifecycleEmails("site_1");

    expect(mocks.sendActivationReminderEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "owner@chatting.example", mode: "missed" })
    );
    expect(mocks.upsertGrowthEmailNudgeRow).toHaveBeenCalledWith("user_1", "activation-missed-first-day");
  });

  it("sends the team expansion email when Starter adds more seats", async () => {
    mocks.findNotificationSettingsRow.mockResolvedValueOnce({
      email: "owner@chatting.example",
      notification_email: null,
      email_notifications: true
    });
    mocks.getDashboardBillingSummary.mockResolvedValueOnce({
      planKey: "starter",
      usedSeats: 2,
      conversationCount: 12
    });
    mocks.findGrowthEmailNudgeRow.mockResolvedValueOnce(null);

    await maybeSendTeamExpansionEmail("user_1");

    expect(mocks.sendExpansionReminderEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "owner@chatting.example", mode: "team" })
    );
    expect(mocks.upsertGrowthEmailNudgeRow).toHaveBeenCalledWith("user_1", "expansion-team");
  });
});
