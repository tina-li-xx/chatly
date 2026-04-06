import type { ReactElement, ReactNode } from "react";
import type { DashboardClientProps } from "./dashboard-client.types";
import { createConversationSummary, createConversationThread, createSite } from "./use-dashboard-actions.test-helpers";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

function createProps(active = createConversationThread()): DashboardClientProps {
  return {
    userEmail: "tina@usechatting.com",
    initialStats: { totalConversations: 2, answeredConversations: 1, ratedConversations: 0, topTags: [] },
    initialSites: [createSite()],
    initialConversations: [createConversationSummary(), createConversationSummary({ id: "conv_2", status: "resolved" })],
    initialActiveConversation: active,
    initialAiAssistSettings: {
      replySuggestionsEnabled: true,
      conversationSummariesEnabled: true,
      rewriteAssistanceEnabled: true,
      suggestedTagsEnabled: true
    },
    initialBillingPlanKey: "growth"
  };
}

function collect(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collect(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collect(element.props?.children, predicate)];
}

async function loadDashboardClient(stateOverrides: Record<string, unknown>) {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const navigation = { navigate: vi.fn() };
  const unreadCount = { setUnreadCount: vi.fn() };
  const state = {
    conversations: [createConversationSummary(), createConversationSummary({ id: "conv_2", status: "resolved" })],
    filteredConversations: [createConversationSummary(), createConversationSummary({ id: "conv_2", status: "resolved" })],
    activeConversation: createConversationThread(),
    loadingConversationId: null,
    savingEmail: false,
    sendingReply: false,
    updatingStatus: false,
    visitorTypingConversationId: null,
    liveConnectionState: "connected" as const,
    threadFilter: "all" as const,
    assignmentFilter: "all" as const,
    searchQuery: "",
    setThreadFilter: vi.fn(),
    setAssignmentFilter: vi.fn(),
    setSearchQuery: vi.fn(),
    handleSaveConversationEmail: vi.fn(),
    handleReplySend: vi.fn(),
    handleReplyRetry: vi.fn(),
    handleConversationStatusChange: vi.fn(),
    handleReplyComposerBlur: vi.fn(),
    handleReplyComposerFocus: vi.fn(),
    handleReplyComposerInput: vi.fn(),
    handleTagToggle: vi.fn(),
    openConversation: vi.fn(),
    clearActiveConversation: vi.fn(),
    ...stateOverrides
  };
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("./dashboard-shell", () => ({ useDashboardNavigation: () => navigation }));
  vi.doMock("./dashboard-unread-count", () => ({
    countUnreadConversations: (conversations: Array<{ unreadCount: number }>) =>
      conversations.reduce((count, conversation) => count + conversation.unreadCount, 0),
    useSetDashboardUnreadCount: () => unreadCount.setUnreadCount
  }));
  vi.doMock("./use-dashboard-state", () => ({ useDashboardState: () => state }));
  vi.doMock("./dashboard-thread-detail", () => ({ DashboardThreadDetail: "dashboard-thread-detail" }));
  vi.doMock("./dashboard-threads-panel", () => ({ DashboardThreadsPanel: "dashboard-threads-panel" }));
  vi.doMock("@/lib/user-display", () => ({ displayNameFromEmail: () => "Tina Bauer", initialsFromLabel: () => "TB" }));
  vi.doMock("./dashboard-ui", () => ({ SearchIcon: "search-icon" }));
  const module = await import("./dashboard-client");
  return { DashboardClient: module.DashboardClient, navigation, reactMocks, state, unreadCount };
}

