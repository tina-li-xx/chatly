import { getSitePresenceStatus, getSiteWidgetConfig, recordSiteWidgetSeen } from "@/lib/data/sites";
import type { RecordVisitorPresenceInput } from "@/lib/data/visitors";

type PublicSitePresenceInput = {
  siteId: string;
  pageUrl?: string | null;
} & Partial<Omit<RecordVisitorPresenceInput, "siteId" | "pageUrl">>;

export async function getPublicSiteWidgetConfig(siteId: string) {
  const normalizedSiteId = siteId.trim();
  if (!normalizedSiteId) {
    return null;
  }

  return getSiteWidgetConfig(normalizedSiteId);
}

export async function getPublicSitePresenceStatus(siteId: string) {
  const normalizedSiteId = siteId.trim();
  if (!normalizedSiteId) {
    return null;
  }

  return getSitePresenceStatus(normalizedSiteId);
}

export async function recordPublicSitePresence(input: PublicSitePresenceInput) {
  const normalizedSiteId = input.siteId.trim();
  if (!normalizedSiteId) {
    return null;
  }

  return recordSiteWidgetSeen({
    ...input,
    siteId: normalizedSiteId
  });
}
