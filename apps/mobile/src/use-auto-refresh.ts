import { useEffect } from "react";
import { useStableCallback } from "./use-stable-callback";

const DEFAULT_REFRESH_INTERVAL_MS = 4000;

export function useAutoRefresh(
  callback: () => void,
  enabled: boolean,
  intervalMs = DEFAULT_REFRESH_INTERVAL_MS
) {
  const stableCallback = useStableCallback(callback);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const interval = setInterval(() => {
      stableCallback();
    }, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [enabled, intervalMs, stableCallback]);
}
