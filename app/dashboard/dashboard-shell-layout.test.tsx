import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("./dashboard-shell-navigation", async () => {
  const actual = await vi.importActual<typeof import("./dashboard-shell-navigation")>(
    "./dashboard-shell-navigation"
  );

  return {
    ...actual,
    DashboardLink: ({
      href,
      children,
      ...props
    }: {
      href: string;
      children: ReactNode;
    }) => (
      <a href={href} {...props}>
        {children}
      </a>
    )
  };
});

import {
  DashboardHeader,
  DashboardMain,
  DesktopSidebar,
  MobileChrome,
  dashboardGreeting,
  getDashboardIdentity,
  routeHeaderText
} from "./dashboard-shell-layout";

describe("dashboard shell layout", () => {
  it("builds dashboard identity from the user email", () => {
    expect(getDashboardIdentity("tina.bauer@usechatting.com")).toEqual({
      displayName: "Tina Bauer",
      firstName: "Tina",
      initials: "TB"
    });
  });

  it("returns the expected route header text and greeting", () => {
    expect(routeHeaderText("/dashboard", "Tina", "Good morning")).toEqual({
      title: "Good morning, Tina",
      subtitle: "Here's what's happening with your conversations"
    });
    expect(routeHeaderText("/dashboard/analytics", "Tina", "Hello").title).toBe("Analytics");
    expect(routeHeaderText("/dashboard/help-center", "Tina", "Hello").title).toBe("Help center");
    expect(routeHeaderText("/dashboard/switchboard", "Tina", "Hello").title).toBe("Switchboard");
    expect(routeHeaderText("/dashboard/publishing/traffic-low-conversion", "Tina", "Hello").title).toBe("Publishing preview");
    expect(routeHeaderText("/dashboard/unknown", "Tina", "Hello").title).toBe("Dashboard");
    expect(dashboardGreeting(null)).toBe("Hello");
    expect(dashboardGreeting(9)).toBe("Good morning");
  });

  it("renders mobile and desktop navigation chrome", () => {
    const mobileHtml = renderToStaticMarkup(
      <MobileChrome pathname="/dashboard/inbox" unreadCount={3} userEmail="tina@usechatting.com" />
    );
    const restrictedMobileHtml = renderToStaticMarkup(
      <MobileChrome pathname="/dashboard/inbox" unreadCount={3} userEmail="alex@example.com" />
    );
    const sidebarHtml = renderToStaticMarkup(
      <DesktopSidebar
        pathname="/dashboard/visitors"
        unreadCount={2}
        initials="TB"
        displayName="Tina Bauer"
        userEmail="tina@usechatting.com"
      />
    );
    const restrictedSidebarHtml = renderToStaticMarkup(
      <DesktopSidebar
        pathname="/dashboard/visitors"
        unreadCount={2}
        initials="AB"
        displayName="Alex Buyer"
        userEmail="alex@example.com"
      />
    );

    expect(mobileHtml).toContain("Chatting");
    expect(mobileHtml).toContain("Log out");
    expect(mobileHtml).toContain("Inbox");
    expect(mobileHtml).toContain("Help center");
    expect(mobileHtml).toContain("Switchboard");
    expect(mobileHtml).toContain(">3<");
    expect(sidebarHtml).toContain("People");
    expect(sidebarHtml).toContain("tina@usechatting.com");
    expect(sidebarHtml).toContain("Chatting");
    expect(sidebarHtml).toContain("Switchboard");
    expect(restrictedMobileHtml).not.toContain("Switchboard");
    expect(restrictedSidebarHtml).not.toContain("Switchboard");
    expect(sidebarHtml).not.toContain("Teams");
  });

  it("renders the dashboard header with and without the inbox unread badge", () => {
    const headerHtml = renderToStaticMarkup(
      <DashboardHeader
        headerText={{ title: "Inbox", subtitle: "Stay on top of replies." }}
        showUnreadBadge
        unreadCount={4}
        initials="TB"
        firstName="Tina"
      />
    );
    const homeHeaderHtml = renderToStaticMarkup(
      <DashboardHeader
        headerText={{ title: "Good morning, Tina" }}
        showUnreadBadge={false}
        unreadCount={0}
        initials="TB"
        firstName="Tina"
        showProfileShortcut={false}
      />
    );
    const withoutBadgeHtml = renderToStaticMarkup(
      <DashboardHeader
        headerText={{ title: "Analytics" }}
        showUnreadBadge={false}
        unreadCount={4}
        initials="TB"
        firstName="Tina"
      />
    );

    expect(headerHtml).toContain("Inbox");
    expect(headerHtml).toContain("Stay on top of replies.");
    expect(headerHtml).toContain("4 unread");
    expect(headerHtml).toContain("Tina");
    expect(homeHeaderHtml).not.toContain("Tina</span>");
    expect(withoutBadgeHtml).not.toContain("unread");
  });

  it("renders inbox and standard main layouts", () => {
    const inboxHtml = renderToStaticMarkup(
      <DashboardMain isInboxRoute>
        <section>Inbox content</section>
      </DashboardMain>
    );
    const pageHtml = renderToStaticMarkup(
      <DashboardMain isInboxRoute={false}>
        <section>Settings content</section>
      </DashboardMain>
    );

    expect(inboxHtml).toContain("lg:flex-1 lg:min-h-0 lg:overflow-hidden");
    expect(inboxHtml).toContain("Inbox content");
    expect(pageHtml).toContain("px-4 py-6 sm:px-6 lg:px-8");
    expect(pageHtml).toContain("Settings content");
  });
});
