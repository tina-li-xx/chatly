"use client";

import { useEffect } from "react";

export function useDashboardPresenceHeartbeat() {
  useEffect(() => {
    let intervalId: number | null = null;

    const sendHeartbeat = () => {
      fetch("/dashboard/presence", { method: "POST", keepalive: true }).catch(() => {});
    };

    const startHeartbeat = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      sendHeartbeat();
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      intervalId = window.setInterval(sendHeartbeat, 30000);
    };

    const stopHeartbeat = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startHeartbeat();
      } else {
        stopHeartbeat();
      }
    };

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    };

    startHeartbeat();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      stopHeartbeat();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);
}