describe("dashboard client hotspots", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("omits resolved toggles without an active conversation and safely no-ops when search focus cannot find an input", async () => {
    const listeners: Record<string, (event: Record<string, unknown>) => void> = {};
    vi.stubGlobal("document", { addEventListener: vi.fn(), removeEventListener: vi.fn(), getElementById: vi.fn(() => null) });
    vi.stubGlobal("window", { innerWidth: 1280, addEventListener: vi.fn((name: string, handler: (event: Record<string, unknown>) => void) => { listeners[name] = handler; }), removeEventListener: vi.fn(), history: { pushState: vi.fn() } });

    const { DashboardClient, reactMocks, state } = await loadDashboardClient({ activeConversation: null, filteredConversations: [] });
    reactMocks.beginRender();
    let tree = DashboardClient(createProps(null as never));
    await runMockEffects(reactMocks.effects);
    listeners.keydown?.({ key: "k", ctrlKey: true, preventDefault: vi.fn(), target: null });
    reactMocks.beginRender();
    tree = DashboardClient(createProps(null as never));
    const focusButton = collect(tree, (element) => element.type === "button" && JSON.stringify(element.props.children).includes("Focus search"))[0];
    focusButton?.props.onClick();

    expect(JSON.stringify(tree)).not.toContain("Mark conversation resolved");
    expect(JSON.stringify(tree)).not.toContain("Reopen conversation");
    expect(state.clearActiveConversation).not.toHaveBeenCalled();
    expect(reactMocks.states[0]?.current).toBe(false);
  });

  it("reopens resolved conversations from the palette and navigates to widget settings", async () => {
    const listeners: Record<string, (event: Record<string, unknown>) => void> = {};
    vi.stubGlobal("document", { addEventListener: vi.fn(), removeEventListener: vi.fn(), getElementById: vi.fn(() => ({ focus: vi.fn(), select: vi.fn() })) });
    vi.stubGlobal("window", { innerWidth: 960, addEventListener: vi.fn((name: string, handler: (event: Record<string, unknown>) => void) => { listeners[name] = handler; }), removeEventListener: vi.fn(), history: { pushState: vi.fn() } });

    const resolvedThread = createConversationThread({ status: "resolved" });
    const { DashboardClient, navigation, reactMocks, state } = await loadDashboardClient({ activeConversation: resolvedThread });
    reactMocks.beginRender();
    let tree = DashboardClient(createProps(resolvedThread));
    await runMockEffects(reactMocks.effects);
    listeners.keydown?.({ key: "k", metaKey: true, preventDefault: vi.fn(), target: null });
    reactMocks.beginRender();
    tree = DashboardClient(createProps(resolvedThread));

    const buttons = collect(tree, (element) => element.type === "button");
    buttons.find((element) => JSON.stringify(element.props.children).includes("Reopen conversation"))?.props.onClick();
    buttons.find((element) => JSON.stringify(element.props.children).includes("Open widget settings"))?.props.onClick();

    expect(state.handleConversationStatusChange).toHaveBeenCalledWith("open");
    expect(navigation.navigate).toHaveBeenCalledWith("/dashboard/widget");
    expect(reactMocks.states[4]?.current).toBe(false);
  });

  it("executes the thread-panel and detail callbacks that wire inbox navigation together", async () => {
    vi.stubGlobal("document", { addEventListener: vi.fn(), removeEventListener: vi.fn(), getElementById: vi.fn(() => ({ focus: vi.fn(), select: vi.fn() })) });
    vi.stubGlobal("window", { innerWidth: 1280, addEventListener: vi.fn(), removeEventListener: vi.fn(), history: { pushState: vi.fn() } });

    const { DashboardClient, reactMocks, state } = await loadDashboardClient({});
    reactMocks.beginRender();
    let tree = DashboardClient(createProps());
    await runMockEffects(reactMocks.effects);
    let panel = collect(tree, (element) => element.type === "dashboard-threads-panel")[0];
    let detail = collect(tree, (element) => element.type === "dashboard-thread-detail")[0];

    panel?.props.onThreadFilterChange("unread");
    panel?.props.onSearchQueryChange("vip");
    panel?.props.onClearSearch();
    panel?.props.onSelectConversation("conv_2");
    detail?.props.onOpenSidebar();
    reactMocks.beginRender();
    tree = DashboardClient(createProps());
    detail = collect(tree, (element) => element.type === "dashboard-thread-detail")[0];
    detail?.props.onCloseSidebar();
    detail?.props.onBack();

    expect(state.setThreadFilter).toHaveBeenCalledWith("unread");
    expect(state.setSearchQuery).toHaveBeenCalledWith("vip");
    expect(state.setSearchQuery).toHaveBeenCalledWith("");
    expect(state.openConversation).toHaveBeenCalledWith("conv_2");
    expect(state.clearActiveConversation).toHaveBeenCalled();
    expect((globalThis.window as Window).history.pushState).toHaveBeenCalledWith(null, "", "/dashboard/inbox");
  });

  it("covers escape precedence, typing-target guards, and loading summaries", async () => {
    const windowListeners: Record<string, (event?: Record<string, unknown>) => void> = {};
    vi.stubGlobal("document", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getElementById: vi.fn(() => null)
    });
    vi.stubGlobal("window", {
      innerWidth: 1280,
      addEventListener: vi.fn((name: string, handler: (event?: Record<string, unknown>) => void) => { windowListeners[name] = handler; }),
      removeEventListener: vi.fn(),
      history: { pushState: vi.fn() }
    });

    const { DashboardClient, reactMocks } = await loadDashboardClient({ loadingConversationId: "missing" });
    reactMocks.beginRender();
    let tree = DashboardClient(createProps());
    await runMockEffects(reactMocks.effects);
    windowListeners.keydown?.({ key: "k", ctrlKey: true, preventDefault: vi.fn(), target: null });
    reactMocks.beginRender();
    tree = DashboardClient(createProps());
    await runMockEffects(reactMocks.effects);
    windowListeners.keydown?.({ key: "Escape", preventDefault: vi.fn(), target: null });
    windowListeners.keydown?.({ key: "ArrowDown", preventDefault: vi.fn(), target: { tagName: "TEXTAREA", isContentEditable: false } });
    const detail = collect(tree, (element) => element.type === "dashboard-thread-detail")[0];

    expect(reactMocks.states[0]?.current).toBe(false);
    expect(detail?.props.loadingConversationSummary).toBeNull();
  });
});
