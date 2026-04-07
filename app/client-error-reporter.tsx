"use client";

import { useEffect } from "react";

type ClientErrorPayload = {
  kind: "window.error" | "window.unhandledrejection";
  message: string;
  pageUrl: string;
  stack?: string | null;
  userAgent: string;
  timestamp: string;
};

function postClientError(payload: ClientErrorPayload) {
  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/error/client", blob);
    return;
  }

  void fetch("/api/error/client", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body,
    keepalive: true
  });
}

function buildBasePayload(kind: ClientErrorPayload["kind"]) {
  return {
    kind,
    pageUrl: window.location.href,
    userAgent: window.navigator.userAgent,
    timestamp: new Date().toISOString()
  };
}

export function ClientErrorReporter() {
  useEffect(() => {
    function handleWindowError(event: ErrorEvent) {
      postClientError({
        ...buildBasePayload("window.error"),
        message: event.message || event.error?.message || "Unknown browser error",
        stack: event.error?.stack || null
      });
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      postClientError({
        ...buildBasePayload("window.unhandledrejection"),
        message:
          reason instanceof Error
            ? reason.message
            : typeof reason === "string"
              ? reason
              : "Unhandled promise rejection",
        stack: reason instanceof Error ? reason.stack : null
      });
    }

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
