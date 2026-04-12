"use client";

import type { ReactNode } from "react";
import { classNames } from "@/lib/utils";
import { displayNameFromEmail, firstNameFromDisplayName, initialsFromLabel } from "@/lib/user-display";
import { BellIcon, GearIcon, greetingForHour } from "./dashboard-ui";
import { DashboardLink, type HeaderText } from "./dashboard-shell-navigation";

export { DesktopSidebar, MobileChrome } from "./dashboard-shell-chrome";

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

  if (pathname.startsWith("/dashboard/publishing/")) {
    return {
      title: "Publishing preview",
      subtitle: "Review a queued article before it goes live."
    };
  }

  const titles: Record<string, HeaderText> = {
    "/dashboard/inbox": { title: "Inbox", subtitle: "Jump into live conversations, clear unread threads, and keep replies moving." },
    "/dashboard/visitors": { title: "People", subtitle: "See who is live right now and keep customer context close when conversations pick back up." },
    "/dashboard/analytics": { title: "Analytics", subtitle: "Keep an eye on conversation volume, response speed, and the signals that matter most." },
    "/dashboard/widget": { title: "Widget", subtitle: "Review your install snippet and the branding details that shape the chat experience." },
    "/dashboard/help-center": { title: "Help center", subtitle: "Publish simple self-serve answers your team can link while conversations are live." },
    "/dashboard/publishing": { title: "Publishing", subtitle: "Keep draft and scheduled blog posts visible without making them public too early." },
    "/dashboard/team": { title: "Team", subtitle: "Track the workspace owner, send invites, and manage pending inbox access." },
    "/dashboard/settings": { title: "Settings", subtitle: "Manage your account, notifications, email, and billing details." }
  };

  return titles[pathname] ?? {
    title: "Dashboard",
    subtitle: "A cleaner, faster workspace for conversations and context."
  };
}

export function dashboardGreeting(hour: number | null) {
  return hour == null ? "Hello" : greetingForHour(hour);
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

export function DashboardHeader({
  headerText,
  showUnreadBadge,
  unreadCount,
  initials,
  firstName
}: {
  headerText: HeaderText;
  showUnreadBadge: boolean;
  unreadCount: number;
  initials: string;
  firstName: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className={`${DASHBOARD_FRAME_CLASS} ${DASHBOARD_HEADER_PADDING_CLASS}`}>
        <div className="flex items-center justify-between gap-4 py-5">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900">{headerText.title}</h1>
              {showUnreadBadge && unreadCount > 0 ? (
                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                  {unreadCount} unread
                </span>
              ) : null}
            </div>
            {headerText.subtitle ? <p className="mt-1 text-base font-normal text-slate-600">{headerText.subtitle}</p> : null}
          </div>

          <HeaderActions unreadCount={unreadCount} initials={initials} firstName={firstName} />
        </div>
      </div>
    </header>
  );
}

export function DashboardMain({
  isInboxRoute,
  children
}: {
  isInboxRoute: boolean;
  children: ReactNode;
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
            {children}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className={DASHBOARD_FRAME_CLASS}>{children}</div>
    </main>
  );
}
