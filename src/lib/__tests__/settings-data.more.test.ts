const mocks = vi.hoisted(() => ({
  changeUserPassword: vi.fn(),
  countActiveTeamMembershipRows: vi.fn(),
  countHelpCenterArticleRows: vi.fn(),
  findDashboardSettingsRow: vi.fn(),
  findDashboardReportSettingsRow: vi.fn(),
  findEmailTemplateSettingsRow: vi.fn(),
  findBillingSummaryRow: vi.fn(),
  findNotificationSettingsRow: vi.fn(),
  findWorkspaceAiAssistSettingsValue: vi.fn(),
  findUserIdByEmailExcludingUser: vi.fn(),
  getDashboardContactSettings: vi.fn(),
  getDashboardBillingSummary: vi.fn(),
  getDashboardSettingsBillingSnapshot: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  insertTeamInviteRecord: vi.fn(),
  listSavedReplyRows: vi.fn(),
  listActiveTeamMemberRows: vi.fn(),
  listPendingTeamInviteRows: vi.fn(),
  listSitesForUser: vi.fn(),
  maybeSendTeamExpansionEmail: vi.fn(),
  parseDashboardEmailTemplates: vi.fn(),
  sendTeamInvitationEmail: vi.fn(),
  seatCountFromActiveMemberships: vi.fn(),
  serializeDashboardEmailTemplates: vi.fn(),
  touchPendingTeamInvite: vi.fn(),
  updateSiteName: vi.fn(),
  updateSiteWidgetSettings: vi.fn(),
  updatePendingTeamInviteRole: vi.fn(),
  upsertDashboardReportUserSettings: vi.fn(),
  updateSettingsUserEmail: vi.fn(),
  upsertWorkspaceAiAssistSettings: vi.fn(),
  upsertUserSettingsRecord: vi.fn(),
  upsertWorkspaceAutomationSettings: vi.fn(),
  upsertWorkspaceReportSettings: vi.fn(),
  revokePendingTeamInvite: vi.fn()
}));

vi.mock("node:crypto", async () => {
  const actual = await vi.importActual<typeof import("node:crypto")>("node:crypto");
  return { ...actual, randomUUID: () => "invite_123" };
});
vi.mock("@/lib/auth", () => ({ changeUserPassword: mocks.changeUserPassword }));
vi.mock("@/lib/billing-seats", () => ({ seatCountFromActiveMemberships: mocks.seatCountFromActiveMemberships }));
vi.mock("@/lib/chatting-transactional-email-senders", () => ({ sendTeamInvitationEmail: mocks.sendTeamInvitationEmail }));
vi.mock("@/lib/data/billing", () => ({ getDashboardBillingSummary: mocks.getDashboardBillingSummary }));
vi.mock("@/lib/data/contacts", () => ({
  getDashboardContactSettings: mocks.getDashboardContactSettings,
  updateDashboardContactSettings: vi.fn()
}));
vi.mock("@/lib/data/settings-billing-snapshot", () => ({
  getDashboardSettingsBillingSnapshot: mocks.getDashboardSettingsBillingSnapshot
}));
vi.mock("@/lib/email-templates", () => ({
  parseDashboardEmailTemplates: mocks.parseDashboardEmailTemplates,
  serializeDashboardEmailTemplates: mocks.serializeDashboardEmailTemplates
}));
vi.mock("@/lib/env", () => ({ getPublicAppUrl: () => "https://app.example" }));
vi.mock("@/lib/growth-outreach", () => ({ maybeSendTeamExpansionEmail: mocks.maybeSendTeamExpansionEmail }));
vi.mock("@/lib/repositories/report-settings-repository", () => ({
  findDashboardReportSettingsRow: mocks.findDashboardReportSettingsRow,
  upsertDashboardReportUserSettings: mocks.upsertDashboardReportUserSettings,
  upsertWorkspaceReportSettings: mocks.upsertWorkspaceReportSettings
}));
vi.mock("@/lib/repositories/help-center-repository", () => ({
  countHelpCenterArticleRows: mocks.countHelpCenterArticleRows
}));
vi.mock("@/lib/repositories/settings-repository", () => ({
  findBillingSummaryRow: mocks.findBillingSummaryRow,
  findDashboardSettingsRow: mocks.findDashboardSettingsRow,
  findEmailTemplateSettingsRow: mocks.findEmailTemplateSettingsRow,
  findNotificationSettingsRow: mocks.findNotificationSettingsRow,
  findUserIdByEmailExcludingUser: mocks.findUserIdByEmailExcludingUser,
  insertTeamInviteRecord: mocks.insertTeamInviteRecord,
  listPendingTeamInviteRows: mocks.listPendingTeamInviteRows,
  revokePendingTeamInvite: mocks.revokePendingTeamInvite,
  touchPendingTeamInvite: mocks.touchPendingTeamInvite,
  updatePendingTeamInviteRole: mocks.updatePendingTeamInviteRole,
  updateSettingsUserEmail: mocks.updateSettingsUserEmail,
  upsertUserSettingsRecord: mocks.upsertUserSettingsRecord,
  upsertWorkspaceAutomationSettings: mocks.upsertWorkspaceAutomationSettings
}));
vi.mock("@/lib/repositories/ai-assist-settings-repository", () => ({
  findWorkspaceAiAssistSettingsValue: mocks.findWorkspaceAiAssistSettingsValue,
  upsertWorkspaceAiAssistSettings: mocks.upsertWorkspaceAiAssistSettings
}));
vi.mock("@/lib/repositories/saved-replies-repository", () => ({ listSavedReplyRows: mocks.listSavedReplyRows }));
vi.mock("@/lib/repositories/workspace-repository", () => ({
  countActiveTeamMembershipRows: mocks.countActiveTeamMembershipRows,
  listActiveTeamMemberRows: mocks.listActiveTeamMemberRows
}));
vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));
vi.mock("@/lib/data/sites", () => ({
  listSitesForUser: mocks.listSitesForUser,
  updateSiteName: mocks.updateSiteName,
  updateSiteWidgetSettings: mocks.updateSiteWidgetSettings
}));

