import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createHomeData } from "./dashboard-home.test-fixtures";

const mocks = vi.hoisted(() => ({
  getDashboardHomeData: vi.fn()
}));

vi.mock("@/lib/data/dashboard-home", () => ({
  getDashboardHomeData: mocks.getDashboardHomeData
}));

vi.mock("./dashboard-shell", () => ({
  DashboardLink: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

vi.mock("./dashboard-widget-install-card", () => ({
  DashboardWidgetInstallCard: ({ initialInstalled }: { initialInstalled: boolean }) => (
    initialInstalled ? null : <div>Widget install needed</div>
  )
}));

vi.mock("./dashboard-home-range-select", () => ({
  DashboardHomeRangeSelect: ({ value }: { value: number }) => <div>Range {value}</div>
}));

import { DashboardHome } from "./dashboard-home";

describe("dashboard home", () => {
  it("renders metrics and conversations without the live widget card", async () => {
    mocks.getDashboardHomeData.mockResolvedValueOnce(createHomeData());

    const html = renderToStaticMarkup(
      await DashboardHome({
        userEmail: "tina@chatly.example",
        userId: "user_123",
        rangeDays: 7
      })
    );

    expect(html).toContain("Open conversations");
    expect(html).toContain("Resolved today");
    expect(html).toContain("Avg response time");
    expect(html).toContain("Visitor satisfaction");
    expect(html).not.toContain("Growth loops");
    expect(html).not.toContain("The widget is live. Now push for the first conversation.");
    expect(html).not.toContain("Customer health score");
    expect(html).not.toContain("Expansion revenue");
    expect(html).not.toContain("Unlock deeper analytics and API access");
    expect(html).toContain("Recent conversations");
    expect(html).toContain("Quick question about pricing...");
    expect(html).not.toContain("Widget install needed");
    expect(html).not.toContain("Widget is live");
    expect(html).not.toContain("Customize widget");
  });

  it("renders empty-state copy and neutral badges when data is missing", async () => {
    mocks.getDashboardHomeData.mockResolvedValueOnce(createHomeData({
      openConversations: 0,
      openConversationsDelta: 0,
      resolvedToday: 0,
      resolvedTodayDelta: 0,
      avgResponseSeconds: null,
      avgResponseDeltaPercent: null,
      satisfactionPercent: null,
      satisfactionDeltaPercent: null,
      recentConversations: [],
      chart: {
        rangeDays: 7,
        changePercent: null,
        total: 0,
        totalLabel: "Total last 7 days",
        comparisonLabel: "vs previous 7 days",
        points: [
          { label: "Mon", count: 0 },
          { label: "Tue", count: 0 }
        ]
      },
      growth: {
        activation: {
          status: "needs-install",
          tone: "warning",
          badge: "Install blocker",
          title: "Activation is blocked until the widget is live",
          description: "No chats can happen until the widget is installed.",
          helper: "Finish installation to start the clock",
          action: { label: "Check installation", href: "/dashboard/widget" }
        },
        health: {
          status: "at-risk",
          tone: "warning",
          score: 44,
          badge: "Intervene now",
          title: "Customer health score",
          description: "Health will stabilize once you have a few real conversations to benchmark.",
          action: { label: "Open analytics", href: "/dashboard/analytics" },
          metrics: [
            {
              label: "Conversation volume",
              value: "0 this week",
              detail: "No conversation baseline yet",
              tone: "warning"
            },
            {
              label: "Response time",
              value: "No reply data",
              detail: "We need a few replied conversations first",
              tone: "neutral"
            },
            {
              label: "Login frequency",
              value: "0 this week",
              detail: "No recent login history",
              tone: "warning"
            }
          ]
        },
        expansion: {
          title: "Expansion revenue",
          description: "No upgrade pressure yet. We'll surface expansion signals as the workspace grows.",
          prompts: []
        }
      },
      hasWidgetInstalled: false,
      widgetSiteIds: []
    }));

    const html = renderToStaticMarkup(
      await DashboardHome({
        userEmail: "tina@chatly.example",
        userId: "user_123",
        rangeDays: 7
      })
    );

    expect(html).toContain("New conversations will show up here once visitors start chatting.");
    expect(html).toContain("No data");
    expect(html).not.toContain("Activation is blocked until the widget is live");
    expect(html).not.toContain("Customer health score");
    expect(html).not.toContain("View all");
    expect(html).toContain("Widget install needed");
  });
});
