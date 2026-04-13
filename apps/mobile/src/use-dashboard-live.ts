import { useEffect, useState } from "react";
import { sanitizeBaseUrl } from "./formatting";
import type { DashboardLiveMessage } from "./live-events";
import { consumeSseMessages } from "./live-sse";
import { useStableCallback } from "./use-stable-callback";

type DashboardLiveInput = {
  baseUrl: string;
  token: string;
  onError?(): void;
  onMessage(message: DashboardLiveMessage): void;
};

const RETRY_DELAY_MS = 1500;

function decodeSseChunk(
  value: Uint8Array,
  decoder: TextDecoder | null
) {
  if (decoder) {
    return decoder.decode(value, { stream: true });
  }

  return String.fromCharCode(...value);
}

export function useDashboardLive(input: DashboardLiveInput) {
  const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "reconnecting">("connecting");
  const handleMessage = useStableCallback((message: DashboardLiveMessage) => {
    input.onMessage(message);
  });
  const handleError = useStableCallback(() => {
    input.onError?.();
  });

  useEffect(() => {
    const abortController = new AbortController();
    const decoder =
      typeof TextDecoder === "function" ? new TextDecoder() : null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let buffer = "";

    async function connect() {
      try {
        const response = await fetch(`${sanitizeBaseUrl(input.baseUrl)}/dashboard/live`, {
          headers: {
            Accept: "text/event-stream",
            Authorization: `Bearer ${input.token}`
          },
          signal: abortController.signal
        });

        if (!response.ok || !response.body) {
          throw new Error(`live-${response.status}`);
        }

        setConnectionState("connected");
        const reader = response.body.getReader();

        while (!abortController.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decodeSseChunk(value, decoder);
          const next = consumeSseMessages(buffer);
          buffer = next.rest;

          for (const message of next.messages) {
            handleMessage(message);
          }
        }
      } catch {
        if (!abortController.signal.aborted) {
          setConnectionState("reconnecting");
          handleError();
        }
      }

      if (!abortController.signal.aborted) {
        reconnectTimeout = setTimeout(() => {
          void connect();
        }, RETRY_DELAY_MS);
      }
    }

    void connect();

    return () => {
      abortController.abort();
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [input.baseUrl, input.token]);

  return { connectionState };
}
