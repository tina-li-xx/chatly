import {
  getBillingPlanFeatures,
  normalizeBillingPlanKey,
  shouldShowWidgetBranding
} from "@/lib/billing-plans";
import type { WidgetProactivePrompt } from "@/lib/widget-proactive-prompts";
import { findBillingAccountRow } from "@/lib/repositories/billing-repository";
import { findWorkspaceAutomationSettingsValue } from "@/lib/repositories/settings-repository";
import { findSitePresenceRow, touchSiteWidgetSeenRecord } from "@/lib/repositories/sites-repository";
import { getPublicAppUrl } from "@/lib/env";
import { recordVisitorPresence, type RecordVisitorPresenceInput } from "@/lib/data/visitors";
import { getWidgetBrandingAttributionUrl } from "@/lib/widget-branding-attribution";
import type { Site } from "@/lib/types";
import { optionalText } from "@/lib/utils";
import { parseDashboardAutomationSettings } from "./settings-automation";
import { getSiteByPublicId } from "./sites-core";

const SITE_ONLINE_GRACE_PERIOD_MS = 5 * 60 * 1000;
const FREE_WIDGET_BRANDING_LABEL = "Powered by Chatting";

type PublicSiteWidgetConfig = Omit<Site, "userId" | "name" | "domain" | "createdAt" | "conversationCount"> & {
  id: string;
  proactivePrompts: WidgetProactivePrompt[];
  showBranding: boolean;
  brandingLabel: string;
  brandingUrl: string;
};

export async function getSiteWidgetConfig(siteId: string) {
  const site = await getSiteByPublicId(siteId);
  if (!site) {
    return null;
  }

  const [billingAccount, automationSettingsJson] = await Promise.all([
    findBillingAccountRow(site.userId).catch(() => null),
    findWorkspaceAutomationSettingsValue(site.userId).catch(() => "")
  ]);
  const planKey = normalizeBillingPlanKey(billingAccount?.plan_key);
  const features = getBillingPlanFeatures(planKey);
  const fallbackBrandingUrl = new URL("/signup", getPublicAppUrl()).toString();
  const brandingUrl = await getWidgetBrandingAttributionUrl(site.userId, site.id).catch(() => fallbackBrandingUrl);
  const automation = parseDashboardAutomationSettings(automationSettingsJson, {
    requireEmailWhenOffline: site.requireEmailOffline,
    expectedReplyTimeOnline: site.responseTimeMode
  });
  const proactivePrompts = automation.proactive.pagePrompts
    .filter((prompt) => prompt.pagePath.trim() && prompt.message.trim())
    .map((prompt) => ({
      id: prompt.id,
      pagePath: prompt.pagePath,
      message: prompt.message,
      delaySeconds: prompt.delaySeconds,
      autoOpenWidget: prompt.autoOpenWidget
    }));

  return {
    id: site.id,
    brandColor: site.brandColor,
    widgetTitle: site.widgetTitle,
    greetingText: site.greetingText,
    launcherPosition: site.launcherPosition,
    avatarStyle: site.avatarStyle,
    teamPhotoUrl: site.teamPhotoUrl,
    showOnlineStatus: site.showOnlineStatus,
    requireEmailOffline: site.requireEmailOffline,
    offlineTitle: site.offlineTitle,
    offlineMessage: site.offlineMessage,
    awayTitle: site.awayTitle,
    awayMessage: site.awayMessage,
    soundNotifications: site.soundNotifications,
    autoOpenPaths: proactivePrompts.length ? [] : features.proactiveChat ? site.autoOpenPaths : [],
    proactivePrompts,
    responseTimeMode: site.responseTimeMode,
    operatingHoursEnabled: site.operatingHoursEnabled,
    operatingHoursTimezone: site.operatingHoursTimezone,
    operatingHours: site.operatingHours,
    widgetInstallVerifiedAt: site.widgetInstallVerifiedAt,
    widgetInstallVerifiedUrl: site.widgetInstallVerifiedUrl,
    widgetLastSeenAt: site.widgetLastSeenAt,
    widgetLastSeenUrl: site.widgetLastSeenUrl,
    showBranding: shouldShowWidgetBranding(planKey),
    brandingLabel: FREE_WIDGET_BRANDING_LABEL,
    brandingUrl
  } satisfies PublicSiteWidgetConfig;
}

export async function getSitePresenceStatus(siteId: string) {
  const row = await findSitePresenceRow(siteId);
  if (!row) {
    return null;
  }

  const lastSeenAt = row.last_seen_at;
  const online =
    lastSeenAt !== null && Date.now() - new Date(lastSeenAt).getTime() <= SITE_ONLINE_GRACE_PERIOD_MS;
  return { online, lastSeenAt };
}

export async function recordSiteWidgetSeen(
  siteIdOrInput: string | ({ siteId: string; pageUrl?: string | null } & Partial<Omit<RecordVisitorPresenceInput, "siteId" | "pageUrl">>),
  pageUrl: string | null = null
) {
  const input = typeof siteIdOrInput === "string" ? { siteId: siteIdOrInput, pageUrl } : siteIdOrInput;
  const normalizedPageUrl = optionalText(input.pageUrl);

  await touchSiteWidgetSeenRecord(input.siteId, normalizedPageUrl);
  if (!optionalText(input.sessionId)) {
    return;
  }

  await recordVisitorPresence({
    siteId: input.siteId,
    sessionId: input.sessionId!,
    conversationId: input.conversationId,
    email: input.email,
    pageUrl: normalizedPageUrl,
    referrer: input.referrer,
    userAgent: input.userAgent,
    country: input.country,
    region: input.region,
    city: input.city,
    timezone: input.timezone,
    locale: input.locale
  });
}
