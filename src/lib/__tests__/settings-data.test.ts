const mocks = vi.hoisted(() => ({
  changeUserPassword: vi.fn(),
  findDashboardSettingsRow: vi.fn(),
  findDashboardReportSettingsRow: vi.fn(),
  findEmailTemplateSettingsRow: vi.fn(),
  findBillingSummaryRow: vi.fn(),
  findNotificationSettingsRow: vi.fn(),
  findUserIdByEmailExcludingUser: vi.fn(),
  countHelpCenterArticleRows: vi.fn(),
  getDashboardContactSettings: vi.fn(),
  updateDashboardContactSettings: vi.fn(),
  listHelpCenterArticleRows: vi.fn(),
  getDashboardBillingSummary: vi.fn(),
  getDashboardSettingsBillingSnapshot: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  listSavedReplyRows: vi.fn(),
  listActiveTeamMemberRows: vi.fn(),
  listPendingTeamInviteRows: vi.fn(),
  listSitesForUser: vi.fn(),
  parseDashboardEmailTemplates: vi.fn(),
  seatCountFromActiveMemberships: vi.fn(),
  serializeDashboardEmailTemplates: vi.fn(),
  updateSiteName: vi.fn(),
  updateSiteWidgetSettings: vi.fn(),
  updateSettingsUserEmail: vi.fn(),
  upsertDashboardReportUserSettings: vi.fn(),
  upsertUserSettingsRecord: vi.fn(),
  upsertWorkspaceAutomationSettings: vi.fn(),
  upsertWorkspaceReportSettings: vi.fn()
}));

vi.mock("@/lib/auth", () => ({ changeUserPassword: mocks.changeUserPassword }));
vi.mock("@/lib/billing-seats", () => ({ seatCountFromActiveMemberships: mocks.seatCountFromActiveMemberships }));
vi.mock("@/lib/chatly-transactional-email-senders", () => ({ sendTeamInvitationEmail: vi.fn() }));
vi.mock("@/lib/data/billing", () => ({ getDashboardBillingSummary: mocks.getDashboardBillingSummary }));
vi.mock("@/lib/data/contacts", () => ({
  getDashboardContactSettings: mocks.getDashboardContactSettings,
  updateDashboardContactSettings: mocks.updateDashboardContactSettings
}));
vi.mock("@/lib/data/settings-billing-snapshot", () => ({
  getDashboardSettingsBillingSnapshot: mocks.getDashboardSettingsBillingSnapshot
}));
vi.mock("@/lib/email-templates", () => ({ parseDashboardEmailTemplates: mocks.parseDashboardEmailTemplates, serializeDashboardEmailTemplates: mocks.serializeDashboardEmailTemplates }));
vi.mock("@/lib/env", () => ({ getPublicAppUrl: () => "https://app.example" }));
vi.mock("@/lib/growth-outreach", () => ({ maybeSendTeamExpansionEmail: vi.fn() }));
vi.mock("@/lib/repositories/report-settings-repository", () => ({
  findDashboardReportSettingsRow: mocks.findDashboardReportSettingsRow,
  upsertDashboardReportUserSettings: mocks.upsertDashboardReportUserSettings,
  upsertWorkspaceReportSettings: mocks.upsertWorkspaceReportSettings
}));
vi.mock("@/lib/repositories/help-center-repository", () => ({
  countHelpCenterArticleRows: mocks.countHelpCenterArticleRows,
  listHelpCenterArticleRows: mocks.listHelpCenterArticleRows
}));
vi.mock("@/lib/repositories/settings-repository", () => ({
  findDashboardSettingsRow: mocks.findDashboardSettingsRow,
  findBillingSummaryRow: mocks.findBillingSummaryRow,
  findEmailTemplateSettingsRow: mocks.findEmailTemplateSettingsRow,
  findNotificationSettingsRow: mocks.findNotificationSettingsRow,
  findUserIdByEmailExcludingUser: mocks.findUserIdByEmailExcludingUser,
  insertTeamInviteRecord: vi.fn(),
  listPendingTeamInviteRows: mocks.listPendingTeamInviteRows,
  revokePendingTeamInvite: vi.fn(),
  touchPendingTeamInvite: vi.fn(),
  updatePendingTeamInviteRole: vi.fn(),
  updateSettingsUserEmail: mocks.updateSettingsUserEmail,
  upsertUserSettingsRecord: mocks.upsertUserSettingsRecord,
  upsertWorkspaceAutomationSettings: mocks.upsertWorkspaceAutomationSettings
}));
vi.mock("@/lib/repositories/saved-replies-repository", () => ({ listSavedReplyRows: mocks.listSavedReplyRows }));
vi.mock("@/lib/repositories/workspace-repository", () => ({
  countActiveTeamMembershipRows: vi.fn(),
  listActiveTeamMemberRows: mocks.listActiveTeamMemberRows
}));
vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));
vi.mock("@/lib/data/sites", () => ({
  listSitesForUser: mocks.listSitesForUser,
  updateSiteName: mocks.updateSiteName,
  updateSiteWidgetSettings: mocks.updateSiteWidgetSettings
}));

