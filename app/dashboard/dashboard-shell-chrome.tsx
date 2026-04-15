"use client";

import type { ComponentType, SVGProps } from "react";
import { FOUNDER_SWITCHBOARD_ROUTE } from "@/lib/founder-switchboard-access";
import { classNames } from "@/lib/utils";
import {
  ChatBubbleIcon,
  LogoutIcon
} from "./dashboard-ui";
import {
  DashboardLink,
  getDashboardSettingsNav,
  isActivePath,
  NavItem,
  PRIMARY_NAV
} from "./dashboard-shell-navigation";

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

export function MobileChrome({
  pathname,
  unreadCount,
  userEmail
}: {
  pathname: string;
  unreadCount: number;
  userEmail: string;
}) {
  const settingsNav = getDashboardSettingsNav(userEmail);

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
      <div className="space-y-4 px-4 pb-4">
        <div className="overflow-x-auto">
          <div className="flex gap-2">
            {PRIMARY_NAV.concat(settingsNav).map((item) => {
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
  const settingsNav = getDashboardSettingsNav(userEmail).filter((item) => item.href !== FOUNDER_SWITCHBOARD_ROUTE);

  return (
    <aside className="hidden border-r border-slate-200 bg-white lg:flex lg:h-screen lg:min-h-0 lg:flex-col lg:sticky lg:top-0">
      <div className="border-b border-slate-200 px-5 py-6">
        <AppLogo />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div>
          <SidebarNav items={PRIMARY_NAV} pathname={pathname} unreadCount={unreadCount} />
        </div>

        <div className="mt-8">
          <p className="px-3 text-xs font-medium uppercase tracking-[0.24em] text-slate-400">Settings</p>
          <div className="mt-3">
            <SidebarNav items={settingsNav} pathname={pathname} unreadCount={0} />
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
