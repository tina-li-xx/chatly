import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

async function loadDashboardShell(options?: {
  pathname?: string;
  liveUnreadCount?: number;
}) {
  vi.resetModules();
  const captures: Record<string, unknown> = {};
  const heartbeat = vi.fn();
  const timezoneSync = vi.fn();
  const router = { prefetch: vi.fn(), push: vi.fn() };
  const reactMocks = createMockReactHooks();

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({
    usePathname: () => options?.pathname ?? "/dashboard/inbox",
    useRouter: () => router
  }));
  vi.doMock("./dashboard-notification-center", () => ({
    DashboardNotificationCenter: (props: unknown) => {
      captures.notification = props;
      return <div>notifications</div>;
    }
  }));
  vi.doMock("./dashboard-ai-assist-warning-banner", () => ({
    DashboardAiAssistWarningBanner: (props: unknown) => {
      captures.aiAssistWarning = props;
      return <div>ai-warning</div>;
    }
  }));
  vi.doMock("./use-dashboard-presence-heartbeat", () => ({
    useDashboardPresenceHeartbeat: heartbeat
  }));
  vi.doMock("./use-dashboard-timezone-sync", () => ({
    useDashboardTimezoneSync: timezoneSync
  }));
  vi.doMock("./use-dashboard-live-unread-count", () => ({
    useDashboardLiveUnreadCount: (initialUnreadCount: number) => ({
      unreadCount: options?.liveUnreadCount ?? initialUnreadCount,
      setUnreadCount: vi.fn()
    })
  }));
  vi.doMock("./dashboard-unread-count", () => ({
    DashboardUnreadCountProvider: ({ children }: { children: unknown }) => <>{children}</>
  }));
  vi.doMock("./dashboard-shell-layout", () => ({
    DashboardHeader: (props: unknown) => {
      captures.header = props;
      return <div>header</div>;
    },
    DashboardMain: (props: unknown) => {
      captures.main = props;
      return <div>main</div>;
    },
    DesktopSidebar: (props: unknown) => {
      captures.sidebar = props;
      return <div>sidebar</div>;
    },
    MobileChrome: (props: unknown) => {
      captures.mobile = props;
      return <div>mobile</div>;
    },
    dashboardGreeting: (hour: number | null) => (hour == null ? "Hello" : `Greeting-${hour}`),
    getDashboardIdentity: () => ({ displayName: "Tina Bauer", firstName: "Tina", initials: "TB" }),
    routeHeaderText: (pathname: string, firstName: string, greeting: string) => ({
      title: `${pathname}:${firstName}:${greeting}`,
      subtitle: "subtitle"
    })
  }));
  vi.doMock("./dashboard-shell-navigation", () => ({
    DashboardNavigationContext: {
      Provider: ({ value, children }: { value: unknown; children: unknown }) => {
        captures.navigation = value;
        return <>{children}</>;
      }
    },
    PRIMARY_NAV: [{ href: "/dashboard" }, { href: "/dashboard/inbox" }],
    getDashboardSettingsNav: (userEmail: string) =>
      userEmail === "tina@usechatting.com"
        ? [{ href: "/dashboard/settings" }, { href: "/dashboard/publishing" }]
        : [{ href: "/dashboard/settings" }]
  }));
  vi.doMock("@/lib/utils", () => ({
    classNames: (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ")
  }));

  const module = await import("./dashboard-shell");
  return { DashboardShell: module.DashboardShell, captures, heartbeat, reactMocks, router, timezoneSync };
}

function renderShell(
  DashboardShell: Awaited<ReturnType<typeof loadDashboardShell>>["DashboardShell"],
  props: Partial<Parameters<typeof DashboardShell>[0]>
) {
  return renderToStaticMarkup(
    <DashboardShell
      userEmail="tina@usechatting.com"
      unreadCount={0}
      notificationSettings={{} as never}
      aiAssistWarning={null}
      canManageBilling
      {...props}
    >
      <div>content</div>
    </DashboardShell>
  );
}

