import { getPublicAppUrl } from "@/lib/env";
import {
  createDefaultOperatingHours,
  DEFAULT_AVATAR_STYLE,
  DEFAULT_BRAND_COLOR,
  DEFAULT_GREETING_TEXT,
  DEFAULT_RESPONSE_TIME_MODE,
  DEFAULT_WIDGET_TITLE
} from "@/lib/widget-settings";
import type {
  OnboardingStep,
  Site,
  WidgetLauncherPosition,
  WidgetOperatingHours,
  WidgetResponseTimeMode
} from "@/lib/types";

export type InstallTab = "code" | "nextjs" | "wordpress" | "shopify" | "other";
export type OnboardingFlowStep = Exclude<OnboardingStep, "signup" | "team" | "done">;
export type OnboardingFlowProps = {
  initialStep: OnboardingFlowStep;
  initialSite: Site | null;
};

export type WidgetDraft = {
  id: string | null;
  name: string;
  domain: string;
  conversationCount: number;
  brandColor: string;
  widgetTitle: string;
  greetingText: string;
  launcherPosition: WidgetLauncherPosition;
  avatarStyle: Site["avatarStyle"];
  teamPhotoUrl: string | null;
  showOnlineStatus: boolean;
  requireEmailOffline: boolean;
  soundNotifications: boolean;
  autoOpenPaths: string[];
  responseTimeMode: WidgetResponseTimeMode;
  operatingHoursEnabled: boolean;
  operatingHoursTimezone: string | null;
  operatingHours: WidgetOperatingHours;
  widgetInstallVerifiedAt: string | null;
  widgetInstallVerifiedUrl: string | null;
  widgetLastSeenAt: string | null;
  widgetLastSeenUrl: string | null;
};

export const STEP_META: Array<{ step: OnboardingFlowStep; title: string; duration: string }> = [
  { step: "customize", title: "Customize", duration: "60 sec" },
  { step: "install", title: "Install", duration: "2-3 min" }
];

export const INSTALL_TABS: Array<{ value: InstallTab; label: string }> = [
  { value: "code", label: "Code snippet" },
  { value: "nextjs", label: "Next.js" },
  { value: "wordpress", label: "WordPress" },
  { value: "shopify", label: "Shopify" },
  { value: "other", label: "Other" }
];

export const INSTALL_TAB_COPY: Record<InstallTab, string> = {
  code: "Paste this into your site footer, right before the closing body tag.",
  nextjs: "Drop this into your Next.js app with `next/script` so the widget loads after the page becomes interactive.",
  wordpress: "Paste this into your theme footer or your site's code injection area.",
  shopify: "Paste this into your theme code or app embed area, then publish the theme.",
  other: "Use this same snippet in your global footer, custom code area, or body-end injection."
};

export const RESPONSE_TIME_OPTIONS: Array<{ value: WidgetResponseTimeMode; label: string }> = [
  { value: "minutes", label: "Typically replies in minutes" },
  { value: "hours", label: "Typically replies in a few hours" },
  { value: "day", label: "Typically replies in a day" },
  { value: "hidden", label: "Show online only" }
];

export function createWidgetDraft(site: Site | null): WidgetDraft {
  return {
    id: site?.id ?? null,
    name: site?.name ?? "",
    domain: site?.domain ?? "",
    conversationCount: site?.conversationCount ?? 0,
    brandColor: site?.brandColor ?? DEFAULT_BRAND_COLOR,
    widgetTitle: site?.widgetTitle ?? DEFAULT_WIDGET_TITLE,
    greetingText: site?.greetingText ?? DEFAULT_GREETING_TEXT,
    launcherPosition: site?.launcherPosition ?? "right",
    avatarStyle: site?.avatarStyle ?? DEFAULT_AVATAR_STYLE,
    teamPhotoUrl: site?.teamPhotoUrl ?? null,
    showOnlineStatus: site?.showOnlineStatus ?? true,
    requireEmailOffline: site?.requireEmailOffline ?? false,
    soundNotifications: site?.soundNotifications ?? false,
    autoOpenPaths: site?.autoOpenPaths ?? [],
    responseTimeMode: site?.responseTimeMode ?? DEFAULT_RESPONSE_TIME_MODE,
    operatingHoursEnabled: site?.operatingHoursEnabled ?? false,
    operatingHoursTimezone: site?.operatingHoursTimezone ?? "UTC",
    operatingHours: site?.operatingHours ?? createDefaultOperatingHours(),
    widgetInstallVerifiedAt: site?.widgetInstallVerifiedAt ?? null,
    widgetInstallVerifiedUrl: site?.widgetInstallVerifiedUrl ?? null,
    widgetLastSeenAt: site?.widgetLastSeenAt ?? null,
    widgetLastSeenUrl: site?.widgetLastSeenUrl ?? null
  };
}

