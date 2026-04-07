"use client";

import { useEffect, useState } from "react";
import {
  WIDGET_MOUNTED_EVENT
} from "@/lib/browser-event-contracts";

type WidgetMountedEventDetail = {
  siteId?: string;
};

declare global {
  interface Window {
    __chattingMountedSiteIds?: string[];
  }
}

function isMountedForSite(siteIds: string[]) {
  if (typeof window === "undefined") {
    return false;
  }

  const mountedSiteIds = Array.isArray(window.__chattingMountedSiteIds)
    ? window.__chattingMountedSiteIds
    : [];
  return siteIds.some((siteId) => mountedSiteIds.includes(siteId));
}

export function useWidgetInstallState(initialInstalled: boolean, siteIds: string[]) {
  const [installed, setInstalled] = useState(initialInstalled);

  useEffect(() => {
    setInstalled(initialInstalled);
  }, [initialInstalled]);

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

    window.addEventListener(WIDGET_MOUNTED_EVENT, handleMounted);

    return () => {
      window.removeEventListener(WIDGET_MOUNTED_EVENT, handleMounted);
    };
  }, [installed, siteIds]);

  return installed;
}
