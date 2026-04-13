import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/link", () => ({
  default: ({
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
}));

import {
  DashboardLink,
  DashboardNavigationContext,
  getDashboardSettingsNav,
  PRIMARY_NAV,
  SETTINGS_NAV,
  isActivePath,
  pathFromHref
} from "./dashboard-shell-navigation";

describe("dashboard shell navigation", () => {
  it("keeps the primary and settings nav definitions stable", () => {
    expect(PRIMARY_NAV.map((item) => item.label)).toEqual(["Home", "Inbox", "People", "Analytics"]);
    expect(SETTINGS_NAV.map((item) => item.label)).toEqual(["Widget", "Help center", "Team", "Settings"]);
    expect(getDashboardSettingsNav("tina@usechatting.com").map((item) => item.label)).toEqual([
      "Switchboard",
      "Widget",
      "Help center",
      "Team",
      "Settings"
    ]);
    expect(getDashboardSettingsNav("alex@example.com").map((item) => item.label)).toEqual([
      "Widget",
      "Help center",
      "Team",
      "Settings"
    ]);
  });

  it("matches active paths correctly", () => {
    expect(isActivePath("/dashboard", "/dashboard")).toBe(true);
    expect(isActivePath("/dashboard/inbox", "/dashboard/inbox")).toBe(true);
    expect(isActivePath("/dashboard/inbox/thread", "/dashboard/inbox")).toBe(true);
    expect(isActivePath("/dashboard/publishing/traffic-low-conversion", "/dashboard/switchboard")).toBe(true);
    expect(isActivePath("/dashboard/analytics", "/dashboard/inbox")).toBe(false);
  });

  it("extracts the pathname from href values", () => {
    expect(pathFromHref("/dashboard/inbox?id=conv_1")).toBe("/dashboard/inbox");
    expect(pathFromHref("/dashboard/settings#billing")).toBe("/dashboard/settings");
    expect(pathFromHref("/dashboard")).toBe("/dashboard");
  });

  it("renders dashboard links with or without navigation context", () => {
    const plainHtml = renderToStaticMarkup(<DashboardLink href="/dashboard">Home</DashboardLink>);
    const contextualHtml = renderToStaticMarkup(
      <DashboardNavigationContext.Provider
        value={{
          navigate: vi.fn(),
          onLinkNavigate: vi.fn()
        }}
      >
        <DashboardLink href="/dashboard/settings">Settings</DashboardLink>
      </DashboardNavigationContext.Provider>
    );

    expect(plainHtml).toContain('href="/dashboard"');
    expect(plainHtml).toContain(">Home<");
    expect(contextualHtml).toContain('href="/dashboard/settings"');
    expect(contextualHtml).toContain(">Settings<");
  });
});
