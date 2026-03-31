import { randomUUID } from "node:crypto";
import {
  getBillingPlanFeatures,
  normalizeBillingPlanKey,
  shouldShowWidgetBranding
} from "@/lib/billing-plans";
import { findBillingAccountRow } from "@/lib/repositories/billing-repository";
import {
  clearSiteTeamPhotoRecord,
  findCreatedSiteRow,
  findSitePresenceRow,
  findSiteTeamPhotoRecord,
  insertSiteRecord,
  markSiteWidgetInstallVerifiedRecord,
  touchSiteWidgetSeenRecord,
  updateSiteOnboardingSetupRecord,
  updateSiteTeamPhotoRecord,
  updateSiteWidgetSettingsRecord,
  updateSiteWidgetTitleRecord
} from "@/lib/repositories/sites-repository";
import { deleteR2Object, uploadSiteTeamPhotoToR2 } from "@/lib/r2";
import { getPublicAppUrl } from "@/lib/env";
import { recordVisitorPresence, type RecordVisitorPresenceInput } from "@/lib/data/visitors";
import { getWidgetBrandingAttributionUrl } from "@/lib/widget-branding-attribution";
import type {
  Site,
  WidgetAvatarStyle,
  WidgetLauncherPosition,
  WidgetOperatingHours,
  WidgetResponseTimeMode
} from "@/lib/types";
import { optionalText } from "@/lib/utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import {
  DEFAULT_BRAND_COLOR,
  DEFAULT_GREETING_TEXT,
  DEFAULT_AWAY_MESSAGE,
  DEFAULT_AWAY_TITLE,
  DEFAULT_OFFLINE_MESSAGE,
  DEFAULT_OFFLINE_TITLE,
  DEFAULT_OPERATING_TIMEZONE,
  DEFAULT_WIDGET_TITLE,
  normalizeAutoOpenPaths,
  normalizeAvatarStyle,
  normalizeBrandColor,
  normalizeLauncherPosition,
  normalizeSiteDomain,
  normalizeResponseTimeMode,
  normalizeWidgetCopy,
  serializeOperatingHours
} from "@/lib/widget-settings";
import { mapSite, querySites } from "./shared";

const SITE_ONLINE_GRACE_PERIOD_MS = 5 * 60 * 1000;
const FREE_WIDGET_BRANDING_LABEL = "Powered by Chatting";

type PublicSiteWidgetConfig = Omit<Site, "userId" | "name" | "domain" | "createdAt" | "conversationCount"> & {
  id: string;
  showBranding: boolean;
  brandingLabel: string;
  brandingUrl: string;
};

export type UpdateSiteWidgetSettingsInput = {
  domain: string | null;
  brandColor: string;
  widgetTitle: string;
  greetingText: string;
  launcherPosition: WidgetLauncherPosition;
  avatarStyle: WidgetAvatarStyle;
  showOnlineStatus: boolean;
  requireEmailOffline: boolean;
  offlineTitle: string;
  offlineMessage: string;
  awayTitle: string;
  awayMessage: string;
  soundNotifications: boolean;
  autoOpenPaths: string[];
  responseTimeMode: WidgetResponseTimeMode;
  operatingHoursEnabled: boolean;
  operatingHoursTimezone: string | null;
  operatingHours: WidgetOperatingHours;
};

export async function createSiteForUser(
  userId: string,
  input: {
    name: string;
    domain?: string | null;
    brandColor?: string | null;
    widgetTitle?: string | null;
    greetingText?: string | null;
  }
) {
  const siteId = randomUUID();
  const name = input.name.trim();

  await insertSiteRecord({
    siteId,
    userId,
    name: name || "My site",
    domain: optionalText(input.domain),
    brandColor: normalizeBrandColor(input.brandColor),
    widgetTitle: optionalText(input.widgetTitle) || DEFAULT_WIDGET_TITLE,
    greetingText: optionalText(input.greetingText) || DEFAULT_GREETING_TEXT
  });

  const created = await findCreatedSiteRow(siteId);
  if (!created) {
    throw new Error("SITE_NOT_FOUND");
  }

  return mapSite(created);
}

