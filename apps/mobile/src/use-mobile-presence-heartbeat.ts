import { useEffect } from "react";
import { recordPresence } from "./mobile-workspace-api";

const HEARTBEAT_INTERVAL_MS = 60 * 1000;

export function useMobilePresenceHeartbeat(input: {
  baseUrl: string | null;
  token: string | null;
  enabled: boolean;
}) {
  useEffect(() => {
    if (!input.enabled || !input.baseUrl || !input.token) {
      return;
    }

    async function beat() {
      try {
        await recordPresence(input.baseUrl as string, input.token as string);
      } catch {
        // Presence should be best-effort so the inbox stays usable offline.
      }
    }

    void beat();
    const intervalId = setInterval(() => {
      void beat();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [input.baseUrl, input.enabled, input.token]);
}
