"use client";

import { useEffect, useRef, useState } from "react";
import {
  INTEGRATION_OAUTH_MESSAGE_TYPE
} from "@/lib/browser-event-contracts";

type PopupProvider = "slack" | "shopify";
type PopupMode = "connect" | "reconnect";

type PopupSuccessMessage =
  | {
      type: typeof INTEGRATION_OAUTH_MESSAGE_TYPE;
      provider: "slack";
      outcome: "success";
      workspaceName: string;
    }
  | {
      type: typeof INTEGRATION_OAUTH_MESSAGE_TYPE;
      provider: "shopify";
      outcome: "success";
      domain: string;
    };

type PopupRequest = {
  provider: PopupProvider;
  mode: PopupMode;
};

export function useDashboardIntegrationsOAuthPopup({
  onSuccess,
  onAbort
}: {
  onSuccess: (message: PopupSuccessMessage, request: PopupRequest) => void;
  onAbort: (request: PopupRequest) => void;
}) {
  const popupRef = useRef<Window | null>(null);
  const requestRef = useRef<PopupRequest | null>(null);
  const [activeRequest, setActiveRequest] = useState<PopupRequest | null>(null);

  useEffect(() => {
    if (!activeRequest) {
      return;
    }

    const handleMessage = (event: MessageEvent<PopupSuccessMessage>) => {
      if (
        event.origin !== window.location.origin ||
        event.data?.type !== INTEGRATION_OAUTH_MESSAGE_TYPE ||
        !requestRef.current
      ) {
        return;
      }

      if (event.data.outcome === "success" && event.data.provider === requestRef.current.provider) {
        onSuccess(event.data, requestRef.current);
      }

      requestRef.current = null;
      setActiveRequest(null);
      popupRef.current?.close();
      popupRef.current = null;
    };

    const closePoll = window.setInterval(() => {
      if (!popupRef.current || !requestRef.current || !popupRef.current.closed) {
        return;
      }

      const request = requestRef.current;
      requestRef.current = null;
      popupRef.current = null;
      setActiveRequest(null);
      onAbort(request);
    }, 300);

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(closePoll);
    };
  }, [activeRequest, onAbort, onSuccess]);

  function openAuthPopup(input: PopupRequest & { url: string }) {
    const popup = window.open(
      input.url,
      `chatting-${input.provider}-oauth`,
      "popup=yes,width=520,height=760,left=120,top=80"
    );

    if (!popup) {
      onAbort({ provider: input.provider, mode: input.mode });
      return false;
    }

    popupRef.current = popup;
    requestRef.current = { provider: input.provider, mode: input.mode };
    setActiveRequest({ provider: input.provider, mode: input.mode });
    popup.focus();
    return true;
  }

  return {
    activeRequest,
    openAuthPopup
  };
}
