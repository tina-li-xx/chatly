const mocks = vi.hoisted(() => ({
  getPublicAppUrl: vi.fn(),
  hasWeeklyPerformanceDelivery: vi.fn(),
  insertWeeklyPerformanceDelivery: vi.fn(),
  listWeeklyPerformanceRecipientRows: vi.fn(),
  listWeeklyPerformanceWorkspaceRows: vi.fn(),
  getOrCreateWeeklyPerformanceSnapshot: vi.fn(),
  sendWeeklyPerformanceEmail: vi.fn(),
  sendWeeklyWidgetInstallEmail: vi.fn()
}));

vi.mock("@/lib/chatting-notification-email-senders", () => ({
  sendWeeklyPerformanceEmail: mocks.sendWeeklyPerformanceEmail,
  sendWeeklyWidgetInstallEmail: mocks.sendWeeklyWidgetInstallEmail
}));
vi.mock("@/lib/env", () => ({ getPublicAppUrl: mocks.getPublicAppUrl }));
vi.mock("@/lib/repositories/weekly-performance-repository", () => ({
  hasWeeklyPerformanceDelivery: mocks.hasWeeklyPerformanceDelivery,
  insertWeeklyPerformanceDelivery: mocks.insertWeeklyPerformanceDelivery,
  listWeeklyPerformanceRecipientRows: mocks.listWeeklyPerformanceRecipientRows,
  listWeeklyPerformanceWorkspaceRows: mocks.listWeeklyPerformanceWorkspaceRows
}));
vi.mock("@/lib/weekly-performance-snapshot-service", () => ({
  getOrCreateWeeklyPerformanceSnapshot: mocks.getOrCreateWeeklyPerformanceSnapshot
}));

import { runScheduledWeeklyPerformanceEmails } from "@/lib/weekly-performance";

describe("weekly performance scheduler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T13:15:00.000Z"));
    mocks.getPublicAppUrl.mockReturnValue("https://usechatting.com");
    mocks.hasWeeklyPerformanceDelivery.mockResolvedValue(false);
    mocks.getOrCreateWeeklyPerformanceSnapshot.mockResolvedValue({
      teamName: "Chatting",
      dateRange: "Mar 23 – Mar 29",
      previewText: "4 conversations, 4m avg response time",
      reportUrl: "https://usechatting.com/dashboard/analytics?range=last_week",
      settingsUrl: "https://usechatting.com/dashboard/settings?section=reports",
      widgetUrl: "https://usechatting.com/dashboard/widget",
      quietWeek: false,
      metrics: [],
      heatmapHours: [],
      heatmapRows: [],
      peakLabel: null,
      topPages: [],
      insight: null,
      tip: { text: "Tip", href: "https://usechatting.com/dashboard/widget", label: "Open widget settings" },
      teamPerformance: [],
      personalPerformanceByUserId: {}
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("prebuilds workspace snapshots and keeps going when one recipient send fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mocks.listWeeklyPerformanceWorkspaceRows.mockResolvedValue([
      { owner_user_id: "owner_1", team_timezone: "UTC", team_name: "Chatting", workspace_include_team_leaderboard: true, workspace_ai_insights_enabled: true, widget_installed: true },
      { owner_user_id: "owner_2", team_timezone: "America/New_York", team_name: "Docs", workspace_include_team_leaderboard: false, workspace_ai_insights_enabled: false, widget_installed: true }
    ]);
    mocks.listWeeklyPerformanceRecipientRows.mockResolvedValue([
      { user_id: "user_1", owner_user_id: "owner_1", workspace_role: "owner", email: "owner@example.com", notification_email: null, first_name: "Tina", recipient_timezone: "UTC", team_timezone: "UTC", team_name: "Chatting", weekly_report_enabled: true, weekly_report_send_hour: 9, weekly_report_send_minute: 0, weekly_report_include_personal_stats: true, workspace_weekly_reports_enabled: true, workspace_include_team_leaderboard: true, workspace_ai_insights_enabled: true, widget_installed: true },
      { user_id: "user_2", owner_user_id: "owner_2", workspace_role: "admin", email: "member@example.com", notification_email: "team@example.com", first_name: "Alex", recipient_timezone: "America/New_York", team_timezone: "America/New_York", team_name: "Docs", weekly_report_enabled: true, weekly_report_send_hour: 9, weekly_report_send_minute: 0, weekly_report_include_personal_stats: true, workspace_weekly_reports_enabled: true, workspace_include_team_leaderboard: true, workspace_ai_insights_enabled: true, widget_installed: true }
    ]);
    mocks.sendWeeklyPerformanceEmail.mockRejectedValueOnce(new Error("SEND_FAILED")).mockResolvedValueOnce(undefined);

    await expect(runScheduledWeeklyPerformanceEmails(new Date("2026-03-30T13:15:00.000Z"))).resolves.toEqual({
      processedRecipients: 2,
      sent: 1,
      skipped: 1
    });

    expect(mocks.getOrCreateWeeklyPerformanceSnapshot).toHaveBeenCalledWith(expect.objectContaining({ ownerUserId: "owner_1", weekStart: "2026-03-23" }));
    expect(mocks.getOrCreateWeeklyPerformanceSnapshot).toHaveBeenCalledWith(expect.objectContaining({ ownerUserId: "owner_2", weekStart: "2026-03-23" }));
    expect(mocks.sendWeeklyPerformanceEmail).toHaveBeenCalledTimes(2);
    expect(mocks.insertWeeklyPerformanceDelivery).toHaveBeenCalledTimes(1);
    expect(mocks.insertWeeklyPerformanceDelivery).toHaveBeenCalledWith("user_2", "owner_2", "2026-03-23");
    expect(errorSpy).toHaveBeenCalledWith("weekly performance email failed", "user_1", "owner_1", expect.any(Error));
  });
});