import {
  createTeamInvite,
  getDashboardEmailTemplateSettings,
  getDashboardNotificationSettings,
  getDashboardSettingsData,
  resendTeamInvite,
  updateDashboardSettings
} from "@/lib/data/settings";

function settingsRow(overrides: Record<string, unknown> = {}) {
  return {
    user_id: "user_1",
    email: "tina@usechatting.com",
    first_name: null,
    last_name: null,
    job_title: null,
    avatar_data_url: null,
    notification_email: null,
    reply_to_email: null,
    email_templates_json: "[]",
    browser_notifications: null,
    sound_alerts: null,
    email_notifications: null,
    new_visitor_alerts: null,
    high_intent_alerts: null,
    workspace_automation_settings_json: "",
    email_signature: null,
    last_seen_at: "2026-03-30T11:59:30.000Z",
    ...overrides
  };
}

describe("settings data more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(new Date("2026-03-30T12:00:00.000Z").getTime());
    mocks.findNotificationSettingsRow.mockResolvedValue(settingsRow());
    mocks.findEmailTemplateSettingsRow.mockResolvedValue(settingsRow());
    mocks.findDashboardSettingsRow.mockResolvedValue(settingsRow());
    mocks.findBillingSummaryRow.mockResolvedValue({ site_count: 0 });
    mocks.findDashboardReportSettingsRow.mockResolvedValue(null);
    mocks.findWorkspaceAiAssistSettingsValue.mockResolvedValue("");
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "user_1", role: "owner" });
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
    mocks.listSavedReplyRows.mockResolvedValue([]);
    mocks.countHelpCenterArticleRows.mockResolvedValue(0);
    mocks.listPendingTeamInviteRows.mockResolvedValue([
      { id: "invite_1", email: "pending@example.com", role: "member", status: "pending", message: "", created_at: "2026-03-29T10:00:00.000Z", updated_at: "2026-03-29T10:01:00.000Z" },
      { id: "invite_2", email: "accepted@example.com", role: "member", status: "accepted", message: "", created_at: "2026-03-29T10:00:00.000Z", updated_at: "2026-03-29T10:01:00.000Z" }
    ]);
    mocks.listActiveTeamMemberRows.mockResolvedValue([
      { user_id: "u_never", email: "never@example.com", first_name: null, last_name: null, role: "member", last_seen_at: null, avatar_data_url: null },
      { user_id: "u_minutes", email: "minutes@example.com", first_name: "Minute", last_name: "", role: "member", last_seen_at: "2026-03-30T11:30:00.000Z", avatar_data_url: null },
      { user_id: "u_hours", email: "hours@example.com", first_name: "Hour", last_name: "", role: "admin", last_seen_at: "2026-03-30T07:00:00.000Z", avatar_data_url: null },
      { user_id: "u_date", email: "date@example.com", first_name: "Date", last_name: "", role: "member", last_seen_at: "2026-03-01T07:00:00.000Z", avatar_data_url: null }
    ]);
    mocks.seatCountFromActiveMemberships.mockReturnValue(5);
    mocks.getDashboardBillingSummary.mockResolvedValue({ planKey: "starter" });
    mocks.getDashboardSettingsBillingSnapshot.mockResolvedValue({ planKey: "starter" });
    mocks.parseDashboardEmailTemplates.mockReturnValue([]);
    mocks.serializeDashboardEmailTemplates.mockReturnValue("[]");
    mocks.findUserIdByEmailExcludingUser.mockResolvedValue(null);
    mocks.listSitesForUser.mockResolvedValue([]);
    mocks.countActiveTeamMembershipRows.mockResolvedValue(2);
    mocks.sendTeamInvitationEmail.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when notification or email template rows are missing", async () => {
    mocks.findNotificationSettingsRow.mockResolvedValueOnce(null);
    await expect(getDashboardNotificationSettings("user_1")).rejects.toThrow("User not found.");

    mocks.findEmailTemplateSettingsRow.mockResolvedValueOnce(null);
    await expect(getDashboardEmailTemplateSettings("user_1")).rejects.toThrow("User not found.");
  });

  it("builds owner settings with fallback names, invite filtering, and relative activity labels", async () => {
    const data = await getDashboardSettingsData("user_1");

    expect(mocks.getDashboardBillingSummary).toHaveBeenCalledWith("user_1", 5);
    expect(data.teamName).toBe("Tina Team");
    expect(data.notifications).toEqual({
      browserNotifications: true,
      soundAlerts: true,
      emailNotifications: true,
      newVisitorAlerts: false,
      highIntentAlerts: true
    });
    expect(data.reports).toEqual(expect.objectContaining({ weeklyReportSendTime: "09:00", canManageWorkspaceReports: true }));
    expect(data.teamInvites).toEqual([]);
    expect(data.teamMembers.map((member) => member.lastActiveLabel)).toEqual([
      "Just now",
      "Never",
      "30m ago",
      "5h ago",
      "1 Mar"
    ]);
  });

  it("validates update flows and invite email fallbacks", async () => {
    await expect(
      updateDashboardSettings("user_1", {
        profile: { firstName: "", lastName: "", email: "   ", jobTitle: "", avatarDataUrl: null },
        notifications: { browserNotifications: true, soundAlerts: true, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: true },
        email: { notificationEmail: "", replyToEmail: "", templates: [] as never, emailSignature: "" }
      })
    ).rejects.toThrow("MISSING_EMAIL");

    mocks.findUserIdByEmailExcludingUser.mockResolvedValueOnce("user_2");
    await expect(
      updateDashboardSettings("user_1", {
        profile: { firstName: "", lastName: "", email: "taken@usechatting.com", jobTitle: "", avatarDataUrl: null },
        notifications: { browserNotifications: true, soundAlerts: true, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: true },
        email: { notificationEmail: "", replyToEmail: "", templates: [] as never, emailSignature: "" }
      })
    ).rejects.toThrow("EMAIL_TAKEN");

    await expect(
      updateDashboardSettings("user_1", {
        profile: { firstName: "Tina", lastName: "Bauer", email: "tina@usechatting.com", jobTitle: "", avatarDataUrl: null },
        notifications: { browserNotifications: true, soundAlerts: true, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: true },
        email: { notificationEmail: "", replyToEmail: "", templates: [] as never, emailSignature: "" },
        password: { currentPassword: "old", newPassword: "a", confirmPassword: "b" }
      })
    ).rejects.toThrow("PASSWORD_CONFIRM");

    await createTeamInvite({ ownerUserId: "user_1", email: "new@example.com", role: "admin" });
    expect(mocks.sendTeamInvitationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ teamName: "Tina Team", teamWebsite: null })
    );

    mocks.findEmailTemplateSettingsRow.mockResolvedValueOnce(null);
    await expect(resendTeamInvite("user_1", "missing")).resolves.toHaveLength(2);
    expect(mocks.sendTeamInvitationEmail).toHaveBeenCalledTimes(1);
  });
});
