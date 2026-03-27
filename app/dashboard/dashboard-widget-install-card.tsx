"use client";

import { useEffect, useState } from "react";
import { DashboardLink } from "./dashboard-shell";

type DashboardWidgetInstallCardProps = {
  initialInstalled: boolean;
  siteIds: string[];
};

type WidgetMountedEventDetail = {
  siteId?: string;
};

declare global {
  interface Window {
    __chatlyMountedSiteIds?: string[];
  }
}

function isMountedForSite(siteIds: string[]) {
  if (typeof window === "undefined") {
    return false;
  }

  const mountedSiteIds = Array.isArray(window.__chatlyMountedSiteIds) ? window.__chatlyMountedSiteIds : [];
  return siteIds.some((siteId) => mountedSiteIds.includes(siteId));
}

export function DashboardWidgetInstallCard({
  initialInstalled,
  siteIds
}: DashboardWidgetInstallCardProps) {
  const [installed, setInstalled] = useState(initialInstalled);

  useEffect(() => {
    if (installed || siteIds.length === 0) {
      return;
    }

    if (isMountedForSite(siteIds)) {
      setInstalled(true);
      return;
    }

    const handleMounted = (event: Event) => {
      const detail = (event as CustomEvent<WidgetMountedEventDetail>).detail;
      if (detail?.siteId && siteIds.includes(detail.siteId)) {
        setInstalled(true);
      }
    };

    window.addEventListener("chatly:widget:mounted", handleMounted);
    return () => window.removeEventListener("chatly:widget:mounted", handleMounted);
  }, [installed, siteIds]);

  const copy = installed
    ? {
        title: "Widget is live",
        description: "Chatting is already installed on your site. Tweak the widget copy, color, or snippet any time.",
        actionLabel: "Customize widget"
      }
    : {
        title: "Ready to install?",
        description: "Add the chat widget to your site so visitors can start conversations here.",
        actionLabel: "Check installation"
      };

  return (
    <article className="rounded-xl bg-gradient-to-br from-blue-700 to-blue-600 p-5 text-white">
      <h2 className="text-base font-semibold">{copy.title}</h2>
      <p className="mb-4 mt-2 text-sm font-normal leading-6 text-blue-100">{copy.description}</p>
      <DashboardLink
        href="/dashboard/widget"
        className="inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
      >
        {copy.actionLabel}
      </DashboardLink>
    </article>
  );
}
