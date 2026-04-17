import { updateSiteWidgetSettings, updateSiteWidgetTitle } from "@/lib/services";
import { findBillingAccountRow } from "@/lib/services/billing";
import { getBillingPlanFeatures, normalizeBillingPlanKey } from "@/lib/billing-plans";
import { readRouteFormData } from "@/lib/route-form-data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { createDefaultOperatingHours, normalizeSiteDomain } from "@/lib/widget-settings";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }
  const { user } = auth;

  const formData = await readRouteFormData(request);
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

      const autoOpenPaths = Array.isArray(parsed.autoOpenPaths)
        ? parsed.autoOpenPaths.map((entry) => String(entry))
        : [];
      const billingAccount = await findBillingAccountRow(user.id);
      const features = getBillingPlanFeatures(normalizeBillingPlanKey(billingAccount?.plan_key));

      if (autoOpenPaths.length && !features.proactiveChat) {
        return jsonError("proactive_chat_requires_growth", 403);
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
        offlineTitle: String(parsed.offlineTitle ?? ""),
        offlineMessage: String(parsed.offlineMessage ?? ""),
        awayTitle: String(parsed.awayTitle ?? ""),
        awayMessage: String(parsed.awayMessage ?? ""),
        soundNotifications: Boolean(parsed.soundNotifications),
        autoOpenPaths,
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

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/sites/update/route.ts:POST");
