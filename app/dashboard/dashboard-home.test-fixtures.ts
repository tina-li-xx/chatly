export function createHomeData(overrides: Record<string, unknown> = {}) {
  const ownerLastSeenAt = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const memberLastSeenAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  return {
    openConversations: 6,
    openConversationsDelta: 2,
    resolvedToday: 4,
    resolvedTodayDelta: 1,
    avgResponseSeconds: 72,
    avgResponseDeltaPercent: 12,
    satisfactionPercent: 94,
    satisfactionDeltaPercent: 3,
    teamMembers: [
      {
        id: "user_123",
        name: "Tina Bauer",
        email: "tina@chatting.example",
        initials: "TB",
        role: "owner",
        status: "online",
        lastActiveLabel: "Just now",
        lastSeenAt: ownerLastSeenAt,
        isCurrentUser: true,
        avatarDataUrl: null
      },
      {
        id: "member_2",
        name: "Alex Rivera",
        email: "alex@chatting.example",
        initials: "AR",
        role: "admin",
        status: "offline",
        lastActiveLabel: "2h ago",
        lastSeenAt: memberLastSeenAt,
        isCurrentUser: false,
        avatarDataUrl: null
      }
    ],
    pendingTeamInvites: 1,
    recentConversations: [
      {
        id: "conv_1",
        email: "alex@example.com",
        unreadCount: 2,
        lastMessageAt: "2026-03-27T12:00:00.000Z",
        updatedAt: "2026-03-27T12:00:00.000Z",
        lastMessagePreview: "Quick question about pricing...",
        pageUrl: "/pricing"
      }
    ],
    chartPending: false,
    chart: {
      rangeDays: 7,
      changePercent: 8,
      total: 15,
      totalLabel: "Total last 7 days",
      comparisonLabel: "vs previous 7 days",
      points: [
        { label: "Mon", count: 3 },
        { label: "Tue", count: 7 },
        { label: "Wed", count: 5 }
      ]
    },
    hasWidgetInstalled: true,
    widgetSiteIds: ["site_1"],
    ...overrides
  };
}
