export function createHomeData(overrides: Record<string, unknown> = {}) {
  return {
    openConversations: 6,
    openConversationsDelta: 2,
    resolvedToday: 4,
    resolvedTodayDelta: 1,
    avgResponseSeconds: 72,
    avgResponseDeltaPercent: 12,
    satisfactionPercent: 94,
    satisfactionDeltaPercent: 3,
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
    growth: {
      activation: {
        status: "countdown",
        tone: "neutral",
        badge: "First 24 hours",
        title: "The widget is live. Now push for the first conversation.",
        description: "You still have 18 hours to hit the first-chat activation target.",
        helper: "Put the widget on pricing, demo, or contact pages and send yourself a test message.",
        action: { label: "Customize widget", href: "/dashboard/widget" }
      },
      health: {
        status: "watch",
        tone: "neutral",
        score: 68,
        badge: "Watchlist",
        title: "Customer health score",
        description: "Conversation volume is the biggest risk right now. Step in before the drop becomes a habit.",
        action: { label: "Open analytics", href: "/dashboard/analytics" },
        metrics: [
          { label: "Conversation volume", value: "5 this week", detail: "-20% vs last week", tone: "warning" },
          { label: "Response time", value: "1.2m", detail: "Average first reply", tone: "positive" },
          { label: "Login frequency", value: "3 this week", detail: "Last login today", tone: "neutral" }
        ]
      },
      expansion: {
        title: "Expansion revenue",
        description: "Upgrade nudges appear when team usage, conversation volume, or reporting needs signal expansion potential.",
        prompts: [
          {
            id: "analytics",
            tone: "neutral",
            title: "Unlock deeper analytics and API access",
            description: "Growing teams usually need more than basic reporting.",
            action: { label: "See plan benefits", href: "/dashboard/settings?section=billing" }
          }
        ]
      }
    },
    hasWidgetInstalled: true,
    widgetSiteIds: ["site_1"],
    ...overrides
  };
}
