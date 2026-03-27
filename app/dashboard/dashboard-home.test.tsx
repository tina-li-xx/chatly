import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

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
    <div>{initialInstalled ? "Widget installed" : "Widget install needed"}</div>
  )
}));

vi.mock("./dashboard-ui", async () => {
  const actual = await vi.importActual<typeof import("./dashboard-ui")>("./dashboard-ui");
  return {
    ...actual,
    pageLabelFromUrl: (url: string | null) => url || "/"
  };
});

import { DashboardHome } from "./dashboard-home";

describe("dashboard home", () => {
  it("renders metrics, conversations, and installation state", async () => {
    mocks.getDashboardHomeData.mockResolvedValueOnce({
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
      chart: {
        changePercent: 8,
        total: 15,
        points: [
          { label: "Mon", count: 3 },
          { label: "Tue", count: 7 },
          { label: "Wed", count: 5 }
        ]
      },
      hasWidgetInstalled: true,
      widgetSiteIds: ["site_1"]
    });

    const html = renderToStaticMarkup(
      await DashboardHome({
        userEmail: "tina@chatly.example",
        userId: "user_123"
      })
    );

    expect(html).toContain("Open conversations");
    expect(html).toContain("Resolved today");
    expect(html).toContain("Avg response time");
    expect(html).toContain("Visitor satisfaction");
    expect(html).toContain("Recent conversations");
    expect(html).toContain("Quick question about pricing...");
    expect(html).toContain("Widget installed");
  });

  it("renders empty-state copy and neutral badges when data is missing", async () => {
    mocks.getDashboardHomeData.mockResolvedValueOnce({
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
        changePercent: null,
        total: 0,
        points: [
          { label: "Mon", count: 0 },
          { label: "Tue", count: 0 }
        ]
      },
      hasWidgetInstalled: false,
      widgetSiteIds: []
    });

    const html = renderToStaticMarkup(
      await DashboardHome({
        userEmail: "tina@chatly.example",
        userId: "user_123"
      })
    );

    expect(html).toContain("New conversations will show up here once visitors start chatting.");
    expect(html).toContain("No data");
    expect(html).toContain("Widget install needed");
  });
});
