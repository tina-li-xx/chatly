import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

async function flushAsyncWork(cycles = 6) {
  for (let index = 0; index < cycles; index += 1) {
    await Promise.resolve();
  }
}

async function loadVisitorsPage() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const captures: Record<string, unknown> = {};

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
  vi.doMock("./dashboard-shell", () => ({ useDashboardNavigation: () => ({ navigate: vi.fn() }) }));
  vi.doMock("./dashboard-visitors-page-sections", () => ({
    VisitorsToolbar: (props: unknown) => ((captures.toolbar = props), <div>toolbar</div>),
    VisitorsFiltersPanel: (props: unknown) => ((captures.filters = props), <div>filters</div>),
    LiveVisitorsSection: (props: unknown) => ((captures.live = props), <div>live</div>),
    RecentVisitorsSection: (props: unknown) => ((captures.recent = props), <div>recent</div>),
    VisitorDetailsDrawer: (props: unknown) => ((captures.drawer = props), <div>drawer</div>)
  }));

  const module = await import("./dashboard-visitors-page");
  return { DashboardVisitorsPage: module.DashboardVisitorsPage, captures, reactMocks };
}

describe("dashboard visitors page detail hydration", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("hydrates a selected visitor with enriched summaries only when the drawer opens", async () => {
    const now = new Date().toISOString();
    const initialConversation = {
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
      lastMessageAt: null,
      lastMessagePreview: null,
      unreadCount: 0,
      rating: null,
      tags: []
    };
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, summaries: [{ ...initialConversation, tags: ["lead"] }] })
    });

    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { setInterval: vi.fn().mockReturnValue(7), clearInterval: vi.fn() });
    vi.stubGlobal("EventSource", class { close = vi.fn(); onmessage = null; });

    const { DashboardVisitorsPage, captures, reactMocks } = await loadVisitorsPage();
    reactMocks.beginRender();
    renderToStaticMarkup(
      <DashboardVisitorsPage initialConversations={[initialConversation]} initialLiveSessions={[]} />
    );
    await runMockEffects(reactMocks.effects);
    reactMocks.beginRender();
    renderToStaticMarkup(
      <DashboardVisitorsPage initialConversations={[initialConversation]} initialLiveSessions={[]} />
    );

    expect((captures.drawer as { visitor: { tags: string[] } | null }).visitor).toBeNull();

    (captures.recent as { onSelectVisitor: (visitorId: string) => void }).onSelectVisitor(
      (captures.recent as { filteredVisitors: Array<{ id: string }> }).filteredVisitors[0].id
    );
    reactMocks.beginRender();
    renderToStaticMarkup(
      <DashboardVisitorsPage initialConversations={[initialConversation]} initialLiveSessions={[]} />
    );
    await runMockEffects(reactMocks.effects);
    await flushAsyncWork();
    reactMocks.beginRender();
    renderToStaticMarkup(
      <DashboardVisitorsPage initialConversations={[initialConversation]} initialLiveSessions={[]} />
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/dashboard/visitor-conversations?siteId=site_1&sessionId=session_1&email=alex%40example.com",
      { method: "GET", cache: "no-store" }
    );
    expect((captures.drawer as { visitor: { tags: string[] } | null }).visitor?.tags).toEqual(["lead"]);
  });
});
