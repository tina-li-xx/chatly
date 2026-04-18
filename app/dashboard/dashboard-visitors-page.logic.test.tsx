import { renderToStaticMarkup } from "react-dom/server";
import { createVisitorsData, flushAsyncWork, loadVisitorsPage } from "./dashboard-visitors-page.test-support";
import { runMockEffects } from "./test-react-hooks";

describe("dashboard visitors page logic", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refreshes visitors manually, patches live events incrementally, and routes conversation actions", async () => {
    const initial = createVisitorsData();
    const eventSources: Array<{ close: ReturnType<typeof vi.fn>; onmessage: ((event: { data: string }) => void) | null }> = [];
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, conversations: [], liveSessions: [] }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { setInterval: vi.fn().mockReturnValue(7), clearInterval: vi.fn() });
    vi.stubGlobal("EventSource", class {
      close = vi.fn();
      onmessage: ((event: { data: string }) => void) | null = null;
      constructor() {
        eventSources.push(this);
      }
    });

    const { DashboardVisitorsPage, captures, navigate, reactMocks } = await loadVisitorsPage();
    const renderPage = () => {
      reactMocks.beginRender();
      renderToStaticMarkup(<DashboardVisitorsPage initialConversations={initial.conversations} initialLiveSessions={initial.liveSessions} />);
    };
    renderPage();
    const cleanups = await runMockEffects(reactMocks.effects);
    renderPage();

    await (captures.recent as { onOpenConversation: (visitor: { latestConversationId: string }) => void }).onOpenConversation((captures.recent as {
      filteredVisitors: Array<{ latestConversationId: string }>;
    }).filteredVisitors[0]);
    await (captures.live as { onOpenConversation: (visitor: { id: string; latestConversationId: string | null }) => void }).onOpenConversation((captures.live as {
      liveVisitors: Array<{ id: string; latestConversationId: string | null }>;
    }).liveVisitors.find((visitor) => !visitor.latestConversationId)!);
    renderPage();

    expect(navigate).toHaveBeenCalledWith("/dashboard/inbox?id=conv_1");
    expect((captures.drawer as { visitor: unknown }).visitor).toBeTruthy();

    await (captures.live as { onRefresh: () => Promise<void> }).onRefresh();
    await flushAsyncWork();
    renderPage();
    await runMockEffects(reactMocks.effects);
    renderPage();

    const liveSummary = {
      ...initial.conversations[0],
      updatedAt: "2026-04-17T10:15:00.000Z",
      lastMessageAt: "2026-04-17T10:15:00.000Z",
      lastMessagePreview: "Follow-up question",
      unreadCount: 3,
      tags: ["vip"]
    };
    const liveSession = {
      ...initial.liveSessions[0],
      conversationId: "conv_1",
      email: "alex@example.com",
      currentPageUrl: "/checkout",
      lastSeenAt: "2026-04-17T10:15:00.000Z"
    };

    eventSources[0]?.onmessage?.({
      data: JSON.stringify({
        type: "message.created",
        sender: "user",
        conversationId: "conv_1",
        summary: liveSummary
      })
    });
    eventSources[0]?.onmessage?.({
      data: JSON.stringify({
        type: "visitor.presence.updated",
        siteId: "site_1",
        sessionId: "live_1",
        session: liveSession
      })
    });
    await flushAsyncWork();
    renderPage();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/dashboard/visitors-data", { method: "GET", cache: "no-store" });
    expect((captures.recent as { filteredVisitors: Array<{ tags: string[] }> }).filteredVisitors[0]?.tags).toEqual(["vip"]);
    expect((captures.live as { liveVisitors: Array<{ email: string | null }> }).liveVisitors[0]?.email).toBe("alex@example.com");
    expect((captures.drawer as { visitor: unknown }).visitor).toBeNull();
    expect((captures.live as { refreshing: boolean }).refreshing).toBe(false);

    cleanups.forEach((cleanup) => cleanup());
    expect((globalThis.window as Window).clearInterval).toHaveBeenCalledWith(7);
    expect(eventSources[0]?.close).toHaveBeenCalled();
  });

  it("applies filters, resets pagination, toggles sorting, and exports the filtered list", async () => {
    const initial = createVisitorsData();
    vi.stubGlobal("window", { setInterval: vi.fn().mockReturnValue(7), clearInterval: vi.fn() });
    vi.stubGlobal("EventSource", class { close = vi.fn(); onmessage = null; });

    const { DashboardVisitorsPage, captures, exportVisitors, reactMocks } = await loadVisitorsPage();
    const renderPage = () => {
      reactMocks.beginRender();
      renderToStaticMarkup(<DashboardVisitorsPage initialConversations={initial.conversations} initialLiveSessions={initial.liveSessions} />);
    };
    renderPage();
    await runMockEffects(reactMocks.effects);
    renderPage();

    (captures.recent as { setCurrentPage: (page: number) => void }).setCurrentPage(2);
    (captures.toolbar as { onToggleFilters: () => void }).onToggleFilters();
    renderPage();
    (captures.filters as { setDraftFilters: (updater: (current: { status: string }) => { status: string }) => void }).setDraftFilters(
      (current) => ({ ...current, status: "offline" })
    );
    renderPage();
    (captures.filters as { applyFilters: () => void }).applyFilters();
    renderPage();
    await runMockEffects(reactMocks.effects);
    renderPage();

    (captures.recent as { onToggleSort: (key: string) => void }).onToggleSort("visitor");
    renderPage();
    (captures.recent as { onToggleSort: (key: string) => void }).onToggleSort("visitor");
    renderPage();
    (captures.recent as { onExport: () => void }).onExport();

    expect((captures.filters as { visible: boolean }).visible).toBe(false);
    expect((captures.recent as { currentPage: number }).currentPage).toBe(1);
    expect((captures.recent as { refreshingFilters: boolean }).refreshingFilters).toBe(true);
    expect((captures.recent as { sortDirection: string }).sortDirection).toBe("desc");
    expect(exportVisitors).toHaveBeenCalledWith((captures.recent as { filteredVisitors: unknown[] }).filteredVisitors);
  });
});
