const mocks = vi.hoisted(() => ({
  changeUserPassword: vi.fn(),
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
  listActiveTeamMemberRows: vi.fn(),
  listPendingTeamInviteRows: vi.fn(),
  listSavedReplyRows: vi.fn(),
  listSitesForUser: vi.fn(),
  parseDashboardEmailTemplates: vi.fn(),
  seatCountFromActiveMemberships: vi.fn(),
  serializeDashboardEmailTemplates: vi.fn(),
  updateSiteName: vi.fn(),
  upsertDashboardReportUserSettings: vi.fn(),
  upsertWorkspaceAiAssistSettings: vi.fn(),
  updateSettingsUserEmail: vi.fn(),
  upsertUserSettingsRecord: vi.fn(),
  upsertWorkspaceReportSettings: vi.fn()
}));

vi.mock("@/lib/auth", () => ({ changeUserPassword: mocks.changeUserPassword }));
vi.mock("@/lib/billing-seats", () => ({ seatCountFromActiveMemberships: mocks.seatCountFromActiveMemberships }));
vi.mock("@/lib/chatting-transactional-email-senders", () => ({ sendTeamInvitationEmail: vi.fn() }));
vi.mock("@/lib/data/billing", () => ({ getDashboardBillingSummary: mocks.getDashboardBillingSummary }));
vi.mock("@/lib/data/contacts", () => ({
  getDashboardContactSettings: mocks.getDashboardContactSettings,
  updateDashboardContactSettings: vi.fn()
}));
vi.mock("@/lib/data/settings-billing-snapshot", () => ({ getDashboardSettingsBillingSnapshot: mocks.getDashboardSettingsBillingSnapshot }));
vi.mock("@/lib/data/sites", () => ({
  listSitesForUser: mocks.listSitesForUser,
  updateSiteName: mocks.updateSiteName
}));
vi.mock("@/lib/email-templates", () => ({
  parseDashboardEmailTemplates: mocks.parseDashboardEmailTemplates,
  serializeDashboardEmailTemplates: mocks.serializeDashboardEmailTemplates
}));
vi.mock("@/lib/growth-outreach", () => ({ maybeSendTeamExpansionEmail: vi.fn() }));
vi.mock("@/lib/repositories/help-center-repository", () => ({
  countHelpCenterArticleRows: mocks.countHelpCenterArticleRows
}));
vi.mock("@/lib/repositories/report-settings-repository", () => ({
  findDashboardReportSettingsRow: mocks.findDashboardReportSettingsRow,
  upsertDashboardReportUserSettings: mocks.upsertDashboardReportUserSettings,
  upsertWorkspaceReportSettings: mocks.upsertWorkspaceReportSettings
}));
vi.mock("@/lib/repositories/settings-repository", () => ({
  findBillingSummaryRow: mocks.findBillingSummaryRow,
  findDashboardSettingsRow: mocks.findDashboardSettingsRow,
  findEmailTemplateSettingsRow: mocks.findEmailTemplateSettingsRow,
  findNotificationSettingsRow: mocks.findNotificationSettingsRow,
  findUserIdByEmailExcludingUser: mocks.findUserIdByEmailExcludingUser,
  insertTeamInviteRecord: vi.fn(),
  listPendingTeamInviteRows: mocks.listPendingTeamInviteRows,
  revokePendingTeamInvite: vi.fn(),
  touchPendingTeamInvite: vi.fn(),
  updatePendingTeamInviteRole: vi.fn(),
  updateSettingsUserEmail: mocks.updateSettingsUserEmail,
  upsertUserSettingsRecord: mocks.upsertUserSettingsRecord
}));
vi.mock("@/lib/repositories/ai-assist-settings-repository", () => ({
  findWorkspaceAiAssistSettingsValue: mocks.findWorkspaceAiAssistSettingsValue,
  upsertWorkspaceAiAssistSettings: mocks.upsertWorkspaceAiAssistSettings
}));
vi.mock("@/lib/repositories/saved-replies-repository", () => ({
  listSavedReplyRows: mocks.listSavedReplyRows
}));
vi.mock("@/lib/repositories/workspace-repository", () => ({
  countActiveTeamMembershipRows: vi.fn(),
  listActiveTeamMemberRows: mocks.listActiveTeamMemberRows
}));
vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));