import { getDashboardEmailTemplateSettings, getDashboardNotificationDeliverySettings, getDashboardNotificationSettings, getDashboardSettingsData, updateDashboardSettings } from "@/lib/data/settings";
import { createDefaultDashboardAutomationSettings } from "@/lib/data/settings-automation";

const billing = { planKey: "starter", planName: "Starter", priceLabel: "$0/month" } as never;
const operatingHours = {
  monday: { enabled: true, from: "09:00", to: "18:00" },
  tuesday: { enabled: true, from: "09:00", to: "18:00" },
  wednesday: { enabled: true, from: "09:00", to: "18:00" },
  thursday: { enabled: true, from: "09:00", to: "18:00" },
  friday: { enabled: true, from: "09:00", to: "18:00" },
  saturday: { enabled: false, from: "09:00", to: "18:00" },
  sunday: { enabled: false, from: "09:00", to: "18:00" }
};

function site(overrides: Record<string, unknown> = {}) {
  return {
    id: "site_1",
    name: "Chatting Team",
    domain: "https://chatting.example",
    brandColor: "#2563EB",
    widgetTitle: "Chatting Team",
    greetingText: "Hi! How can we help you today?",
    launcherPosition: "right",
    avatarStyle: "initials",
    showOnlineStatus: true,
    requireEmailOffline: true,
    offlineTitle: "Offline",
    offlineMessage: "Leave your email and we'll get back to you shortly.",
    awayTitle: "Away",
    awayMessage: "Thanks for reaching out!",
    soundNotifications: true,
    autoOpenPaths: ["/pricing"],
    responseTimeMode: "minutes",
    operatingHoursEnabled: true,
    operatingHoursTimezone: "Europe/London",
    operatingHours,
    ...overrides
  };
}

function settingsRow(overrides: Record<string, unknown> = {}) {
  return {
    user_id: "user_1",
    email: "tina@usechatting.com",
    created_at: "2026-03-29T00:00:00.000Z",
    first_name: "Tina",
    last_name: "Bauer",
    job_title: "Founder",
    avatar_data_url: null,
    notification_email: null,
    reply_to_email: null,
    email_templates_json: "[]",
    browser_notifications: true,
    sound_alerts: true,
    email_notifications: true,
    new_visitor_alerts: false,
    high_intent_alerts: true,
    workspace_automation_settings_json: "",
    email_signature: "Best,\nChatting",
    last_seen_at: "2026-03-29T11:58:30.000Z",
    ...overrides
  };
}

