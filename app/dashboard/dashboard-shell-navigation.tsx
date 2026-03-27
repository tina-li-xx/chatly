"use client";

import { createContext, useContext, type ComponentProps, type ComponentType, type MouseEvent, type SVGProps } from "react";
import type { Route } from "next";
import Link from "next/link";
import {
  BarChartIcon,
  GearIcon,
  HouseIcon,
  InboxIcon,
  PaintbrushIcon,
  PeopleIcon,
  UsersIcon
} from "./dashboard-ui";

export type NavItem = {
  label: string;
  href: Route;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  showsBadge?: boolean;
};

export type HeaderText = {
  title: string;
  subtitle?: string;
};

type NavigateHandler = (event: MouseEvent<HTMLElement>, href: string) => void;

type DashboardNavigationContextValue = {
  navigate: (href: string) => void;
  onLinkNavigate: NavigateHandler;
};

export const DashboardNavigationContext = createContext<DashboardNavigationContextValue | null>(null);

export const PRIMARY_NAV: readonly NavItem[] = [
  { label: "Home", href: "/dashboard", icon: HouseIcon },
  { label: "Inbox", href: "/dashboard/inbox", icon: InboxIcon, showsBadge: true },
  { label: "Visitors", href: "/dashboard/visitors", icon: PeopleIcon },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChartIcon }
] as const;

export const SETTINGS_NAV: readonly NavItem[] = [
  { label: "Widget", href: "/dashboard/widget", icon: PaintbrushIcon },
  { label: "Team", href: "/dashboard/team", icon: UsersIcon },
  { label: "Settings", href: "/dashboard/settings", icon: GearIcon }
] as const;

export function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function pathFromHref(href: string) {
  const [path] = href.split(/[?#]/, 1);
  return path || href;
}

export function useDashboardNavigation() {
  return useContext(DashboardNavigationContext);
}

type DashboardLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function DashboardLink({ href, onClick, ...props }: DashboardLinkProps) {
  const navigation = useDashboardNavigation();

  return (
    <Link
      href={href as Route}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented || !navigation) {
          return;
        }

        navigation.onLinkNavigate(event, href);
      }}
      {...props}
    />
  );
}