export async function listSitesForUser(userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const result = await querySites("s.user_id = $1", [workspace.ownerUserId], "ORDER BY s.created_at ASC");
  return result.rows.map(mapSite);
}

export async function updateSiteWidgetTitle(siteId: string, widgetTitle: string, userId: string) {
  const normalizedTitle = optionalText(widgetTitle) || DEFAULT_WIDGET_TITLE;
  const workspace = await getWorkspaceAccess(userId);
  return updateSiteWidgetTitleRecord(siteId, workspace.ownerUserId, normalizedTitle);
}

export async function updateSiteOnboardingSetup(
  siteId: string,
  userId: string,
  input: {
    name: string;
    domain: string;
  }
) {
  const workspace = await getWorkspaceAccess(userId);
  const name = input.name.trim();
  const domain = normalizeSiteDomain(input.domain);

  if (!name) {
    throw new Error("MISSING_SITE_NAME");
  }

  if (!domain) {
    throw new Error("MISSING_DOMAIN");
  }

  const updatedRecord = await updateSiteOnboardingSetupRecord({
    siteId,
    userId: workspace.ownerUserId,
    name,
    domain,
    widgetTitle: name
  });

  if (!updatedRecord) {
    return null;
  }

  const updated = await querySites("s.id = $1 AND s.user_id = $2", [siteId, workspace.ownerUserId], "LIMIT 1");
  return updated.rows[0] ? mapSite(updated.rows[0]) : null;
}

export async function updateSiteWidgetSettings(
  siteId: string,
  userId: string,
  input: UpdateSiteWidgetSettingsInput
) {
  const workspace = await getWorkspaceAccess(userId);
  const updatedRecord = await updateSiteWidgetSettingsRecord({
    siteId,
    userId: workspace.ownerUserId,
    domain: normalizeSiteDomain(input.domain),
    brandColor: normalizeBrandColor(input.brandColor),
    widgetTitle: optionalText(input.widgetTitle) || DEFAULT_WIDGET_TITLE,
    greetingText: optionalText(input.greetingText) || DEFAULT_GREETING_TEXT,
    launcherPosition: normalizeLauncherPosition(input.launcherPosition),
    avatarStyle: normalizeAvatarStyle(input.avatarStyle),
    showOnlineStatus: input.showOnlineStatus,
    requireEmailOffline: input.requireEmailOffline,
    offlineTitle: normalizeWidgetCopy(input.offlineTitle, DEFAULT_OFFLINE_TITLE, 80),
    offlineMessage: normalizeWidgetCopy(input.offlineMessage, DEFAULT_OFFLINE_MESSAGE, 180),
    awayTitle: normalizeWidgetCopy(input.awayTitle, DEFAULT_AWAY_TITLE, 80),
    awayMessage: normalizeWidgetCopy(input.awayMessage, DEFAULT_AWAY_MESSAGE, 180),
    soundNotifications: input.soundNotifications,
    autoOpenPaths: normalizeAutoOpenPaths(input.autoOpenPaths),
    responseTimeMode: normalizeResponseTimeMode(input.responseTimeMode),
    operatingHoursEnabled: input.operatingHoursEnabled,
    operatingHoursTimezone: optionalText(input.operatingHoursTimezone) || DEFAULT_OPERATING_TIMEZONE,
    operatingHoursJson: serializeOperatingHours(input.operatingHours)
  });

  if (!updatedRecord) {
    return null;
  }

  const updated = await querySites("s.id = $1 AND s.user_id = $2", [siteId, workspace.ownerUserId], "LIMIT 1");
  return updated.rows[0] ? mapSite(updated.rows[0]) : null;
}

