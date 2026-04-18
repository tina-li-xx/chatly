describe("dashboard home and growth data", () => {
  afterEach(() => vi.useRealTimers());

  it("builds dashboard home data from the combined snapshot path", async () => {
    vi.resetModules();
    vi.doMock("@/lib/site-installation", () => ({ isSiteWidgetInstalled: vi.fn((site: { installed: boolean }) => site.installed) }));
    vi.doMock("@/lib/data/inbox-conversations", () => ({
      listRecentInboxConversationSummaries: vi
        .fn()
        .mockResolvedValue([{ id: "conv_1", unreadCount: 2 }, { id: "conv_2", unreadCount: 1 }])
    }));
    vi.doMock("@/lib/data/sites", () => ({ listSitesForUser: vi.fn().mockResolvedValue([{ id: "site_1", installed: true }, { id: "site_2", installed: false }]) }));
    vi.doMock("@/lib/user-timezone-preference", () => ({
      resolvePreferredTimeZoneForUserWithSource: vi
        .fn()
        .mockResolvedValue({ timeZone: "Europe/London", source: "saved" })
    }));
    vi.doMock("@/lib/repositories/dashboard-home-snapshot-repository", () => ({
      getDashboardHomeSnapshot: vi.fn().mockResolvedValue({
        overview: {
          open_conversations: "4",
          opened_today: "3",
          resolved_today: "2",
          resolved_yesterday: "1"
        },
        response: {
          current_avg_seconds: "45",
          previous_avg_seconds: "60"
        },
        satisfaction: {
          current_rate: "90",
          previous_rate: "80"
        },
        chart: {
          previousTotal: 4,
          rows: [
            { dayKey: "2026-03-30", dayLabel: "Mon", count: "5" },
            { dayKey: "2026-03-31", dayLabel: "Tue", count: "3" }
          ]
        }
      })
    }));
    vi.doMock("@/lib/repositories/dashboard-home-repository", () => ({
      getDashboardHomeConversationRange: vi.fn().mockResolvedValue({
        previousTotal: 4,
        rows: [
          { dayKey: "2026-03-30", dayLabel: "Mon", count: "5" },
          { dayKey: "2026-03-31", dayLabel: "Tue", count: "3" }
        ]
      })
    }));
    vi.doMock("@/lib/data/dashboard-team-members", () => ({
      listDashboardTeamPresenceMembersForWorkspace: vi.fn().mockResolvedValue([
        {
          id: "user_1",
          name: "Tina",
          email: "tina@example.com",
          initials: "T",
          role: "owner",
          status: "online",
          lastActiveLabel: "Just now",
          lastSeenAt: "2026-03-31T09:00:00.000Z",
          isCurrentUser: true,
          avatarDataUrl: null
        }
      ])
    }));
    vi.doMock("@/lib/data/settings-team-invites", () => ({
      listTeamInvites: vi.fn().mockResolvedValue([{ id: "invite_1" }])
    }));

    const module = await import("@/lib/data/dashboard-home");
    await expect(module.getDashboardHomeData("user_1")).resolves.toMatchObject({
      hasWidgetInstalled: true,
      widgetSiteIds: ["site_1", "site_2"],
      openConversations: 4,
      resolvedToday: 2,
      avgResponseSeconds: 45,
      satisfactionPercent: 90,
      teamMembers: [expect.objectContaining({ id: "user_1" })],
      pendingTeamInvites: 1,
      chartPending: false,
      chart: {
        rangeDays: 7,
        total: 8,
        totalLabel: "Total last 7 days",
        comparisonLabel: "vs previous 7 days",
        changePercent: 100
      }
    });
  });
});
