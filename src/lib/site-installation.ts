import type { Site } from "@/lib/types";

export function isSiteWidgetInstalled(
  site: Pick<Site, "widgetInstallVerifiedAt" | "widgetLastSeenAt" | "conversationCount">
) {
  return Boolean(site.widgetInstallVerifiedAt) || Boolean(site.widgetLastSeenAt) || site.conversationCount > 0;
}
