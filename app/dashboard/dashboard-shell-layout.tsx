"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
import { classNames } from "@/lib/utils";
import { displayNameFromEmail, firstNameFromDisplayName, initialsFromLabel } from "@/lib/user-display";
import {
  BellIcon,
  ChatBubbleIcon,
  GearIcon,
  LogoutIcon,
  greetingForHour
} from "./dashboard-ui";
import {
  DashboardLink,
  HeaderText,
  isActivePath,
  NavItem,
  PRIMARY_NAV,
  SETTINGS_NAV
} from "./dashboard-shell-navigation";

export const DASHBOARD_FRAME_CLASS = "mx-auto w-full max-w-[1200px]";
export const DASHBOARD_HEADER_PADDING_CLASS = "px-4 sm:px-6 lg:px-8";
const DASHBOARD_ACTION_BUTTON_CLASS =
  "relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700";

export function getDashboardIdentity(userEmail: string) {
  const displayName = displayNameFromEmail(userEmail);
  return {
    displayName,
    firstName: firstNameFromDisplayName(displayName),
    initials: initialsFromLabel(displayName)
  };
}

export function routeHeaderText(pathname: string, firstName: string, greeting: string): HeaderText {
  if (pathname === "/dashboard") {
    return {
      title: `${greeting}, ${firstName}`,
      subtitle: "Here's what's happening with your conversations"
    };
  }

  const titles: Record<string, HeaderText> = {
    "/dashboard/inbox": {
      title: "Inbox",
      subtitle: "Jump into live conversations, clear unread threads, and keep replies moving."
    },
    "/dashboard/visitors": {
      title: "Visitors",
      subtitle: "See who's on your site right now and spot the visitors worth jumping in on."
    },
    "/dashboard/analytics": {
      title: "Analytics",
      subtitle: "Keep an eye on conversation volume, response speed, and the signals that matter most."
    },
    "/dashboard/widget": {
      title: "Widget",
      subtitle: "Review your install snippet and the branding details that shape the chat experience."
    },
    "/dashboard/team": {
      title: "Team",
      subtitle: "Track the workspace owner, send invites, and manage pending inbox access."
    },
    "/dashboard/settings": {
      title: "Settings",
      subtitle: "Manage your account, notifications, email, and billing details."
    }
  };

  return titles[pathname] ?? {
    title: "Dashboard",
    subtitle: "A cleaner, faster workspace for conversations and context."
  };
}

export function dashboardGreeting(hour: number | null) {
  return hour == null ? "Hello" : greetingForHour(hour);
}

export function PendingOverlay({ isInboxRoute }: { isInboxRoute: boolean }) {
  if (isInboxRoute) {
    return (
      <div className="pointer-events-none absolute inset-0 z-10 bg-white">
        <div className="grid h-full min-h-0 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
          <div className="hidden border-r border-slate-200 bg-white lg:block">
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="rounded-lg bg-slate-50 p-3">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100" />
                    <div className="min-w-0 flex-1">
                      <div className="h-3 w-24 rounded-full bg-slate-100" />
                      <div className="mt-2 h-3 w-36 rounded-full bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-col bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="h-4 w-40 rounded-full bg-slate-100" />
              <div className="mt-2 h-3 w-56 rounded-full bg-slate-100" />
            </div>
            <div className="flex-1 space-y-5 p-5">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className={index % 2 ? "flex justify-end" : "flex justify-start"}>
                  <div className="max-w-[70%] rounded-xl bg-slate-100 px-4 py-3">
                    <div className="h-3 w-28 rounded-full bg-white/80" />
                    <div className="mt-2 h-3 w-44 rounded-full bg-white/80" />
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 p-4">
              <div className="h-24 rounded-xl bg-slate-50" />
            </div>
          </div>

          <div className="hidden bg-white p-5 xl:block">
            <div className="rounded-xl border border-slate-200 p-5">
              <div className="mx-auto h-16 w-16 rounded-full bg-slate-100" />
              <div className="mx-auto mt-4 h-4 w-24 rounded-full bg-slate-100" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 7 }, (_, index) => (
                  <div key={index} className="h-3 rounded-full bg-slate-100" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 bg-slate-50">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="h-3 w-24 rounded-full bg-slate-100" />
              <div className="mt-4 h-8 w-20 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="h-4 w-40 rounded-full bg-slate-100" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="h-16 rounded-xl bg-slate-50" />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="h-4 w-28 rounded-full bg-slate-100" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="h-12 rounded-lg bg-slate-50" />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="h-4 w-32 rounded-full bg-slate-100" />
              <div className="mt-5 h-40 rounded-xl bg-slate-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppLogo() {
  return (
    <DashboardLink href="/dashboard" className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
        <ChatBubbleIcon className="h-5 w-5" />
      </span>
      <span className="text-xl font-semibold tracking-tight text-slate-900">Chatting</span>
    </DashboardLink>
  );
}

function HeaderActions({
  unreadCount,
  initials,
  firstName
}: {
  unreadCount: number;
  initials: string;
  firstName: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <DashboardLink href="/dashboard/inbox" aria-label="Open inbox" className={DASHBOARD_ACTION_BUTTON_CLASS}>
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 ? <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" /> : null}
      </DashboardLink>

      <DashboardLink href="/dashboard/settings" aria-label="Settings" className={DASHBOARD_ACTION_BUTTON_CLASS}>
        <GearIcon className="h-5 w-5" />
      </DashboardLink>

      <DashboardLink href="/dashboard/settings" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[13px] font-medium text-blue-700">
          {initials}
        </span>
        <span className="hidden text-sm font-normal text-slate-600 sm:block">{firstName}</span>
      </DashboardLink>
    </div>
  );
}

function SidebarNav({
  items,
  pathname,
  unreadCount
}: {
  items: readonly NavItem[];
  pathname: string;
  unreadCount: number;
}) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon as ComponentType<SVGProps<SVGSVGElement>>;

        return (
          <DashboardLink
            key={item.href}
            href={item.href}
            className={classNames(
              "flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium transition",
              active
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <span className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </span>
            {item.showsBadge && unreadCount > 0 ? (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                {unreadCount}
              </span>
            ) : null}
          </DashboardLink>
        );
      })}
    </nav>
  );
}