export async function getSiteByPublicId(siteId: string) {
  const result = await querySites("s.id = $1", [siteId], "LIMIT 1");
  return result.rows[0] ? mapSite(result.rows[0]) : null;
}

export async function getSiteWidgetConfig(siteId: string) {
  const site = await getSiteByPublicId(siteId);
  if (!site) {
    return null;
  }

  const billingAccount = await findBillingAccountRow(site.userId).catch(() => null);
  const planKey = normalizeBillingPlanKey(billingAccount?.plan_key);
  const features = getBillingPlanFeatures(planKey);
  const fallbackBrandingUrl = new URL("/signup", getPublicAppUrl()).toString();
  const brandingUrl = await getWidgetBrandingAttributionUrl(site.userId, site.id).catch(() => fallbackBrandingUrl);

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
    autoOpenPaths: features.proactiveChat ? site.autoOpenPaths : [],
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
    Boolean(lastSeenAt) &&
    Date.now() - new Date(lastSeenAt as string).getTime() <= SITE_ONLINE_GRACE_PERIOD_MS;

  return {
    online,
    lastSeenAt
  };
}

export async function recordSiteWidgetSeen(
  siteIdOrInput:
    | string
    | ({
        siteId: string;
        pageUrl?: string | null;
      } & Partial<Omit<RecordVisitorPresenceInput, "siteId" | "pageUrl">>),
  pageUrl: string | null = null
) {
  const input =
    typeof siteIdOrInput === "string"
      ? { siteId: siteIdOrInput, pageUrl }
      : siteIdOrInput;
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

export async function updateSiteTeamPhoto(
  siteId: string,
  userId: string,
  input: {
    fileName: string;
    contentType: string;
    content: Buffer;
  }
) {
  const workspace = await getWorkspaceAccess(userId);
  const current = await findSiteTeamPhotoRecord(siteId, workspace.ownerUserId);
  if (!current) {
    return null;
  }

  const uploaded = await uploadSiteTeamPhotoToR2({
    siteId,
    fileName: input.fileName,
    contentType: input.contentType,
    content: input.content
  });

  const updatedRecord = await updateSiteTeamPhotoRecord(siteId, workspace.ownerUserId, uploaded.url, uploaded.key);
  if (!updatedRecord) {
    return null;
  }

  if (current.team_photo_key && current.team_photo_key !== uploaded.key) {
    await deleteR2Object(current.team_photo_key).catch(() => {});
  }

  const updated = await querySites("s.id = $1 AND s.user_id = $2", [siteId, workspace.ownerUserId], "LIMIT 1");
  return updated.rows[0] ? mapSite(updated.rows[0]) : null;
}

export async function removeSiteTeamPhoto(siteId: string, userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const current = await findSiteTeamPhotoRecord(siteId, workspace.ownerUserId);
  if (!current) {
    return null;
  }

  const cleared = await clearSiteTeamPhotoRecord(siteId, workspace.ownerUserId);
  if (!cleared) {
    return null;
  }

  if (current.team_photo_key) {
    await deleteR2Object(current.team_photo_key).catch(() => {});
  }

  const updated = await querySites("s.id = $1 AND s.user_id = $2", [siteId, workspace.ownerUserId], "LIMIT 1");
  return updated.rows[0] ? mapSite(updated.rows[0]) : null;
}

export async function markSiteWidgetInstallVerified(siteId: string, userId: string, verifiedUrl: string | null = null) {
  const workspace = await getWorkspaceAccess(userId);
  const marked = await markSiteWidgetInstallVerifiedRecord(siteId, workspace.ownerUserId, optionalText(verifiedUrl));
  if (!marked) {
    return null;
  }

  const updated = await querySites("s.id = $1 AND s.user_id = $2", [siteId, workspace.ownerUserId], "LIMIT 1");
  return updated.rows[0] ? mapSite(updated.rows[0]) : null;
}
