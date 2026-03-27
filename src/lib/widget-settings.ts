import type {
  Site,
  WidgetAvatarStyle,
  WidgetLauncherPosition,
  WidgetOperatingHours,
  WidgetOperatingHoursDay,
  WidgetResponseTimeMode
} from "@/lib/types";
import { optionalText } from "@/lib/utils";

export const DEFAULT_BRAND_COLOR = "#2563EB";
export const DEFAULT_WIDGET_TITLE = "Talk to the team";
export const DEFAULT_GREETING_TEXT = "Hi there. Have a question? We're here to help.";
export const DEFAULT_LAUNCHER_POSITION: WidgetLauncherPosition = "right";
export const DEFAULT_AVATAR_STYLE: WidgetAvatarStyle = "initials";
export const DEFAULT_RESPONSE_TIME_MODE: WidgetResponseTimeMode = "minutes";
export const DEFAULT_OPERATING_TIMEZONE = "UTC";

const DEFAULT_DAY_HOURS: WidgetOperatingHoursDay = {
  enabled: true,
  from: "09:00",
  to: "17:00"
};

export function createDefaultOperatingHours(): WidgetOperatingHours {
  return {
    monday: { ...DEFAULT_DAY_HOURS },
    tuesday: { ...DEFAULT_DAY_HOURS },
    wednesday: { ...DEFAULT_DAY_HOURS },
    thursday: { ...DEFAULT_DAY_HOURS },
    friday: { ...DEFAULT_DAY_HOURS },
    saturday: { enabled: false, from: "10:00", to: "16:00" },
    sunday: { enabled: false, from: "10:00", to: "16:00" }
  };
}

export function normalizeBrandColor(value: string | null | undefined) {
  const normalized = optionalText(value);
  if (!normalized) {
    return DEFAULT_BRAND_COLOR;
  }

  const hex = normalized.toUpperCase();
  return /^#[0-9A-F]{6}$/.test(hex) ? hex : DEFAULT_BRAND_COLOR;
}

export function normalizeSiteDomain(value: string | null | undefined) {
  const normalized = optionalText(value);
  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    try {
      const parsed = new URL(normalized);
      const path = parsed.pathname.replace(/\/+$/, "");
      return `${parsed.origin}${path === "/" ? "" : path}`;
    } catch {
      return normalized.replace(/\/+$/, "");
    }
  }

  return normalized.replace(/\/+$/, "");
}

export function normalizeLauncherPosition(value: string | null | undefined): WidgetLauncherPosition {
  return value === "left" ? "left" : "right";
}

export function normalizeAvatarStyle(value: string | null | undefined): WidgetAvatarStyle {
  if (value === "photos" || value === "icon") {
    return value;
  }

  return DEFAULT_AVATAR_STYLE;
}

export function normalizeResponseTimeMode(value: string | null | undefined): WidgetResponseTimeMode {
  if (value === "hours" || value === "day" || value === "hidden") {
    return value;
  }

  return DEFAULT_RESPONSE_TIME_MODE;
}

export function normalizeAutoOpenPaths(value: string | string[] | null | undefined) {
  const rawValues = Array.isArray(value) ? value : String(value ?? "").split(",");

  return rawValues
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => (entry.startsWith("/") ? entry : `/${entry}`))
    .slice(0, 20);
}

function isOperatingHoursDay(value: unknown): value is WidgetOperatingHoursDay {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.enabled === "boolean" &&
    typeof candidate.from === "string" &&
    typeof candidate.to === "string"
  );
}

export function parseOperatingHours(raw: string | null | undefined) {
  if (!raw) {
    return createDefaultOperatingHours();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<WidgetOperatingHours>;
    const fallback = createDefaultOperatingHours();

    return {
      monday: isOperatingHoursDay(parsed.monday) ? parsed.monday : fallback.monday,
      tuesday: isOperatingHoursDay(parsed.tuesday) ? parsed.tuesday : fallback.tuesday,
      wednesday: isOperatingHoursDay(parsed.wednesday) ? parsed.wednesday : fallback.wednesday,
      thursday: isOperatingHoursDay(parsed.thursday) ? parsed.thursday : fallback.thursday,
      friday: isOperatingHoursDay(parsed.friday) ? parsed.friday : fallback.friday,
      saturday: isOperatingHoursDay(parsed.saturday) ? parsed.saturday : fallback.saturday,
      sunday: isOperatingHoursDay(parsed.sunday) ? parsed.sunday : fallback.sunday
    };
  } catch (error) {
    return createDefaultOperatingHours();
  }
}

export function serializeOperatingHours(value: WidgetOperatingHours) {
  return JSON.stringify(value);
}

export function buildWidgetSettingsPayload(site: Site) {
  return {
    domain: site.domain,
    brandColor: site.brandColor,
    widgetTitle: site.widgetTitle,
    greetingText: site.greetingText,
    launcherPosition: site.launcherPosition,
    avatarStyle: site.avatarStyle,
    showOnlineStatus: site.showOnlineStatus,
    requireEmailOffline: site.requireEmailOffline,
    soundNotifications: site.soundNotifications,
    autoOpenPaths: site.autoOpenPaths,
    responseTimeMode: site.responseTimeMode,
    operatingHoursEnabled: site.operatingHoursEnabled,
    operatingHoursTimezone: site.operatingHoursTimezone,
    operatingHours: site.operatingHours
  };
}
