import type { ReactElement, ReactNode } from "react";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child) => collectElements(child, predicate));
  }
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collectElements(element.props?.children, predicate)];
}

async function loadNotificationCenter(options?: { pathname?: string; searchId?: string | null; toast?: Record<string, unknown> | null; visibility?: string; permission?: string }) {
  vi.resetModules();
  const eventSources: Array<{ onmessage?: (event: { data: string }) => void; close: ReturnType<typeof vi.fn> }> = [];
  const windowListeners: Record<string, (event: Event) => void> = {};
  const navigate = vi.fn();
  const reactMocks = createMockReactHooks({ stateOverrides: new Map([[1, options?.toast ?? null]]) });

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({
    usePathname: () => options?.pathname ?? "/dashboard",
    useSearchParams: () => ({ get: (key: string) => (key === "id" ? options?.searchId ?? null : null) })
  }));
  vi.doMock("./dashboard-shell", () => ({ useDashboardNavigation: () => ({ navigate }) }));
  vi.doMock("./dashboard-ui", () => ({ pageLabelFromUrl: () => "/pricing", XIcon: () => <svg /> }));
  vi.stubGlobal("document", { visibilityState: options?.visibility ?? "hidden", addEventListener: vi.fn(), removeEventListener: vi.fn() });
  vi.stubGlobal("EventSource", class { onmessage?: (event: { data: string }) => void; close = vi.fn(); constructor() { eventSources.push(this); } });

  const notifications: Array<{ title: string; body: string }> = [];
  class MockNotification {
    static permission = options?.permission ?? "default";
    static requestPermission = vi.fn().mockResolvedValue("granted");
    constructor(title: string, payload: { body: string }) { notifications.push({ title, body: payload.body }); }
  }
  vi.stubGlobal("Notification", MockNotification as never);
  vi.stubGlobal("window", {
    AudioContext: undefined,
    Notification: MockNotification,
    addEventListener: vi.fn((name: string, handler: (event: Event) => void) => { windowListeners[name] = handler; }),
    removeEventListener: vi.fn(),
    setTimeout: vi.fn().mockReturnValue(1),
    clearTimeout: vi.fn()
  });

  const module = await import("./dashboard-notification-center");
  return { DashboardNotificationCenter: module.DashboardNotificationCenter, eventSources, windowListeners, navigate, notifications, reactMocks };
}

describe("dashboard notification center more", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("updates settings from window events and ignores invalid or already-open conversation messages", async () => {
    const { DashboardNotificationCenter, eventSources, windowListeners, notifications, reactMocks } = await loadNotificationCenter({
      pathname: "/dashboard/inbox",
      searchId: "conv_1",
      visibility: "visible",
      permission: "granted"
    });

    reactMocks.beginRender();
    DashboardNotificationCenter({ initialSettings: { browserNotifications: true, soundAlerts: true, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: false } });
    await runMockEffects(reactMocks.effects);

    windowListeners["chatting:notification-settings-updated"]?.(
      new CustomEvent("chatting:notification-settings-updated", {
        detail: { browserNotifications: true, soundAlerts: false, emailNotifications: true, newVisitorAlerts: true, highIntentAlerts: false }
      })
    );
    reactMocks.beginRender();
    DashboardNotificationCenter({ initialSettings: { browserNotifications: true, soundAlerts: true, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: false } });
    await runMockEffects(reactMocks.effects);
    eventSources[0]?.onmessage?.({ data: "not json" });
    eventSources[0]?.onmessage?.({ data: JSON.stringify({ type: "connected" }) });
    eventSources[0]?.onmessage?.({
      data: JSON.stringify({ type: "message.created", sender: "user", conversationId: "conv_1", preview: "Pricing help", pageUrl: "https://example.com/pricing", visitorLabel: "Alex", location: "London", highIntent: false, isNewVisitor: false })
    });
    eventSources[0]?.onmessage?.({
      data: JSON.stringify({ type: "message.created", sender: "user", conversationId: "conv_2", preview: "Hello there", pageUrl: "https://example.com/pricing", visitorLabel: "", location: "", highIntent: false, isNewVisitor: true })
    });

    expect(reactMocks.states[1]?.current).toEqual({
      conversationId: "conv_2",
      title: "New visitor on /pricing",
      preview: "Hello there"
    });
    expect(notifications).toEqual([]);
  });

  it("dismisses toasts via keyboard and button interactions", async () => {
    const { DashboardNotificationCenter, navigate, reactMocks } = await loadNotificationCenter({
      toast: { conversationId: "conv_1", title: "Alex", preview: "Pricing help" }
    });

    reactMocks.beginRender();
    const tree = DashboardNotificationCenter({
      initialSettings: { browserNotifications: false, soundAlerts: false, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: false }
    }) as ReactElement;
    const toastTree = (tree.type as (props: Record<string, unknown>) => ReactElement)(tree.props);
    const dismissButton = collectElements(toastTree, (element) => element.type === "button" && element.props["aria-label"] === "Dismiss notification")[0];

    (toastTree.props.onKeyDown as (event: { key: string; preventDefault: () => void }) => void)({ key: " ", preventDefault: vi.fn() });
    expect(navigate).toHaveBeenCalledWith("/dashboard/inbox?id=conv_1");
    expect(reactMocks.states[1]?.current).toBeNull();

    const dismissState = await loadNotificationCenter({
      toast: { conversationId: "conv_2", title: "Blake", preview: "Need help" }
    });
    dismissState.reactMocks.beginRender();
    const dismissTree = dismissState.DashboardNotificationCenter({
      initialSettings: { browserNotifications: false, soundAlerts: false, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: false }
    }) as ReactElement;
    const dismissToastTree = (dismissTree.type as (props: Record<string, unknown>) => ReactElement)(dismissTree.props);
    const closeButton = collectElements(dismissToastTree, (element) => element.type === "button" && element.props["aria-label"] === "Dismiss notification")[0];
    closeButton?.props.onClick({ stopPropagation: vi.fn() });
    expect(dismissState.reactMocks.states[1]?.current).toBeNull();
  });
});
