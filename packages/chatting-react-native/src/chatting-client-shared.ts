import { normalizeText, resolveContext } from "./chatting-utils";
import type { ChattingSessionState } from "./chatting-types";

export const DEFAULT_CHATTING_BASE_URL = "https://usechatting.com";

export function requireChattingText(value: string | null | undefined, message: string) {
  const nextValue = normalizeText(value);
  if (!nextValue) {
    throw new Error(message);
  }
  return nextValue;
}

export function buildChattingSiteQuery(
  siteId: string,
  state: ChattingSessionState,
  context: ReturnType<typeof resolveContext>
) {
  return {
    siteId,
    sessionId: state.sessionId,
    email: state.email ?? null,
    pageUrl: context.pageUrl,
    referrer: context.referrer,
    timezone: context.timezone,
    locale: context.locale
  };
}
