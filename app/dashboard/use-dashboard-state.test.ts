import type { DashboardClientProps } from "./dashboard-client.types";
import {
  createConversationSummary,
  createConversationThread,
  createSite
} from "./use-dashboard-actions.test-helpers";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

function createProps(overrides: Partial<DashboardClientProps> = {}): DashboardClientProps {
  return {
    userEmail: "tina@usechatting.com",
    initialStats: {
      totalConversations: 2,
      answeredConversations: 1,
      ratedConversations: 1,
      topTags: [{ tag: "pricing", count: 1 }]
    },
    initialSites: [createSite()],
    initialConversations: [
      createConversationSummary(),
      createConversationSummary({
        id: "conv_2",
        status: "resolved",
        city: "Paris",
        updatedAt: "2026-03-29T10:06:00.000Z"
      })
    ],
    initialActiveConversation: null,
    initialAiAssistSettings: {
      replySuggestionsEnabled: true,
      conversationSummariesEnabled: true,
      rewriteAssistanceEnabled: true,
      suggestedTagsEnabled: true
    },
    initialBillingPlanKey: "growth",
    ...overrides
  };
}

async function loadDashboardState(options?: { pathname?: string; search?: string }) {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const liveSyncCalls: unknown[] = [];
  const actions = {
    handleSiteTitleSave: vi.fn(),
    handleSaveConversationEmail: vi.fn(),
    handleConversationAssignmentChange: vi.fn(),
    handleReplySend: vi.fn(),
    handleReplyRetry: vi.fn(),
    handleConversationStatusChange: vi.fn(),
    handleTagToggle: vi.fn(),
    handleReplyComposerInput: vi.fn(),
    handleReplyComposerFocus: vi.fn(),
    handleReplyComposerBlur: vi.fn()
  };

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({
    usePathname: () => options?.pathname ?? "/dashboard/inbox",
    useSearchParams: () => new URLSearchParams(options?.search ?? "")
  }));
  vi.doMock("./use-dashboard-live-sync", () => ({
    useDashboardLiveSync: (args: unknown) => {
      liveSyncCalls.push(args);
    }
  }));
  vi.doMock("./use-dashboard-actions", () => ({
    createDashboardActions: () => actions
  }));

  const module = await import("./use-dashboard-state");
  return { actions, liveSyncCalls, reactMocks, useDashboardState: module.useDashboardState };
}

describe("use dashboard state", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches the routed conversation and strips success params from the URL", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, conversation: createConversationThread({ id: "conv_2" }) })
      })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", {
      history: { replaceState: vi.fn() }
    });

    const { liveSyncCalls, reactMocks, useDashboardState } = await loadDashboardState({
      search: "id=conv_2&success=1"
    });

    reactMocks.beginRender();
    const state = useDashboardState(createProps());
    await runMockEffects(reactMocks.effects);
    await state.openConversation("conv_2");

    expect(fetchMock).toHaveBeenCalledWith(
      "/dashboard/conversation?conversationId=conv_2",
      expect.objectContaining({ method: "GET", cache: "no-store" })
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/dashboard/read",
      expect.objectContaining({ method: "POST", keepalive: true })
    );
    expect(reactMocks.states[2]?.current).toEqual(expect.objectContaining({ id: "conv_2" }));
    expect((globalThis.window as Window).history.replaceState).toHaveBeenCalledWith(
      null,
      "",
      "/dashboard/inbox?id=conv_2"
    );
    expect(liveSyncCalls).toHaveLength(1);
  });

  it("opens cached conversations without reordering older threads above newer ones", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { history: { replaceState: vi.fn() } });
    const cachedConversation = createConversationThread();
    const props = createProps({
      initialActiveConversation: cachedConversation,
      initialConversations: [
        createConversationSummary({ id: "conv_2", status: "resolved", city: "Paris" }),
        createConversationSummary()
      ]
    });
    const { actions, reactMocks, useDashboardState } = await loadDashboardState();

    reactMocks.beginRender();
    const state = useDashboardState(props);
    await runMockEffects(reactMocks.effects);
    await state.openConversation("conv_1");

    expect(reactMocks.states[2]?.current).toEqual(expect.objectContaining({ id: "conv_1" }));
    expect((reactMocks.states[1]?.current as Array<{ id: string }>).map(({ id }) => id)).toEqual([
      "conv_2",
      "conv_1"
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/dashboard/read",
      expect.objectContaining({ method: "POST", keepalive: true })
    );

    state.setThreadFilter("resolved");
    state.setSearchQuery("paris");
    reactMocks.beginRender();
    const rerendered = useDashboardState(props);

    expect(rerendered.filteredConversations.map(({ id }) => id)).toEqual(["conv_2"]);
    expect(rerendered.handleReplySend).toBe(actions.handleReplySend);
    rerendered.clearActiveConversation();
    expect(reactMocks.states[2]?.current).toBeNull();
    expect(reactMocks.states[3]?.current).toBeNull();
  });

  it("does not keep a server-loaded routed conversation marked as loading", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { history: { replaceState: vi.fn() } });

    const { reactMocks, useDashboardState } = await loadDashboardState({
      search: "id=conv_1"
    });

    reactMocks.beginRender();
    useDashboardState(
      createProps({
        initialActiveConversation: createConversationThread({ id: "conv_1" })
      })
    );
    await runMockEffects(reactMocks.effects);

    expect(reactMocks.states[3]?.current).toBeNull();
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/dashboard/conversation?conversationId=conv_1",
      expect.anything()
    );
  });

  it("keeps dashboard network callbacks stable across rerenders", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    vi.stubGlobal("window", { history: { replaceState: vi.fn() } });

    const { liveSyncCalls, reactMocks, useDashboardState } = await loadDashboardState();
    reactMocks.beginRender();
    useDashboardState(createProps());
    await runMockEffects(reactMocks.effects);

    reactMocks.beginRender();
    useDashboardState(createProps());
    await runMockEffects(reactMocks.effects);

    expect(
      (liveSyncCalls[0] as { markConversationAsRead: unknown }).markConversationAsRead
    ).toBe((liveSyncCalls[1] as { markConversationAsRead: unknown }).markConversationAsRead);
    expect(
      (liveSyncCalls[0] as { refreshConversationList: unknown }).refreshConversationList
    ).toBe((liveSyncCalls[1] as { refreshConversationList: unknown }).refreshConversationList);
  });
});
