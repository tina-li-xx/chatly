"use client";

import {
  DASHBOARD_AI_ASSIST_REQUEST_EVENT,
  DASHBOARD_ANALYTICS_EVENT,
} from "@/lib/browser-event-contracts";
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

export function dispatchDashboardAiAssistRequest(
  detail: DashboardAiAssistRequestDetail
) {
  window.dispatchEvent(new CustomEvent<DashboardAiAssistRequestDetail>(DASHBOARD_AI_ASSIST_REQUEST_EVENT, { detail }));
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

  window.addEventListener(DASHBOARD_AI_ASSIST_REQUEST_EVENT, handler as EventListener);

  return () => {
    window.removeEventListener(DASHBOARD_AI_ASSIST_REQUEST_EVENT, handler as EventListener);
  };
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

  window.addEventListener(DASHBOARD_ANALYTICS_EVENT, handler as EventListener);

  return () => {
    window.removeEventListener(DASHBOARD_ANALYTICS_EVENT, handler as EventListener);
  };
}

export function trackDashboardAiAssistEvent(
  name: string,
  detail: Record<string, unknown> = {}
) {
  const payload = { detail: { name, ...detail } };
  window.dispatchEvent(new CustomEvent(DASHBOARD_ANALYTICS_EVENT, payload));
}