export function getDetectedInstallUrl(site: Pick<WidgetDraft, "widgetInstallVerifiedUrl" | "widgetLastSeenUrl" | "domain">) {
  return site.widgetLastSeenUrl ?? site.widgetInstallVerifiedUrl ?? site.domain;
}

export function verifyErrorMessage(code: string, hasDomain: boolean) {
  if (code === "missing-domain" || (!hasDomain && code)) {
    return "Save your website URL first so Chatting knows where to check.";
  }

  if (code === "site-not-found") {
    return "We couldn't find this site anymore.";
  }

  if (code === "unable-to-fetch" || code === "snippet-not-found") {
    return "Widget not detected yet. Add the code, publish your site, and check again.";
  }

  return "We couldn't verify the widget right now. Try again in a moment.";
}

export function copyButtonLabel(copied: boolean, base = "Copy code") {
  return copied ? "Copied!" : base;
}

export function buildSnippet(siteId: string | null) {
  const src = `${getPublicAppUrl().replace(/\/$/, "")}/widget.js`;
  return `<script\n  src="${src}"\n  data-site-id="${siteId ?? "your-site-id"}"\n></script>`;
}

export function buildNextJsSnippet(siteId: string | null) {
  const src = `${getPublicAppUrl().replace(/\/$/, "")}/widget.js`;

  return `import Script from "next/script";

export default function ChattingScript() {
  return (
    <Script
      src="${src}"
      data-site-id="${siteId ?? "your-site-id"}"
      strategy="afterInteractive"
    />
  );
}`;
}

export function normalizeSiteHref(value: string | null) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return null;
  }

  return /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;
}

export function siteDisplayUrl(value: string | null) {
  const href = normalizeSiteHref(value);
  return href ? href.replace(/\/$/, "") : null;
}

export function previewWidgetTitle(draft: WidgetDraft, fallbackTeamName: string) {
  return draft.widgetTitle.trim() || fallbackTeamName.trim() || "Acme Support";
}

export function previewGreeting(draft: WidgetDraft) {
  return draft.greetingText.trim() || DEFAULT_GREETING_TEXT;
}

export function responseTimeCopy(mode: WidgetResponseTimeMode) {
  if (mode === "hours") {
    return "Replies in a few hours";
  }

  if (mode === "day") {
    return "Replies in a day";
  }

  if (mode === "hidden") {
    return "";
  }

  return "Replies in minutes";
}

export function previewStatus(draft: WidgetDraft) {
  if (!draft.showOnlineStatus) {
    return "";
  }

  const replyCopy = responseTimeCopy(draft.responseTimeMode);
  return replyCopy ? `Online • ${replyCopy}` : "Online";
}

export function previewAvatarInitials(draft: WidgetDraft, fallbackTeamName: string) {
  return (
    previewWidgetTitle(draft, fallbackTeamName)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "CT"
  );
}

export function sanitizeHexInput(value: string) {
  return value.replace(/[^0-9a-f]/gi, "").slice(0, 6).toUpperCase();
}

export function normalizeHexColor(value: string) {
  const sanitized = sanitizeHexInput(value);
  return sanitized.length === 6 ? `#${sanitized}` : null;
}
