"use client";

import {
  useEffect,
  useState,
  type MouseEvent,
  type ReactNode
} from "react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import type { DashboardSettingsNotifications } from "@/lib/data/settings-types";
import { classNames } from "@/lib/utils";
import { DashboardNotificationCenter } from "./dashboard-notification-center";
import { DashboardUnreadCountProvider } from "./dashboard-unread-count";
import { useDashboardLiveUnreadCount } from "./use-dashboard-live-unread-count";
import { useDashboardPresenceHeartbeat } from "./use-dashboard-presence-heartbeat";
import { useDashboardTimezoneSync } from "./use-dashboard-timezone-sync";
import {
  DashboardHeader,
  dashboardGreeting,
  DashboardMain,
  DesktopSidebar,
  getDashboardIdentity,
  MobileChrome,
  routeHeaderText
} from "./dashboard-shell-layout";
import {
  DashboardNavigationContext,
  PRIMARY_NAV,
  SETTINGS_NAV
} from "./dashboard-shell-navigation";

export { DashboardLink, useDashboardNavigation } from "./dashboard-shell-navigation";

type DashboardShellProps = {
  children: ReactNode;
  userEmail: string;
  unreadCount: number;
  notificationSettings: DashboardSettingsNotifications;
};

export function DashboardShell({ children, userEmail, unreadCount, notificationSettings }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { displayName, firstName, initials } = getDashboardIdentity(userEmail);
  const isInboxRoute = pathname === "/dashboard/inbox";
  const [hour, setHour] = useState<number | null>(null);
  const { unreadCount: liveUnreadCount, setUnreadCount } = useDashboardLiveUnreadCount(unreadCount, !isInboxRoute);

  useDashboardPresenceHeartbeat();
  useDashboardTimezoneSync();

  useEffect(() => {
    setHour(new Date().getHours());
  }, []);

  useEffect(() => {
    const routes = [...PRIMARY_NAV, ...SETTINGS_NAV].map((item) => item.href);

    for (const href of routes) {
      router.prefetch(href);
    }
  }, [router]);

  useEffect(() => {
    if (!isInboxRoute) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverscroll = html.style.overscrollBehavior;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const syncDesktopScrollLock = () => {
      if (mediaQuery.matches) {
        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
        html.style.overscrollBehavior = "none";
        body.style.overscrollBehavior = "none";
      } else {
        html.style.overflow = previousHtmlOverflow;
        body.style.overflow = previousBodyOverflow;
        html.style.overscrollBehavior = previousHtmlOverscroll;
        body.style.overscrollBehavior = previousBodyOverscroll;
      }
    };

    syncDesktopScrollLock();
    mediaQuery.addEventListener("change", syncDesktopScrollLock);

    return () => {
      mediaQuery.removeEventListener("change", syncDesktopScrollLock);
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      html.style.overscrollBehavior = previousHtmlOverscroll;
      body.style.overscrollBehavior = previousBodyOverscroll;
    };
  }, [isInboxRoute]);

  function navigate(href: string) {
    const currentHref =
      typeof window === "undefined"
        ? pathname
        : `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (href === currentHref) {
      return;
    }

    router.push(href as Route);
  }

  function handleNavigate(event: MouseEvent<HTMLElement>, href: string) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigate(href);
  }

  const greeting = dashboardGreeting(hour);
  const headerText = routeHeaderText(pathname, firstName, greeting);

  return (
    <DashboardUnreadCountProvider setUnreadCount={setUnreadCount}>
      <DashboardNavigationContext.Provider value={{ navigate, onLinkNavigate: handleNavigate }}>
        <div
          className={classNames(
            "min-h-screen bg-slate-50 text-slate-900",
            isInboxRoute && "lg:h-screen lg:overflow-hidden"
          )}
        >
          <DashboardNotificationCenter initialSettings={notificationSettings} />
          <MobileChrome pathname={pathname} unreadCount={liveUnreadCount} />

          <div
            className={classNames(
              "lg:grid lg:grid-cols-[264px_minmax(0,1fr)]",
              isInboxRoute && "lg:h-screen lg:min-h-0 lg:grid-rows-[minmax(0,1fr)]"
            )}
          >
            <DesktopSidebar
              pathname={pathname}
              unreadCount={liveUnreadCount}
              initials={initials}
              displayName={displayName}
              userEmail={userEmail}
            />

            <div
              className={classNames(
                "min-w-0",
                isInboxRoute && "lg:flex lg:h-screen lg:min-h-0 lg:flex-col lg:overflow-hidden"
              )}
            >
              <DashboardHeader
                headerText={headerText}
                showUnreadBadge={isInboxRoute}
                unreadCount={liveUnreadCount}
                initials={initials}
                firstName={firstName}
              />
              <DashboardMain isInboxRoute={isInboxRoute}>
                {children}
              </DashboardMain>
            </div>
          </div>
        </div>
      </DashboardNavigationContext.Provider>
    </DashboardUnreadCountProvider>
  );
}
