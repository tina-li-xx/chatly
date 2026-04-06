"use client";

import type { AiAssistReplyEditLevel } from "@/lib/types";

export type DashboardAiAssistRequestAction = "reply" | "summarize";

export type DashboardAiAssistRequestDetail = {
  action: DashboardAiAssistRequestAction;
  conversationId: string;
};

export type DashboardAiAssistAnalyticsDetail = {
  name: string;
  conversationId?: string;
  tone?: string;
  tag?: string;
  edited?: boolean;
  editLevel?: AiAssistReplyEditLevel;
};

const AI_ASSIST_REQUEST_EVENT = "chatly:ai-assist-request";
const ANALYTICS_EVENT = "chatly:analytics-event";

export function dispatchDashboardAiAssistRequest(
  detail: DashboardAiAssistRequestDetail
) {
  window.dispatchEvent(
    new CustomEvent<DashboardAiAssistRequestDetail>(AI_ASSIST_REQUEST_EVENT, {
      detail
    })
  );
}

export function subscribeDashboardAiAssistRequests(
  listener: (detail: DashboardAiAssistRequestDetail) => void
) {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<DashboardAiAssistRequestDetail>;
    if (customEvent.detail) {
      listener(customEvent.detail);
    }
  };

  window.addEventListener(AI_ASSIST_REQUEST_EVENT, handler as EventListener);
  return () =>
    window.removeEventListener(
      AI_ASSIST_REQUEST_EVENT,
      handler as EventListener
    );
}

export function subscribeDashboardAiAssistAnalyticsEvents(
  listener: (detail: DashboardAiAssistAnalyticsDetail) => void
) {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<DashboardAiAssistAnalyticsDetail>;
    if (customEvent.detail?.name) {
      listener(customEvent.detail);
    }
  };

  window.addEventListener(ANALYTICS_EVENT, handler as EventListener);
  return () =>
    window.removeEventListener(ANALYTICS_EVENT, handler as EventListener);
}

export function trackDashboardAiAssistEvent(
  name: string,
  detail: Record<string, unknown> = {}
) {
  window.dispatchEvent(
    new CustomEvent(ANALYTICS_EVENT, {
      detail: { name, ...detail }
    })
  );
}
