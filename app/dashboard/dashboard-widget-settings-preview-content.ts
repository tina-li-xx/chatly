"use client";

import type { Site } from "@/lib/types";
import type { WidgetPreviewMode } from "./dashboard-widget-settings-preview-mode";
import { responseTimeCopy } from "./dashboard-widget-settings-shared";

export const WIDGET_PREVIEW_PANEL_HEIGHT = "460px";

export function widgetPreviewHeaderStatus(site: Site, mode: WidgetPreviewMode) {
  if (!site.showOnlineStatus) {
    return "";
  }

  if (mode === "online") {
    const responseCopy = responseTimeCopy(site.responseTimeMode);
    return responseCopy ? `Online • ${responseCopy}` : "Online";
  }

  return mode === "away" ? "Away • We'll email you back" : "Offline";
}

export function widgetPreviewStatusTone(mode: WidgetPreviewMode) {
  switch (mode) {
    case "online":
      return "bg-emerald-400";
    case "away":
      return "bg-amber-400";
    default:
      return "bg-slate-400";
  }
}

export function widgetPreviewEmptyState(site: Site, mode: Exclude<WidgetPreviewMode, "online">) {
  return mode === "away"
    ? { title: site.awayTitle, message: site.awayMessage }
    : { title: site.offlineTitle, message: site.offlineMessage };
}
