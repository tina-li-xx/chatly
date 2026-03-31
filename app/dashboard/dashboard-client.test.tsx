import type { ReactNode, ReactElement } from "react";
import type { DashboardClientProps } from "./dashboard-client.types";
import {
  createConversationSummary,
  createConversationThread,
  createSite
} from "./use-dashboard-actions.test-helpers";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

function createProps(): DashboardClientProps {
  return {
    userEmail: "tina@usechatting.com",
    initialStats: { totalConversations: 2, answeredConversations: 1, ratedConversations: 0, topTags: [] },
    initialSites: [createSite()],
    initialConversations: [createConversationSummary(), createConversationSummary({ id: "conv_2" })],
    initialActiveConversation: createConversationThread()
  };
}

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child) => collectElements(child, predicate));
  }
  const element = node as ReactElement;
  return [
    ...(predicate(element) ? [element] : []),
    ...collectElements(element.props?.children, predicate)
  ];
}

function textOf(node: ReactNode): string {
  if (!node || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(textOf).join(" ");
  }
  return textOf((node as ReactElement).props?.children);
}

async function loadDashboardClient() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const navigation = { navigate: vi.fn() };
  const state = {
    conversations: [createConversationSummary(), createConversationSummary({ id: "conv_2" })],
    filteredConversations: [createConversationSummary(), createConversationSummary({ id: "conv_2" })],
    activeConversation: createConversationThread(),
    loadingConversationId: null,
    savingEmail: false,
    sendingReply: false,
    updatingStatus: false,
    visitorTypingConversationId: "conv_1",
    liveConnectionState: "reconnecting" as const,
    threadFilter: "all" as const,
    searchQuery: "",
    setThreadFilter: vi.fn(),
    setSearchQuery: vi.fn(),
    handleSaveConversationEmail: vi.fn(),
    handleReplySend: vi.fn(),
    handleConversationStatusChange: vi.fn(),
    handleReplyComposerBlur: vi.fn(),
    handleReplyComposerFocus: vi.fn(),
    handleReplyComposerInput: vi.fn(),
    handleTagToggle: vi.fn(),
    openConversation: vi.fn(),
    clearActiveConversation: vi.fn()
  };

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("./dashboard-shell", () => ({ useDashboardNavigation: () => navigation }));
  vi.doMock("./use-dashboard-state", () => ({ useDashboardState: () => state }));
  vi.doMock("./dashboard-thread-detail", () => ({ DashboardThreadDetail: "dashboard-thread-detail" }));
  vi.doMock("./dashboard-threads-panel", () => ({ DashboardThreadsPanel: "dashboard-threads-panel" }));
  vi.doMock("@/lib/user-display", () => ({
    displayNameFromEmail: () => "Tina Bauer",
    initialsFromLabel: () => "TB"
  }));
  vi.doMock("./dashboard-ui", () => ({ SearchIcon: "search-icon" }));

  const module = await import("./dashboard-client");
  return { DashboardClient: module.DashboardClient, navigation, reactMocks, state };
}

describe("dashboard client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts the presence heartbeat and maps inbox props into thread panels", async () => {
    const listeners: Record<string, () => void> = {};
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("document", {
      visibilityState: "visible",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getElementById: vi.fn(() => null)
    });
    vi.stubGlobal("window", {
      innerWidth: 640,
      setInterval: vi.fn().mockReturnValue(1),
      clearInterval: vi.fn(),
      addEventListener: vi.fn((name: string, handler: () => void) => { listeners[name] = handler; }),
      removeEventListener: vi.fn(),
      history: { pushState: vi.fn() }
    });

    const { DashboardClient, reactMocks } = await loadDashboardClient();
    reactMocks.beginRender();
    const tree = DashboardClient(createProps());
    const cleanups = await runMockEffects(reactMocks.effects);

    const panels = collectElements(tree, (element) => element.type === "dashboard-threads-panel");
    const details = collectElements(tree, (element) => element.type === "dashboard-thread-detail");

    expect(fetchMock).toHaveBeenCalledWith("/dashboard/presence", expect.objectContaining({ method: "POST" }));
    expect((globalThis.window as Window).setInterval).toHaveBeenCalledWith(expect.any(Function), 30000);
    listeners.focus?.();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(panels).toHaveLength(1);
    expect(panels[0]?.props.initialWidgetInstalled).toBe(true);
    expect(panels[0]?.props.widgetSiteIds).toEqual(["site_1"]);
    expect(details[0]?.props.showBackButton).toBe(true);
    expect(details[0]?.props.isLiveDisconnected).toBe(true);
    expect(reactMocks.states[4]?.current).toBe(false);
    cleanups.forEach((cleanup) => cleanup());
    expect((globalThis.window as Window).clearInterval).toHaveBeenCalled();
  });

  it("handles keyboard navigation, command palette actions, and inbox clearing", async () => {
    const listeners: Record<string, (event: Record<string, unknown>) => void> = {};
    const searchInput = { focus: vi.fn(), select: vi.fn() };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    vi.stubGlobal("document", {
      visibilityState: "visible",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getElementById: vi.fn(() => searchInput)
    });
    vi.stubGlobal("window", {
      innerWidth: 1280,
      setInterval: vi.fn().mockReturnValue(1),
      clearInterval: vi.fn(),
      addEventListener: vi.fn((name: string, handler: (event: Record<string, unknown>) => void) => {
        listeners[name] = handler;
      }),
      removeEventListener: vi.fn(),
      history: { pushState: vi.fn() }
    });

    const { DashboardClient, navigation, reactMocks, state } = await loadDashboardClient();
    reactMocks.beginRender();
    DashboardClient(createProps());
    await runMockEffects(reactMocks.effects);

    listeners.keydown?.({ key: "ArrowDown", preventDefault: vi.fn(), target: null });
    expect(reactMocks.states[5]?.current).toBe("conv_2");

    reactMocks.beginRender();
    let tree = DashboardClient(createProps());
    await runMockEffects(reactMocks.effects);
    listeners.keydown?.({ key: "Enter", preventDefault: vi.fn(), target: null });
    listeners.keydown?.({ key: "r", preventDefault: vi.fn(), target: null });
    listeners.keydown?.({ key: "n", preventDefault: vi.fn(), target: null });
    listeners.keydown?.({ key: "k", ctrlKey: true, preventDefault: vi.fn(), target: null });
    expect(state.openConversation).toHaveBeenCalledWith("conv_2");
    expect((globalThis.window as Window).history.pushState).toHaveBeenCalledWith(
      null,
      "",
      "/dashboard/inbox?id=conv_2"
    );
    expect(state.handleConversationStatusChange).toHaveBeenCalledWith("resolved");
    expect(searchInput.focus).toHaveBeenCalled();
    expect(reactMocks.states[0]?.current).toBe(true);

    reactMocks.beginRender();
    tree = DashboardClient(createProps());
    const visitorsButton = collectElements(
      tree,
      (element) => element.type === "button" && textOf(element.props.children).includes("Open visitors")
    )[0];
    visitorsButton?.props.onClick();
    expect(navigation.navigate).toHaveBeenCalledWith("/dashboard/visitors");
    expect(reactMocks.states[0]?.current).toBe(false);

    listeners.keydown?.({ key: "Escape", preventDefault: vi.fn(), target: null });
    expect(state.clearActiveConversation).toHaveBeenCalled();
    expect((globalThis.window as Window).history.pushState).toHaveBeenCalledWith(null, "", "/dashboard/inbox");
  });
});
