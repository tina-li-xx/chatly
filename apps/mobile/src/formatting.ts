import type { ConversationSummary } from "./types";

export function sanitizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (60 * 1000));

  if (Math.abs(diffMinutes) < 60) {
    return formatRelativeUnit(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatRelativeUnit(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return formatRelativeUnit(diffDays, "day");
}

function formatRelativeUnit(value: number, unit: "minute" | "hour" | "day") {
  if (value === 0) {
    return "just now";
  }

  const absolute = Math.abs(value);
  const suffix = absolute === 1 ? unit : `${unit}s`;

  return value < 0 ? `${absolute} ${suffix} ago` : `in ${absolute} ${suffix}`;
}

export function conversationLabel(conversation: Pick<ConversationSummary, "email" | "siteName">) {
  return conversation.email || conversation.siteName;
}

export function conversationLocation(conversation: Pick<ConversationSummary, "city" | "region" | "country">) {
  return [conversation.city, conversation.region, conversation.country].filter(Boolean).join(", ") || null;
}

export function formatClockTime(value: string) {
  const date = new Date(value);

  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  } catch {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
}

export function compactPageLabel(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return `${url.pathname || "/"}${url.search}`;
  } catch {
    return value;
  }
}

export function referrerLabel(referrer: string | null | undefined) {
  if (!referrer) {
    return "Direct";
  }

  try {
    return new URL(referrer).host.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}

export function browserLabel(userAgent: string | null | undefined) {
  if (!userAgent) {
    return "Unknown";
  }

  const source = userAgent.toLowerCase();
  const browser = source.includes("edg/")
    ? "Edge"
    : source.includes("chrome") && !source.includes("edg/")
      ? "Chrome"
      : source.includes("safari") && !source.includes("chrome")
        ? "Safari"
        : source.includes("firefox")
          ? "Firefox"
          : "Browser";
  const os = source.includes("mac os")
    ? "macOS"
    : source.includes("windows")
      ? "Windows"
      : source.includes("iphone") || source.includes("ipad")
        ? "iOS"
        : source.includes("android")
          ? "Android"
          : "OS";

  return `${browser}, ${os}`;
}

export function formatCountLabel(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

export function formatPersonName(value: { firstName: string; lastName: string; email: string }) {
  const name = [value.firstName, value.lastName].filter(Boolean).join(" ").trim();
  return name || value.email;
}

export function initialsFromLabel(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "?";
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export function friendlyErrorMessage(value: string) {
  switch (value) {
    case "missing-fields":
      return "Enter both your email and password.";
    case "missing-email":
      return "Enter your email address to continue.";
    case "missing-password":
      return "Enter a new password to continue.";
    case "missing-current-password":
      return "Enter your current password to continue.";
    case "invalid-credentials":
      return "That email and password combination did not match.";
    case "invalid-current-password":
      return "Your current password did not match.";
    case "invalid-reset-token":
      return "That reset link is invalid or has expired.";
    case "email-not-verified":
      return "This account still needs email verification before mobile login.";
    case "weak-password":
      return "Use at least 8 characters for your new password.";
    case "password-mismatch":
    case "password-confirm":
      return "Your password confirmation does not match.";
    case "auth":
      return "Your session expired. Sign in again.";
    case "camera-permission":
      return "Allow camera access to take a profile photo.";
    case "photo-permission":
      return "Allow photo library access to choose a profile photo.";
    case "image-read-failed":
      return "That photo could not be read. Try a different image.";
    case "settings-save-failed":
      return "Those settings did not save. Try again in a moment.";
    case "reply-failed":
      return "That reply did not send. Try again in a moment.";
    default:
      return value.replace(/-/g, " ");
  }
}
