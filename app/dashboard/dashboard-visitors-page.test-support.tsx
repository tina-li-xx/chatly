import { vi } from "vitest";
import { createMockReactHooks } from "./test-react-hooks";

export function createVisitorsData() {
  const now = new Date().toISOString();
  return {
    conversations: [
      {
        id: "conv_1",
        siteId: "site_1",
        siteName: "Chatting",
        email: "alex@example.com",
        assignedUserId: null,
        sessionId: "session_1",
        status: "open" as const,
        createdAt: now,
        updatedAt: now,
        pageUrl: "/pricing",
        recordedPageUrl: "/pricing",
        referrer: "google.com",
        userAgent: "Chrome",
        country: "United Kingdom",
        region: "England",
        city: "London",
        timezone: "Europe/London",
        locale: "en-GB",
        lastMessageAt: now,
        lastMessagePreview: "Pricing question",
        unreadCount: 1,
        rating: null,
        tags: ["lead"]
      }
    ],
    liveSessions: [
      {
        siteId: "site_1",
        sessionId: "live_1",
        conversationId: null,
        email: null,
        currentPageUrl: "/docs",
        referrer: "https://google.com",
        userAgent: "Safari",
        country: "United Kingdom",
        region: "England",
        city: "London",
        timezone: "Europe/London",
        locale: "en-GB",
        startedAt: now,
        lastSeenAt: now
      }
    ]
  };
}

export async function flushAsyncWork(cycles = 6) {
  for (let index = 0; index < cycles; index += 1) {
    await Promise.resolve();
  }
}

export async function loadVisitorsPage() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const captures: Record<string, unknown> = {};
  const navigate = vi.fn();
  const exportVisitors = vi.fn();

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
  vi.doMock("./dashboard-shell", () => ({ useDashboardNavigation: () => ({ navigate }) }));
  vi.doMock("./dashboard-visitors-page-sections", () => ({
    VisitorsToolbar: (props: unknown) => ((captures.toolbar = props), <div>toolbar</div>),
    VisitorsFiltersPanel: (props: unknown) => ((captures.filters = props), <div>filters</div>),
    LiveVisitorsSection: (props: unknown) => ((captures.live = props), <div>live</div>),
    RecentVisitorsSection: (props: unknown) => ((captures.recent = props), <div>recent</div>),
    VisitorDetailsDrawer: (props: unknown) => ((captures.drawer = props), <div>drawer</div>)
  }));
  vi.doMock("./dashboard-visitors-page.utils", async () => {
    const actual = await vi.importActual<typeof import("./dashboard-visitors-page.utils")>("./dashboard-visitors-page.utils");
    return { ...actual, exportVisitors };
  });

  const module = await import("./dashboard-visitors-page");
  return { DashboardVisitorsPage: module.DashboardVisitorsPage, captures, exportVisitors, navigate, reactMocks };
}
