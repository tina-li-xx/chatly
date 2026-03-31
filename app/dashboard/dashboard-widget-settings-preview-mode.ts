"use client";

export type WidgetPreviewMode = "online" | "away" | "offline";

export const WIDGET_PREVIEW_MODES: Array<{ value: WidgetPreviewMode; label: string }> = [
  { value: "online", label: "Online" },
  { value: "away", label: "Away" },
  { value: "offline", label: "Offline" }
];