export function MobileChrome({ pathname, unreadCount }: { pathname: string; unreadCount: number }) {
  return (
    <div className="border-b border-slate-200 bg-white lg:hidden">
      <div className="flex items-center justify-between px-4 py-5">
        <AppLogo />
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Log out
          </button>
        </form>
      </div>
      <div className="overflow-x-auto px-4 pb-4">
        <div className="flex gap-2">
          {PRIMARY_NAV.concat(SETTINGS_NAV).map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

            return (
              <DashboardLink
                key={item.href}
                href={item.href}
                className={classNames(
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2.5 text-base font-medium transition",
                  active
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.showsBadge && unreadCount > 0 ? (
                  <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-xs font-medium text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </DashboardLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function DesktopSidebar({
  pathname,
  unreadCount,
  initials,
  displayName,
  userEmail
}: {
  pathname: string;
  unreadCount: number;
  initials: string;
  displayName: string;
  userEmail: string;
}) {
  return (
    <aside className="hidden border-r border-slate-200 bg-white lg:flex lg:h-screen lg:min-h-0 lg:flex-col lg:sticky lg:top-0">
      <div className="border-b border-slate-200 px-5 py-6">
        <AppLogo />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <SidebarNav items={PRIMARY_NAV} pathname={pathname} unreadCount={unreadCount} />

        <div className="mt-8">
          <p className="px-3 text-xs font-medium uppercase tracking-[0.24em] text-slate-400">Settings</p>
          <div className="mt-3">
            <SidebarNav items={SETTINGS_NAV} pathname={pathname} unreadCount={0} />
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-200 px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="truncate text-xs font-normal text-slate-400">{userEmail}</p>
          </div>
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              aria-label="Log out"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
            >
              <LogoutIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

export function DashboardHeader({
  isInboxRoute,
  headerText,
  unreadCount,
  initials,
  firstName
}: {
  isInboxRoute: boolean;
  headerText: HeaderText;
  unreadCount: number;
  initials: string;
  firstName: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className={`${DASHBOARD_FRAME_CLASS} ${DASHBOARD_HEADER_PADDING_CLASS}`}>
        <div className={classNames("flex items-center justify-between gap-4", isInboxRoute ? "h-14" : "py-5")}>
          <div className="min-w-0">
            {isInboxRoute ? (
              <div className="flex min-w-0 items-center gap-3">
                <h1 className="truncate text-base font-semibold text-slate-900">{headerText.title}</h1>
                {unreadCount > 0 ? (
                  <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                    {unreadCount} unread
                  </span>
                ) : null}
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{headerText.title}</h1>
                {headerText.subtitle ? (
                  <p className="mt-1 text-base font-normal text-slate-500">{headerText.subtitle}</p>
                ) : null}
              </>
            )}
          </div>

          <HeaderActions unreadCount={unreadCount} initials={initials} firstName={firstName} />
        </div>
      </div>
    </header>
  );
}

export function DashboardMain({
  isInboxRoute,
  children,
  showPendingOverlay
}: {
  isInboxRoute: boolean;
  children: ReactNode;
  showPendingOverlay: boolean;
}) {
  if (isInboxRoute) {
    return (
      <main className="lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <div className="h-full min-h-0 lg:px-4 lg:py-6 xl:px-8">
          <div
            className={classNames(
              DASHBOARD_FRAME_CLASS,
              "h-full min-h-0",
              "lg:overflow-hidden lg:rounded-xl lg:border lg:border-slate-200 lg:bg-white"
            )}
          >
            <div className="relative h-full min-h-0">
              <div className={classNames("h-full min-h-0", showPendingOverlay && "pointer-events-none opacity-0")}>
                {children}
              </div>
              {showPendingOverlay ? <PendingOverlay isInboxRoute /> : null}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className={classNames(DASHBOARD_FRAME_CLASS, "relative")}>
        <div className={classNames(showPendingOverlay && "pointer-events-none opacity-0")}>{children}</div>
        {showPendingOverlay ? <PendingOverlay isInboxRoute={false} /> : null}
      </div>
    </main>
  );
}
