"use client";

import { useEffect, useRef } from "react";
import type { DashboardAiAssistRequestAction } from "./dashboard-ai-assist-events";
import { subscribeDashboardAiAssistRequests } from "./dashboard-ai-assist-events";
import { readDashboardAiAssistRoutePayload } from "./dashboard-ai-assist-route";

export type DashboardAiAssistRequestResult<T> =
  | { status: "success"; result: T | undefined }
  | { status: "limit"; resetsAt: string | null }
  | { status: "error" };

export async function requestDashboardAiAssist<T>(
  body: Record<string, unknown>
): Promise<DashboardAiAssistRequestResult<T>> {
  try {
    const response = await fetch("/dashboard/ai-assist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const { payload, error } = await readDashboardAiAssistRoutePayload<T>(response);

    if (error) {
      return error.code === "ai-assist-limit-reached"
        ? { status: "limit", resetsAt: error.resetsAt }
        : { status: "error" };
    }

    return { status: "success", result: payload.result };
  } catch {
    return { status: "error" };
  }
}

export function useDashboardAiAssistConversationReset(
  conversationId: string,
  onReset: () => void
) {
  const onResetRef = useRef(onReset);

  useEffect(() => {
    onResetRef.current = onReset;
  }, [onReset]);

  useEffect(() => {
    onResetRef.current();
  }, [conversationId]);
}

export function useDashboardAiAssistRequestSubscription(input: {
  action: DashboardAiAssistRequestAction;
  conversationId: string;
  enabled: boolean;
  onRequest: () => void | Promise<void>;
}) {
  const onRequestRef = useRef(input.onRequest);

  useEffect(() => {
    onRequestRef.current = input.onRequest;
  }, [input.onRequest]);

  useEffect(() => {
    if (!input.enabled) {
      return;
    }

    return subscribeDashboardAiAssistRequests((detail) => {
      if (
        detail.action === input.action &&
        detail.conversationId === input.conversationId
      ) {
        void onRequestRef.current();
      }
    });
  }, [input.action, input.conversationId, input.enabled]);
}