describe("dashboard shell", () => {
  it("renders the inbox shell state and runs its effects", async () => {
    vi.stubGlobal("document", { body: { style: { overflow: "", overscrollBehavior: "" } }, documentElement: { style: { overflow: "", overscrollBehavior: "" } } });
    vi.stubGlobal("window", {
      location: { pathname: "/dashboard/inbox", search: "", hash: "" },
      matchMedia: () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    });
    const { DashboardShell, captures, heartbeat, reactMocks, router, timezoneSync } = await loadDashboardShell();
    reactMocks.beginRender();
    renderShell(DashboardShell, {
      unreadCount: 3,
      notificationSettings: { browserNotifications: true } as never,
      aiAssistWarning: { state: "limited" } as never
    });
    const cleanups = await runMockEffects(reactMocks.effects);

    expect(captures.notification).toEqual({ initialSettings: { browserNotifications: true } });
    expect(heartbeat).toHaveBeenCalled();
    expect(timezoneSync).toHaveBeenCalled();
    expect(captures.mobile).toEqual({ pathname: "/dashboard/inbox", unreadCount: 3, userEmail: "tina@usechatting.com" });
    expect(captures.header).toEqual(
      expect.objectContaining({ showUnreadBadge: true, unreadCount: 3, firstName: "Tina", showProfileShortcut: true })
    );
    expect(captures.aiAssistWarning).toEqual(expect.objectContaining({ warning: { state: "limited" }, canManageBilling: true }));
    expect(captures.main).toEqual(expect.objectContaining({ isInboxRoute: true }));
    expect(router.prefetch).toHaveBeenCalledTimes(4);
    expect((globalThis.document as Document).documentElement.style.overflow).toBe("hidden");
    cleanups.at(-1)?.();
    expect((globalThis.document as Document).documentElement.style.overflow).toBe("");
    vi.unstubAllGlobals();
  });

  it("navigates through the shared dashboard navigation context", async () => {
    vi.stubGlobal("window", { location: { pathname: "/dashboard", search: "", hash: "" } });
    const { DashboardShell, captures, reactMocks, router } = await loadDashboardShell({ pathname: "/dashboard" });
    reactMocks.beginRender();
    renderShell(DashboardShell, { aiAssistWarning: { state: "limited" } as never });
    await runMockEffects(reactMocks.effects);

    expect(captures.main).toEqual(expect.objectContaining({ isInboxRoute: false }));
    expect(captures.mobile).toEqual({ pathname: "/dashboard", unreadCount: 0, userEmail: "tina@usechatting.com" });
    expect(captures.header).toEqual(expect.objectContaining({ showProfileShortcut: false }));
    expect(captures.aiAssistWarning).toBeUndefined();

    const navigation = captures.navigation as { navigate: (href: string) => void; onLinkNavigate: (event: Record<string, unknown>, href: string) => void };
    navigation.navigate("/dashboard/settings");
    expect(router.push).toHaveBeenCalledWith("/dashboard/settings");

    const prevented = vi.fn();
    navigation.onLinkNavigate(
      { defaultPrevented: false, button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, preventDefault: prevented },
      "/dashboard/inbox"
    );
    expect(prevented).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/dashboard/inbox");
    vi.unstubAllGlobals();
  });

  it("shows the shared AI Assist warning on settings and hides it on publishing", async () => {
    vi.stubGlobal("window", { location: { pathname: "/dashboard/settings", search: "", hash: "" } });
    const settingsShell = await loadDashboardShell({ pathname: "/dashboard/settings" });
    settingsShell.reactMocks.beginRender();
    renderShell(settingsShell.DashboardShell, { aiAssistWarning: { state: "limited" } as never });
    await runMockEffects(settingsShell.reactMocks.effects);
    expect(settingsShell.captures.aiAssistWarning).toEqual(expect.objectContaining({ warning: { state: "limited" } }));

    vi.stubGlobal("window", { location: { pathname: "/dashboard/publishing", search: "", hash: "" } });
    const { DashboardShell, captures, reactMocks } = await loadDashboardShell({ pathname: "/dashboard/publishing" });
    reactMocks.beginRender();
    renderShell(DashboardShell, { aiAssistWarning: { state: "limited" } as never });
    await runMockEffects(reactMocks.effects);
    expect(captures.aiAssistWarning).toBeUndefined();
    vi.unstubAllGlobals();
  });

  it("renders the shell with live unread totals when the shared unread hook refreshes them", async () => {
    vi.stubGlobal("window", { location: { pathname: "/dashboard/visitors", search: "", hash: "" } });
    const { DashboardShell, captures, reactMocks } = await loadDashboardShell({ pathname: "/dashboard/visitors", liveUnreadCount: 5 });
    reactMocks.beginRender();
    renderShell(DashboardShell, { unreadCount: 1 });
    await runMockEffects(reactMocks.effects);
    expect(captures.mobile).toEqual({ pathname: "/dashboard/visitors", unreadCount: 5, userEmail: "tina@usechatting.com" });
    expect(captures.sidebar).toEqual(expect.objectContaining({ unreadCount: 5 }));
    expect(captures.header).toEqual(expect.objectContaining({ unreadCount: 5 }));
    vi.unstubAllGlobals();
  });
});
