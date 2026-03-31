describe("dashboard home and growth data", () => {
  afterEach(() => vi.useRealTimers());

  it("builds dashboard home data and throws when the user is missing", async () => {
    vi.resetModules();
    const getDashboardGrowthData = vi.fn().mockResolvedValue({
      activation: { status: "healthy" },
      health: { status: "healthy" },
      expansion: { prompts: [] }
    });
    vi.doMock("@/lib/repositories/auth-repository", () => ({ findAuthUserById: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ created_at: "2026-03-01T00:00:00.000Z" }) }));
    vi.doMock("@/lib/site-installation", () => ({ isSiteWidgetInstalled: vi.fn((site: { installed: boolean }) => site.installed) }));
    vi.doMock("@/lib/data/conversations", () => ({ listConversationSummaries: vi.fn().mockResolvedValue([{ id: "conv_1", unreadCount: 2 }, { id: "conv_2", unreadCount: 1 }]) }));
    vi.doMock("@/lib/data/sites", () => ({ listSitesForUser: vi.fn().mockResolvedValue([{ id: "site_1", installed: true }, { id: "site_2", installed: false }]) }));
    vi.doMock("@/lib/repositories/dashboard-home-repository", () => ({
      getDashboardHomeOverview: vi.fn().mockResolvedValue({ open_conversations: "4", opened_today: "3", resolved_today: "2", resolved_yesterday: "1" }),
      getDashboardHomeResponseMetrics: vi.fn().mockResolvedValue({ current_avg_seconds: "45", previous_avg_seconds: "60" }),
      getDashboardHomeSatisfactionMetrics: vi.fn().mockResolvedValue({ current_rate: "90", previous_rate: "80" }),
      listDashboardHomeChartPoints: vi.fn().mockResolvedValue([{ day_label: "Mon", count: "5" }, { day_label: "Tue", count: "3" }]),
      getPreviousWeekConversationCount: vi.fn().mockResolvedValue("4")
    }));
    vi.doMock("@/lib/data/dashboard-growth", () => ({ getDashboardGrowthData }));

    const module = await import("@/lib/data/dashboard-home");
    await expect(module.getDashboardHomeData("user_1")).rejects.toThrow("USER_NOT_FOUND");
    await expect(module.getDashboardHomeData("user_1")).resolves.toMatchObject({
      hasWidgetInstalled: true,
      widgetSiteIds: ["site_1", "site_2"],
      unreadCount: 3,
      chart: { total: 8, changePercent: 100 }
    });
    expect(getDashboardGrowthData).toHaveBeenCalledWith(
      "user_1",
      "2026-03-01T00:00:00.000Z",
      true,
      45
    );
  });

});
