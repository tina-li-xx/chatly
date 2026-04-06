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
      createConversationSummary({ id: "conv_2", status: "resolved", city: "Paris" })
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

async function loadDashboardState(options?: { pathname?: string; search?: string | null }) {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const liveSyncCalls: unknown[] = [];

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({
    usePathname: () => options?.pathname ?? "/dashboard/inbox",
    useSearchParams: () =>
      options?.search === null ? null : new URLSearchParams(options?.search ?? "")
  }));
  vi.doMock("./use-dashboard-live-sync", () => ({
    useDashboardLiveSync: (args: unknown) => {
      liveSyncCalls.push(args);
    }
  }));
  vi.doMock("./use-dashboard-actions", () => ({
    createDashboardActions: () => ({
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
    })
  }));

  const module = await import("./use-dashboard-state");
  return { liveSyncCalls, reactMocks, useDashboardState: module.useDashboardState };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

describe("use dashboard state additional coverage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("skips URL cleanup without search params and leaves state alone on failed refreshes", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockRejectedValueOnce(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { history: { replaceState: vi.fn() } });
    const { liveSyncCalls, reactMocks, useDashboardState } = await loadDashboardState({
      pathname: "/dashboard/visitors",
      search: null
    });

    reactMocks.beginRender();
    useDashboardState(createProps());
    await runMockEffects(reactMocks.effects);
    const sync = liveSyncCalls[0] as {
      refreshConversationList: () => Promise<void>;
      refreshConversation: (conversationId: string) => Promise<unknown>;
    };

    await sync.refreshConversationList();
    await expect(sync.refreshConversation("missing")).resolves.toBeNull();
    await expect(sync.refreshConversationList()).resolves.toBeUndefined();

    expect(reactMocks.states[1]?.current).toHaveLength(2);
    expect((globalThis.window as Window).history.replaceState).not.toHaveBeenCalled();
  });

  it("clears stale typing state and ignores stale open requests", async () => {
    const first = deferred<{ ok: true; json: () => Promise<{ ok: true; conversation: ReturnType<typeof createConversationThread> }> }>();
    const second = deferred<{ ok: true; json: () => Promise<{ ok: true; conversation: ReturnType<typeof createConversationThread> }> }>();
    const fetchMock = vi.fn((input: string) => {
      if (input.includes("conversationId=conv_2")) return first.promise;
      if (input.includes("conversationId=conv_3")) return second.promise;
      return Promise.resolve({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { history: { replaceState: vi.fn() } });
    const { reactMocks, useDashboardState } = await loadDashboardState();

    reactMocks.beginRender();
    const state = useDashboardState(
      createProps({
        initialActiveConversation: createConversationThread({ id: "conv_1" })
      })
    );
    reactMocks.refs[0]!.current = "conv_typing";
    await runMockEffects(reactMocks.effects);

    const openSecond = state.openConversation("conv_2");
    const openThird = state.openConversation("conv_3");
    first.resolve({
      ok: true,
      json: async () => ({ ok: true, conversation: createConversationThread({ id: "conv_2" }) })
    });
    second.resolve({
      ok: true,
      json: async () => ({ ok: true, conversation: createConversationThread({ id: "conv_3" }) })
    });
    await Promise.all([openSecond, openThird]);

    expect(fetchMock).toHaveBeenCalledWith(
      "/dashboard/typing",
      expect.objectContaining({ method: "POST", keepalive: true })
    );
    expect(reactMocks.states[2]?.current).toEqual(expect.objectContaining({ id: "conv_3" }));
    expect((reactMocks.states[1]?.current as Array<{ id: string }>).at(0)?.id).toBe("conv_3");
  });
});
