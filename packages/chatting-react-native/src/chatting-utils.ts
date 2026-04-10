import type { ChattingVisitorContext } from "./chatting-types";

export function createSessionId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID().toLowerCase();
  }

  return `chat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeBaseURL(baseURL: string) {
  return baseURL.replace(/\/+$/, "");
}

export function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function resolveContext(context: ChattingVisitorContext = {}) {
  return {
    pageUrl: normalizeText(context.pageUrl),
    referrer: normalizeText(context.referrer),
    timezone: normalizeText(context.timezone) ?? currentTimeZone(),
    locale: normalizeText(context.locale) ?? currentLocale(),
    tags: context.tags ?? [],
    customFields: context.customFields ?? {}
  };
}

export function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Chatting error.";
}

function currentLocale() {
  return typeof Intl === "object" ? Intl.DateTimeFormat().resolvedOptions().locale : null;
}

function currentTimeZone() {
  return typeof Intl === "object" ? Intl.DateTimeFormat().resolvedOptions().timeZone : null;
}
