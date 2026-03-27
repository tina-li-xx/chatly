import { updateSiteWidgetSettings, updateSiteWidgetTitle } from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { createDefaultOperatingHours, normalizeSiteDomain } from "@/lib/widget-settings";

export async function POST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }
  const { user } = auth;

  const formData = await request.formData();
  const siteId = String(formData.get("siteId") ?? "").trim();
  const widgetTitle = String(formData.get("widgetTitle") ?? "").trim();
  const settingsRaw = String(formData.get("settings") ?? "").trim();

  if (!siteId) {
    return jsonError("site-id-missing", 400);
  }

  if (settingsRaw) {
    try {
      const parsed = JSON.parse(settingsRaw) as Record<string, unknown>;
      const normalizedDomain = normalizeSiteDomain(
        parsed.domain == null ? null : String(parsed.domain)
      );

      if (!normalizedDomain) {
        return jsonError("site-domain-required", 400);
      }

      const updated = await updateSiteWidgetSettings(siteId, user.id, {
        domain: normalizedDomain,
        brandColor: String(parsed.brandColor ?? ""),
        widgetTitle: String(parsed.widgetTitle ?? ""),
        greetingText: String(parsed.greetingText ?? ""),
        launcherPosition: parsed.launcherPosition === "left" ? "left" : "right",
        avatarStyle:
          parsed.avatarStyle === "photos" || parsed.avatarStyle === "icon" ? parsed.avatarStyle : "initials",
        showOnlineStatus: Boolean(parsed.showOnlineStatus),
        requireEmailOffline: Boolean(parsed.requireEmailOffline),
        soundNotifications: Boolean(parsed.soundNotifications),
        autoOpenPaths: Array.isArray(parsed.autoOpenPaths)
          ? parsed.autoOpenPaths.map((entry) => String(entry))
          : [],
        responseTimeMode:
          parsed.responseTimeMode === "hours" ||
          parsed.responseTimeMode === "day" ||
          parsed.responseTimeMode === "hidden"
            ? parsed.responseTimeMode
            : "minutes",
        operatingHoursEnabled: Boolean(parsed.operatingHoursEnabled),
        operatingHoursTimezone:
          parsed.operatingHoursTimezone == null ? null : String(parsed.operatingHoursTimezone),
        operatingHours:
          parsed.operatingHours && typeof parsed.operatingHours === "object"
            ? (parsed.operatingHours as ReturnType<typeof createDefaultOperatingHours>)
            : createDefaultOperatingHours()
      });

      if (!updated) {
        return jsonError("site-not-found", 404);
      }

      return jsonOk({
        siteId,
        widgetTitle: updated.widgetTitle,
        site: updated
      });
    } catch (error) {
      return jsonError("invalid-settings", 400);
    }
  }

  const updated = await updateSiteWidgetTitle(siteId, widgetTitle, user.id);
  if (!updated) {
    return jsonError("site-not-found", 404);
  }

  return jsonOk({ siteId, widgetTitle: updated });
}
