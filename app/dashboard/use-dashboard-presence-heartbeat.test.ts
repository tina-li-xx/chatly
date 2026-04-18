import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

const PRESENCE_LEADER_KEY = "chatting.dashboard.presence.leader";

async function loadPresenceHeartbeat() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();

  vi.doMock("react", () => reactMocks.moduleFactory());

  const module = await import("./use-dashboard-presence-heartbeat");
  return { reactMocks, useDashboardPresenceHeartbeat: module.useDashboardPresenceHeartbeat };
}

function createLocalStorage(initialState: Record<string, string> = {}) {
  const state = { ...initialState };
  return {
    state,
    getItem: vi.fn((key: string) => state[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      state[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete state[key];
    })
  };
}

describe("dashboard presence heartbeat", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts immediately when the dashboard is visible and cleans up its timer", async () => {
    const listeners: Record<string, () => void> = {};
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    const localStorage = createLocalStorage();

    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("document", {
      visibilityState: "visible",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    });
    vi.stubGlobal("window", {
      localStorage,
      setInterval: vi.fn().mockReturnValue(7),
      clearInterval: vi.fn(),
      setTimeout: vi.fn().mockReturnValue(9),
      clearTimeout: vi.fn(),
      addEventListener: vi.fn((name: string, handler: () => void) => {
        listeners[name] = handler;
      }),
      removeEventListener: vi.fn()
    });

    const { reactMocks, useDashboardPresenceHeartbeat } = await loadPresenceHeartbeat();
    reactMocks.beginRender();
    useDashboardPresenceHeartbeat();
    const cleanups = await runMockEffects(reactMocks.effects);

    expect(fetchMock).toHaveBeenCalledWith("/dashboard/presence", { method: "POST", keepalive: true });
    expect((globalThis.window as Window).setInterval).toHaveBeenCalledWith(expect.any(Function), 30000);
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);

    listeners.focus?.();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    cleanups.forEach((cleanup) => cleanup());
    expect((globalThis.window as Window).clearInterval).toHaveBeenCalledWith(7);
    expect(localStorage.removeItem).toHaveBeenCalledWith(PRESENCE_LEADER_KEY);
  });

  it("waits for visibility before starting and releases leadership when hidden", async () => {
    const documentListeners: Record<string, () => void> = {};
    let visibilityState = "hidden";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    const localStorage = createLocalStorage();

    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("document", {
      get visibilityState() {
        return visibilityState;
      },
      addEventListener: vi.fn((name: string, handler: () => void) => {
        documentListeners[name] = handler;
      }),
      removeEventListener: vi.fn()
    });
    vi.stubGlobal("window", {
      localStorage,
      setInterval: vi.fn().mockReturnValue(3),
      clearInterval: vi.fn(),
      setTimeout: vi.fn().mockReturnValue(5),
      clearTimeout: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    });

    const { reactMocks, useDashboardPresenceHeartbeat } = await loadPresenceHeartbeat();
    reactMocks.beginRender();
    useDashboardPresenceHeartbeat();
    await runMockEffects(reactMocks.effects);

    expect(fetchMock).not.toHaveBeenCalled();

    visibilityState = "visible";
    documentListeners.visibilitychange?.();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    visibilityState = "hidden";
    documentListeners.visibilitychange?.();
    expect((globalThis.window as Window).clearInterval).toHaveBeenCalledWith(3);
    expect(localStorage.removeItem).toHaveBeenCalledWith(PRESENCE_LEADER_KEY);
  });

  it("stays passive behind another visible tab and takes over when that leader disappears", async () => {
    const windowListeners: Record<string, (event?: StorageEvent) => void> = {};
    const documentListeners: Record<string, () => void> = {};
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    const localStorage = createLocalStorage({
      [PRESENCE_LEADER_KEY]: JSON.stringify({
        tabId: "leader-tab",
        expiresAt: Date.now() + 60000
      })
    });

    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("document", {
      visibilityState: "visible",
      addEventListener: vi.fn((name: string, handler: () => void) => {
        documentListeners[name] = handler;
      }),
      removeEventListener: vi.fn()
    });
    vi.stubGlobal("window", {
      localStorage,
      setInterval: vi.fn().mockReturnValue(11),
      clearInterval: vi.fn(),
      setTimeout: vi.fn().mockReturnValue(13),
      clearTimeout: vi.fn(),
      addEventListener: vi.fn((name: string, handler: (event?: StorageEvent) => void) => {
        windowListeners[name] = handler;
      }),
      removeEventListener: vi.fn()
    });

    const { reactMocks, useDashboardPresenceHeartbeat } = await loadPresenceHeartbeat();
    reactMocks.beginRender();
    useDashboardPresenceHeartbeat();
    await runMockEffects(reactMocks.effects);

    expect(fetchMock).not.toHaveBeenCalled();
    expect((globalThis.window as Window).setTimeout).toHaveBeenCalled();
    expect((globalThis.window as Window).setInterval).not.toHaveBeenCalled();

    delete localStorage.state[PRESENCE_LEADER_KEY];
    windowListeners.storage?.({ key: PRESENCE_LEADER_KEY } as StorageEvent);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect((globalThis.window as Window).setInterval).toHaveBeenCalledWith(expect.any(Function), 30000);
    expect(documentListeners.visibilitychange).toBeTypeOf("function");
  });
});
