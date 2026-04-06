"use client";

import { useEffect } from "react";
import { subscribeDashboardAiAssistAnalyticsEvents } from "./dashboard-ai-assist-events";

export function useDashboardAiAssistActivity() {
  useEffect(() => {
    return subscribeDashboardAiAssistAnalyticsEvents((detail) => {
      const name = detail.name?.trim();
      const conversationId = detail.conversationId?.trim();

      if (!name || !conversationId || name.endsWith(".requested")) {
        return;
      }

      void fetch("/dashboard/ai-assist/events", {
        method: "POST",
        keepalive: true,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          conversationId,
          metadata: {
            ...(detail.tone ? { tone: detail.tone } : {}),
            ...(detail.tag ? { tag: detail.tag } : {}),
            ...(typeof detail.edited === "boolean" ? { edited: detail.edited } : {}),
            ...(detail.editLevel ? { editLevel: detail.editLevel } : {})
          }
        })
      }).catch(() => {});
    });
  }, []);
}
