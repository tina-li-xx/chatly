"use client";

import { useEffect } from "react";

const PRESENCE_HEARTBEAT_INTERVAL_MS = 30000;
const PRESENCE_LEADER_TTL_MS = 45000;
const PRESENCE_LEADER_KEY = "chatting.dashboard.presence.leader";

type PresenceLeaderRecord = {
  tabId: string;
  expiresAt: number;
};

function readPresenceLeader() {
  try {
    const raw = window.localStorage.getItem(PRESENCE_LEADER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PresenceLeaderRecord>;
    if (typeof parsed.tabId !== "string" || typeof parsed.expiresAt !== "number") {
      return null;
    }
    return parsed as PresenceLeaderRecord;
  } catch {
    return null;
  }
}

function writePresenceLeader(record: PresenceLeaderRecord) {
  try {
    window.localStorage.setItem(PRESENCE_LEADER_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function useDashboardPresenceHeartbeat() {
  useEffect(() => {
    const tabId = `dashboard-presence-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let heartbeatIntervalId: number | null = null;
    let takeoverTimeoutId: number | null = null;
    const isVisible = () => document.visibilityState === "visible";
    const canCoordinate = () => typeof window.localStorage !== "undefined";
    const ownsLeadership = () => readPresenceLeader()?.tabId === tabId;

    const sendHeartbeat = () => {
      fetch("/dashboard/presence", { method: "POST", keepalive: true }).catch(() => {});
    };

    const clearTakeoverTimeout = () => {
      if (takeoverTimeoutId === null) return;
      window.clearTimeout(takeoverTimeoutId);
      takeoverTimeoutId = null;
    };

    const stopHeartbeat = () => {
      if (heartbeatIntervalId === null) return;
      window.clearInterval(heartbeatIntervalId);
      heartbeatIntervalId = null;
    };

    const refreshLeadership = () =>
      !canCoordinate() ||
      writePresenceLeader({ tabId, expiresAt: Date.now() + PRESENCE_LEADER_TTL_MS });

    const releaseLeadership = () => {
      stopHeartbeat();
      clearTakeoverTimeout();
      if (!canCoordinate() || !ownsLeadership()) return;
      try {
        window.localStorage.removeItem(PRESENCE_LEADER_KEY);
      } catch {}
    };

    const scheduleTakeover = (leader: PresenceLeaderRecord | null) => {
      clearTakeoverTimeout();
      if (!isVisible() || !canCoordinate()) return;
      if (!leader || leader.expiresAt <= Date.now()) {
        reconcileLeadership();
        return;
      }
      takeoverTimeoutId = window.setTimeout(
        () => reconcileLeadership(),
        Math.max(0, leader.expiresAt - Date.now() + 10)
      );
    };

    const startHeartbeat = () => {
      clearTakeoverTimeout();
      stopHeartbeat();
      refreshLeadership();
      sendHeartbeat();
      heartbeatIntervalId = window.setInterval(() => {
        if (!isVisible()) {
          releaseLeadership();
          return;
        }
        const leader = readPresenceLeader();
        if (leader && leader.tabId !== tabId && leader.expiresAt > Date.now()) {
          stopHeartbeat();
          scheduleTakeover(leader);
          return;
        }
        refreshLeadership();
        sendHeartbeat();
      }, PRESENCE_HEARTBEAT_INTERVAL_MS);
    };

    function reconcileLeadership() {
      if (!isVisible()) {
        releaseLeadership();
        return;
      }
      if (!canCoordinate()) {
        startHeartbeat();
        return;
      }
      const leader = readPresenceLeader();
      if (leader && leader.tabId !== tabId && leader.expiresAt > Date.now()) {
        stopHeartbeat();
        scheduleTakeover(leader);
        return;
      }
      startHeartbeat();
    }

    const handleVisibilityChange = () => {
      if (isVisible()) {
        reconcileLeadership();
        return;
      }
      releaseLeadership();
    };

    const handleFocus = () => {
      if (!isVisible()) return;
      if (ownsLeadership()) {
        refreshLeadership();
        sendHeartbeat();
        return;
      }
      reconcileLeadership();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== PRESENCE_LEADER_KEY) return;
      reconcileLeadership();
    };

    const handlePageHide = () => {
      releaseLeadership();
    };

    reconcileLeadership();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      releaseLeadership();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);
}
