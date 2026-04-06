import type { ReactElement, ReactNode } from "react";
import type { DashboardClientProps } from "./dashboard-client.types";
import { createConversationSummary, createConversationThread, createSite } from "./use-dashboard-actions.test-helpers";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

function createProps(): DashboardClientProps {
  return {
    userEmail: "tina@usechatting.com",
    initialStats: { totalConversations: 2, answeredConversations: 1, ratedConversations: 0, topTags: [] },
    initialSites: [createSite()],
    initialConversations: [createConversationSummary(), createConversationSummary({ id: "conv_2" })],
    initialActiveConversation: createConversationThread(),
    initialAiAssistSettings: {
      replySuggestionsEnabled: true,
      conversationSummariesEnabled: true,
      rewriteAssistanceEnabled: true,
      suggestedTagsEnabled: true
    },
    initialBillingPlanKey: "growth"
  };
}

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collectElements(element.props?.children, predicate)];
}

async function loadDashboardClient(stateOverrides: Record<string, unknown> = {}) {
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
    visitorTypingConversationId: "conv_1",
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

describe("dashboard client more", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("covers shortcuts, palette filtering, typing-target guards, and sidebar escape", async () => {
    const listeners: Record<string, (event: Record<string, unknown>) => void> = {};
    const searchInput = { focus: vi.fn(), select: vi.fn() };
    vi.stubGlobal("document", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getElementById: vi.fn(() => searchInput)
    });
    vi.stubGlobal("window", {
      innerWidth: 1280,
      addEventListener: vi.fn((name: string, handler: (event: Record<string, unknown>) => void) => { listeners[name] = handler; }),
      removeEventListener: vi.fn(),
      history: { pushState: vi.fn() }
    });

    const { DashboardClient, navigation, reactMocks, state } = await loadDashboardClient();
    reactMocks.beginRender();
    let tree = DashboardClient(createProps());
    await runMockEffects(reactMocks.effects);

    listeners.keydown?.({ key: "/", metaKey: true, preventDefault: vi.fn(), target: null });
    expect(reactMocks.states[2]?.current).toBe(true);
    reactMocks.beginRender();
    tree = DashboardClient(createProps());
    await runMockEffects(reactMocks.effects);
    listeners.keydown?.({ key: "Escape", preventDefault: vi.fn(), target: null });
    expect(reactMocks.states[2]?.current).toBe(false);

    const detail = collectElements(tree, (element) => element.type === "dashboard-thread-detail")[0];
    detail?.props.onOpenSidebar();
    reactMocks.beginRender();
    tree = DashboardClient(createProps());
    await runMockEffects(reactMocks.effects);
    listeners.keydown?.({ key: "Escape", preventDefault: vi.fn(), target: null });
    expect(reactMocks.states[3]?.current).toBe(false);
    expect(state.clearActiveConversation).not.toHaveBeenCalled();

    listeners.keydown?.({ key: "k", ctrlKey: true, preventDefault: vi.fn(), target: null });
    reactMocks.beginRender();
    tree = DashboardClient(createProps());
    const paletteInput = collectElements(tree, (element) => element.type === "input")[0];
    paletteInput?.props.onChange({ currentTarget: { value: "zzz" } });
    reactMocks.beginRender();
    tree = DashboardClient(createProps());
    expect(JSON.stringify(tree)).toContain("No commands found");
    listeners.keydown?.({ key: "Escape", preventDefault: vi.fn(), target: null });

    listeners.keydown?.({ key: "n", preventDefault: vi.fn(), target: { tagName: "INPUT", isContentEditable: false } });
    expect(searchInput.focus).not.toHaveBeenCalled();

    listeners.keydown?.({ key: "n", preventDefault: vi.fn(), target: null });
    expect(searchInput.focus).toHaveBeenCalled();
    listeners.keydown?.({ key: "ArrowUp", preventDefault: vi.fn(), target: null });
    expect(reactMocks.states[5]?.current).toBe("conv_1");

    listeners.keydown?.({ key: "k", ctrlKey: true, preventDefault: vi.fn(), target: null });
    reactMocks.beginRender();
    tree = DashboardClient(createProps());
    const settingsButton = collectElements(
      tree,
      (element) => element.type === "button" && JSON.stringify(element.props.children).includes("Open settings")
    )[0];
    settingsButton?.props.onClick();
    expect(navigation.navigate).toHaveBeenCalledWith("/dashboard/settings");
  });

  it("posts ai assist analytics events to the server logger", async () => {
    const listeners: Record<string, (event: Record<string, unknown>) => void> = {};
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("document", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getElementById: vi.fn(() => null)
    });
    vi.stubGlobal("window", {
      innerWidth: 1280,
      addEventListener: vi.fn((name: string, handler: (event: Record<string, unknown>) => void) => {
        listeners[name] = handler;
      }),
      removeEventListener: vi.fn(),
      history: { pushState: vi.fn() }
    });

    const { DashboardClient, reactMocks } = await loadDashboardClient();
    reactMocks.beginRender();
    DashboardClient(createProps());
    await runMockEffects(reactMocks.effects);

    listeners["chatly:analytics-event"]?.({
      detail: {
        name: "ai.rewrite.applied",
        conversationId: "conv_1",
        tone: "friendlier"
      }
    });
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledWith("/dashboard/ai-assist/events", {
      method: "POST",
      keepalive: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "ai.rewrite.applied",
        conversationId: "conv_1",
        metadata: {
          tone: "friendlier"
        }
      })
    });
  });
});