describe("settings data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(new Date("2026-03-29T12:00:00.000Z").getTime());
    mocks.findNotificationSettingsRow.mockResolvedValue(settingsRow());
    mocks.findEmailTemplateSettingsRow.mockResolvedValue(settingsRow());
    mocks.findDashboardSettingsRow.mockResolvedValue(settingsRow());
    mocks.findBillingSummaryRow.mockResolvedValue({ site_count: 1 });
    mocks.findDashboardReportSettingsRow.mockResolvedValue(null);
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1", role: "owner" });
    mocks.getDashboardContactSettings.mockResolvedValue({
      planKey: "starter",
      settings: { statuses: [], customFields: [], dataRetention: "forever" },
      limits: {
        fullProfiles: true,
        exportEnabled: false,
        apiEnabled: false,
        customStatusesLimit: 1,
        customFieldsLimit: 1
      }
    });
    mocks.updateDashboardContactSettings.mockResolvedValue({
      statuses: [],
      customFields: [],
      dataRetention: "forever"
    });
    mocks.listSavedReplyRows.mockResolvedValue([{ tags: ["pricing", "sales"] }]);
    mocks.countHelpCenterArticleRows.mockResolvedValue(3);
    mocks.listHelpCenterArticleRows.mockResolvedValue([{ id: "article_1", title: "Reset password", slug: "reset-password", body: "Click forgot password", updated_at: "2026-03-29T10:00:00.000Z" }]);
    mocks.listPendingTeamInviteRows.mockResolvedValue([]);
    mocks.listActiveTeamMemberRows.mockResolvedValue([{ user_id: "user_2", email: "alex@usechatting.com", first_name: "Alex", last_name: "Rivera", role: "admin", last_seen_at: "2026-03-29T11:40:00.000Z", avatar_data_url: null }]);
    mocks.listSitesForUser.mockResolvedValue([site()]);
    mocks.seatCountFromActiveMemberships.mockReturnValue(2);
    mocks.getDashboardBillingSummary.mockResolvedValue(billing);
    mocks.getDashboardSettingsBillingSnapshot.mockResolvedValue(billing);
    mocks.parseDashboardEmailTemplates.mockReturnValue([{ id: "welcome" }]);
    mocks.serializeDashboardEmailTemplates.mockReturnValue('[{"id":"welcome"}]');
    mocks.findUserIdByEmailExcludingUser.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns notification settings with sensible email fallback", async () => {
    await expect(getDashboardNotificationSettings("user_1")).resolves.toEqual({
      browserNotifications: true,
      soundAlerts: true,
      emailNotifications: true,
      newVisitorAlerts: false,
      highIntentAlerts: true
    });
    await expect(getDashboardNotificationDeliverySettings("user_1")).resolves.toEqual({
      browserNotifications: true,
      soundAlerts: true,
      emailNotifications: true,
      newVisitorAlerts: false,
      highIntentAlerts: true,
      notificationEmail: "tina@usechatting.com"
    });
  });

  it("returns email template settings with parsed templates", async () => {
    const settings = await getDashboardEmailTemplateSettings("user_1");

    expect(settings.profile).toMatchObject({
      firstName: "Tina",
      lastName: "Bauer",
      email: "tina@usechatting.com"
    });
    expect(settings.email).toMatchObject({
      notificationEmail: "tina@usechatting.com",
      replyToEmail: "tina@usechatting.com",
      templates: [{ id: "welcome" }],
      emailSignature: "Best,\nChatting"
    });
  });

  it("builds the combined dashboard settings payload for a workspace member", async () => {
    mocks.getWorkspaceAccess.mockResolvedValueOnce({ ownerUserId: "owner_1", role: "member" });
    mocks.findDashboardSettingsRow.mockResolvedValueOnce(settingsRow()).mockResolvedValueOnce(settingsRow({ user_id: "owner_1", email: "owner@usechatting.com", first_name: "Owner", last_name: "Person" }));

    const data = await getDashboardSettingsData("user_1");

    expect(mocks.getDashboardBillingSummary).toHaveBeenCalledWith("owner_1", 2);
    expect(mocks.listHelpCenterArticleRows).not.toHaveBeenCalled();
    expect(data.profile.email).toBe("tina@usechatting.com");
    expect(data.teamName).toBe("Chatting Team");
    expect(data.reports).toEqual(expect.objectContaining({ weeklyReportEnabled: true, canManageWorkspaceReports: false }));
    expect(data.automationContext).toEqual(expect.objectContaining({
      brandColor: "#2563EB",
      widgetTitle: "Chatting Team",
      helpCenterPath: "/help/site_1",
      helpCenterArticleCount: 3
    }));
    expect(data.teamMembers).toEqual([
      expect.objectContaining({ id: "owner_1", role: "owner", status: "online", isCurrentUser: false }),
      expect.objectContaining({ id: "user_2", role: "admin", status: "offline", isCurrentUser: false })
    ]);
    expect(data.billing).toBe(billing);
  });

  it("updates the user settings record and changes the password when requested", async () => {
    mocks.findDashboardSettingsRow.mockResolvedValue(settingsRow({ email: "new@usechatting.com" }));

    const result = await updateDashboardSettings("user_1", {
      profile: { firstName: "Tina", lastName: "Bauer", email: "new@usechatting.com", jobTitle: "Founder", avatarDataUrl: null },
      teamName: "Chatting Support",
      notifications: { browserNotifications: true, soundAlerts: false, emailNotifications: true, newVisitorAlerts: true, highIntentAlerts: true },
      email: { notificationEmail: "team@usechatting.com", replyToEmail: "reply@usechatting.com", templates: [{ id: "welcome" }] as never, emailSignature: "Best,\nTina" },
      reports: {
        weeklyReportEnabled: true,
        weeklyReportSendTime: "11:30",
        weeklyReportIncludePersonalStats: true,
        workspaceWeeklyReportsEnabled: true,
        workspaceIncludeTeamLeaderboard: true,
        workspaceAiInsightsEnabled: true
      },
      password: { currentPassword: "old", newPassword: "new-pass", confirmPassword: "new-pass" }
    });

    expect(mocks.updateSettingsUserEmail).toHaveBeenCalledWith("user_1", "new@usechatting.com");
    expect(mocks.upsertUserSettingsRecord).toHaveBeenCalledWith(expect.objectContaining({ userId: "user_1", notificationEmail: "team@usechatting.com", replyToEmail: "reply@usechatting.com", emailTemplatesJson: '[{"id":"welcome"}]' }));
    expect(mocks.upsertDashboardReportUserSettings).toHaveBeenCalledWith({
      userId: "user_1",
      weeklyReportEnabled: true,
      weeklyReportSendHour: 11,
      weeklyReportSendMinute: 30,
      weeklyReportIncludePersonalStats: true
    });
    expect(mocks.upsertWorkspaceReportSettings).toHaveBeenCalledWith({
      ownerUserId: "owner_1",
      weeklyReportsEnabled: true,
      includeTeamLeaderboard: true,
      aiInsightsEnabled: true
    });
    expect(mocks.updateSiteName).toHaveBeenCalledWith("site_1", "Chatting Support", "user_1");
    expect(mocks.changeUserPassword).toHaveBeenCalledWith("user_1", "old", "new-pass");
    expect(result.profile.email).toBe("new@usechatting.com");
  });

  it("persists workspace automation settings and syncs overlapping widget behavior", async () => {
    const automation = createDefaultDashboardAutomationSettings({ requireEmailWhenOffline: true, expectedReplyTimeOnline: "hours" });
    automation.offline.autoReplyMessage = "We'll be back soon.";
    automation.offline.leadCapture.formMessage = "Leave your email and we'll get back to you.";

    await updateDashboardSettings("user_1", {
      profile: { firstName: "Tina", lastName: "Bauer", email: "tina@usechatting.com", jobTitle: "Founder", avatarDataUrl: null },
      notifications: { browserNotifications: true, soundAlerts: true, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: true },
      email: { notificationEmail: "team@usechatting.com", replyToEmail: "reply@usechatting.com", templates: [] as never, emailSignature: "Best,\nTina" },
      automation
    });

    expect(mocks.upsertWorkspaceAutomationSettings).toHaveBeenCalledWith("owner_1", expect.any(String));
    expect(mocks.updateSiteWidgetSettings).toHaveBeenCalledWith(
      "site_1",
      "user_1",
      expect.objectContaining({
        requireEmailOffline: true,
        responseTimeMode: "hours",
        awayMessage: "We'll be back soon.",
        offlineMessage: "Leave your email and we'll get back to you."
      })
    );
  });
});