import {
  getDashboardEmailTemplateSettings,
  getDashboardNotificationSettings,
  getDashboardSettingsData,
  updateDashboardSettings
} from "@/lib/data/settings";

function row(overrides: Record<string, unknown> = {}) {
  return {
    user_id: "owner_1",
    email: "owner.person@example.com",
    first_name: "",
    last_name: "",
    job_title: "",
    avatar_data_url: null,
    notification_email: null,
    reply_to_email: null,
    email_templates_json: "[]",
    browser_notifications: true,
    sound_alerts: true,
    email_notifications: true,
    new_visitor_alerts: false,
    high_intent_alerts: true,
    email_signature: "",
    last_seen_at: "2026-03-29T11:59:45.000Z",
    ...overrides
  };
}

describe("settings data hotspots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(new Date("2026-03-29T12:00:00.000Z").getTime());
    mocks.findNotificationSettingsRow.mockResolvedValue(row());
    mocks.findEmailTemplateSettingsRow.mockResolvedValue(row());
    mocks.findDashboardSettingsRow.mockResolvedValue(row());
    mocks.findBillingSummaryRow.mockResolvedValue({ site_count: 1 });
    mocks.findDashboardReportSettingsRow.mockResolvedValue(null);
    mocks.findWorkspaceAiAssistSettingsValue.mockResolvedValue("");
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1", role: "owner" });
    mocks.getDashboardContactSettings.mockResolvedValue({
      planKey: "growth",
      settings: { statuses: [], customFields: [], dataRetention: "forever" },
      limits: {
        fullProfiles: true,
        exportEnabled: true,
        apiEnabled: true,
        customStatusesLimit: null,
        customFieldsLimit: null
      }
    });
    mocks.listPendingTeamInviteRows.mockResolvedValue([{ id: "invite_1", email: "pending@example.com", role: "member", status: "pending", message: "", created_at: "a", updated_at: "b" }, { id: "invite_2", email: "accepted@example.com", role: "admin", status: "accepted", message: "", created_at: "c", updated_at: "d" }]);
    mocks.listActiveTeamMemberRows.mockResolvedValue([
      { user_id: "never", email: "never@example.com", first_name: "", last_name: "", role: "member", last_seen_at: null, avatar_data_url: null },
      { user_id: "recent", email: "recent@example.com", first_name: "Recent", last_name: "", role: "admin", last_seen_at: "2026-03-29T11:59:30.000Z", avatar_data_url: null },
      { user_id: "mins", email: "mins@example.com", first_name: "Mins", last_name: "", role: "member", last_seen_at: "2026-03-29T11:15:00.000Z", avatar_data_url: null },
      { user_id: "hours", email: "hours@example.com", first_name: "Hours", last_name: "", role: "member", last_seen_at: "2026-03-29T10:00:00.000Z", avatar_data_url: null },
      { user_id: "old", email: "old@example.com", first_name: "Old", last_name: "", role: "member", last_seen_at: "2026-03-27T10:00:00.000Z", avatar_data_url: null }
    ]);
    mocks.listSavedReplyRows.mockResolvedValue([]);
    mocks.countHelpCenterArticleRows.mockResolvedValue(0);
    mocks.listSitesForUser.mockResolvedValue([{ id: "site_1", name: "Owner Team" }]);
    mocks.seatCountFromActiveMemberships.mockReturnValue(6);
    mocks.getDashboardBillingSummary.mockResolvedValue({ planKey: "growth" } as never);
    mocks.getDashboardSettingsBillingSnapshot.mockResolvedValue({ planKey: "starter" } as never);
    mocks.parseDashboardEmailTemplates.mockReturnValue([]);
    mocks.serializeDashboardEmailTemplates.mockReturnValue("[]");
    mocks.findUserIdByEmailExcludingUser.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when notification or email-template rows are missing", async () => {
    mocks.findNotificationSettingsRow.mockResolvedValueOnce(null);
    await expect(getDashboardNotificationSettings("user_1")).rejects.toThrow("User not found.");
    mocks.findEmailTemplateSettingsRow.mockResolvedValueOnce(null);
    await expect(getDashboardEmailTemplateSettings("user_1")).rejects.toThrow("User not found.");
  });

  it("formats mixed team activity labels, filters pending invites, and falls back to email-based names", async () => {
    const data = await getDashboardSettingsData("owner_1");
    expect(mocks.getDashboardBillingSummary).toHaveBeenCalledWith("owner_1", 6);
    expect(data.teamName).toBe("Owner Team");
    expect(data.reports).toEqual(expect.objectContaining({ weeklyReportEnabled: true, canManageWorkspaceReports: true }));
    expect(data.teamInvites).toEqual([]);
    expect(data.teamMembers.map((member) => member.lastActiveLabel)).toEqual([
      "Just now",
      "Never",
      "Just now",
      "45m ago",
      "2h ago",
      "27 Mar"
    ]);
    expect(data.teamMembers[0]).toMatchObject({ name: "Owner Person", status: "online", isCurrentUser: true });
    expect(data.teamMembers[1]).toMatchObject({ name: "Never", status: "offline" });
  });

  it("throws when a member workspace cannot load the owner settings row", async () => {
    mocks.getWorkspaceAccess.mockResolvedValueOnce({ ownerUserId: "owner_2", role: "member" });
    mocks.findDashboardSettingsRow.mockResolvedValueOnce(row({ user_id: "user_1" })).mockResolvedValueOnce(null);
    await expect(getDashboardSettingsData("user_1")).rejects.toThrow("Workspace owner not found.");
  });

  it("covers missing-email, email-taken, password-confirm, and no-password update branches", async () => {
    await expect(updateDashboardSettings("user_1", {
      profile: { firstName: "", lastName: "", email: "   ", jobTitle: "", avatarDataUrl: null },
      notifications: { browserNotifications: true, soundAlerts: true, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: true },
      email: { notificationEmail: "", replyToEmail: "", templates: [] as never, emailSignature: "" }
    })).rejects.toThrow("MISSING_EMAIL");

    mocks.findUserIdByEmailExcludingUser.mockResolvedValueOnce("user_2");
    await expect(updateDashboardSettings("user_1", {
      profile: { firstName: "", lastName: "", email: "taken@example.com", jobTitle: "", avatarDataUrl: null },
      notifications: { browserNotifications: true, soundAlerts: true, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: true },
      email: { notificationEmail: "", replyToEmail: "", templates: [] as never, emailSignature: "" }
    })).rejects.toThrow("EMAIL_TAKEN");

    await expect(updateDashboardSettings("user_1", {
      profile: { firstName: "Tina", lastName: "Bauer", email: "owner.person@example.com", jobTitle: "", avatarDataUrl: null },
      notifications: { browserNotifications: true, soundAlerts: true, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: true },
      email: { notificationEmail: "", replyToEmail: "", templates: [] as never, emailSignature: "" },
      password: { currentPassword: "old", newPassword: "one", confirmPassword: "two" }
    })).rejects.toThrow("PASSWORD_CONFIRM");

    await updateDashboardSettings("user_1", {
      profile: { firstName: "Tina", lastName: "Bauer", email: "owner.person@example.com", jobTitle: "", avatarDataUrl: null },
      notifications: { browserNotifications: true, soundAlerts: false, emailNotifications: true, newVisitorAlerts: true, highIntentAlerts: true },
      email: { notificationEmail: "", replyToEmail: "", templates: [] as never, emailSignature: "" },
      password: null
    });
    expect(mocks.changeUserPassword).not.toHaveBeenCalled();
  });

  it("uses the lightweight billing snapshot when returning saved settings", async () => {
    const result = await updateDashboardSettings("user_1", {
      profile: { firstName: "Tina", lastName: "Bauer", email: "owner.person@example.com", jobTitle: "", avatarDataUrl: null },
      notifications: { browserNotifications: true, soundAlerts: true, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: true },
      email: { notificationEmail: "", replyToEmail: "", templates: [] as never, emailSignature: "" }
    });

    expect(mocks.getDashboardSettingsBillingSnapshot).toHaveBeenCalledWith({
      ownerUserId: "owner_1",
      usedSeats: 6,
      siteCount: 1
    });
    expect(mocks.getDashboardBillingSummary).not.toHaveBeenCalled();
    expect(result.billing).toEqual({ planKey: "starter" });
  });
});
