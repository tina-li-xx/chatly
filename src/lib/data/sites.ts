import { randomUUID } from "node:crypto";
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
import type {
  Site,
  WidgetAvatarStyle,
  WidgetLauncherPosition,
  WidgetOperatingHours,
  WidgetResponseTimeMode
} from "@/lib/types";
import { optionalText } from "@/lib/utils";
import {
  DEFAULT_BRAND_COLOR,
  DEFAULT_GREETING_TEXT,
  DEFAULT_OPERATING_TIMEZONE,
  DEFAULT_WIDGET_TITLE,
  normalizeAutoOpenPaths,
  normalizeAvatarStyle,
  normalizeBrandColor,
  normalizeLauncherPosition,
  normalizeSiteDomain,
  normalizeResponseTimeMode,
  serializeOperatingHours
} from "@/lib/widget-settings";
import { mapSite, querySites } from "./shared";

const SITE_ONLINE_GRACE_PERIOD_MS = 5 * 60 * 1000;

export type UpdateSiteWidgetSettingsInput = {
  domain: string | null;
  brandColor: string;
  widgetTitle: string;
  greetingText: string;
  launcherPosition: WidgetLauncherPosition;
  avatarStyle: WidgetAvatarStyle;
  showOnlineStatus: boolean;
  requireEmailOffline: boolean;
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
  const result = await querySites("s.user_id = $1", [userId], "ORDER BY s.created_at ASC");
  return result.rows.map(mapSite);
}

export async function updateSiteWidgetTitle(siteId: string, widgetTitle: string, userId: string) {
  const normalizedTitle = optionalText(widgetTitle) || DEFAULT_WIDGET_TITLE;
  return updateSiteWidgetTitleRecord(siteId, userId, normalizedTitle);
}

export async function updateSiteOnboardingSetup(
  siteId: string,
  userId: string,
  input: {
    name: string;
    domain: string;
  }
) {
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
    userId,
    name,
    domain,
    widgetTitle: name
  });

  if (!updatedRecord) {
    return null;
  }

  const updated = await querySites("s.id = $1 AND s.user_id = $2", [siteId, userId], "LIMIT 1");
  return updated.rows[0] ? mapSite(updated.rows[0]) : null;
}

export async function updateSiteWidgetSettings(
  siteId: string,
  userId: string,
  input: UpdateSiteWidgetSettingsInput
) {
  const updatedRecord = await updateSiteWidgetSettingsRecord({
    siteId,
    userId,
    domain: normalizeSiteDomain(input.domain),
    brandColor: normalizeBrandColor(input.brandColor),
    widgetTitle: optionalText(input.widgetTitle) || DEFAULT_WIDGET_TITLE,
    greetingText: optionalText(input.greetingText) || DEFAULT_GREETING_TEXT,
    launcherPosition: normalizeLauncherPosition(input.launcherPosition),
    avatarStyle: normalizeAvatarStyle(input.avatarStyle),
    showOnlineStatus: input.showOnlineStatus,
    requireEmailOffline: input.requireEmailOffline,
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

  const updated = await querySites("s.id = $1 AND s.user_id = $2", [siteId, userId], "LIMIT 1");
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
    soundNotifications: site.soundNotifications,
    autoOpenPaths: site.autoOpenPaths,
    responseTimeMode: site.responseTimeMode,
    operatingHoursEnabled: site.operatingHoursEnabled,
    operatingHoursTimezone: site.operatingHoursTimezone,
    operatingHours: site.operatingHours,
    widgetInstallVerifiedAt: site.widgetInstallVerifiedAt,
    widgetInstallVerifiedUrl: site.widgetInstallVerifiedUrl,
    widgetLastSeenAt: site.widgetLastSeenAt,
    widgetLastSeenUrl: site.widgetLastSeenUrl
  } satisfies Omit<Site, "userId" | "name" | "domain" | "createdAt" | "conversationCount"> & { id: string };
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

export async function recordSiteWidgetSeen(siteId: string, pageUrl: string | null = null) {
  await touchSiteWidgetSeenRecord(siteId, optionalText(pageUrl));
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
  const current = await findSiteTeamPhotoRecord(siteId, userId);
  if (!current) {
    return null;
  }

  const uploaded = await uploadSiteTeamPhotoToR2({
    siteId,
    fileName: input.fileName,
    contentType: input.contentType,
    content: input.content
  });

  const updatedRecord = await updateSiteTeamPhotoRecord(siteId, userId, uploaded.url, uploaded.key);
  if (!updatedRecord) {
    return null;
  }

  if (current.team_photo_key && current.team_photo_key !== uploaded.key) {
    await deleteR2Object(current.team_photo_key).catch(() => {});
  }

  const updated = await querySites("s.id = $1 AND s.user_id = $2", [siteId, userId], "LIMIT 1");
  return updated.rows[0] ? mapSite(updated.rows[0]) : null;
}

export async function removeSiteTeamPhoto(siteId: string, userId: string) {
  const current = await findSiteTeamPhotoRecord(siteId, userId);
  if (!current) {
    return null;
  }

  const cleared = await clearSiteTeamPhotoRecord(siteId, userId);
  if (!cleared) {
    return null;
  }

  if (current.team_photo_key) {
    await deleteR2Object(current.team_photo_key).catch(() => {});
  }

  const updated = await querySites("s.id = $1 AND s.user_id = $2", [siteId, userId], "LIMIT 1");
  return updated.rows[0] ? mapSite(updated.rows[0]) : null;
}

export async function markSiteWidgetInstallVerified(siteId: string, userId: string, verifiedUrl: string | null = null) {
  const marked = await markSiteWidgetInstallVerifiedRecord(siteId, userId, optionalText(verifiedUrl));
  if (!marked) {
    return null;
  }

  const updated = await querySites("s.id = $1 AND s.user_id = $2", [siteId, userId], "LIMIT 1");
  return updated.rows[0] ? mapSite(updated.rows[0]) : null;
}
