"use client";

import { useEffect, useState } from "react";
import type { DashboardTeamStatusResponse } from "@/lib/dashboard-team-status";
import { subscribeDashboardLiveClient } from "./dashboard-live-client";

const TEAM_STATUS_REFRESH_INTERVAL_MS = 30000;

async function fetchDashboardTeamStatus() {
  const response = await fetch("/dashboard/team-status", {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("team-status-refresh-failed");
  }

  const payload = (await response.json()) as
    | ({ ok: true } & DashboardTeamStatusResponse)
    | { ok: false };

  if (!payload.ok) {
    throw new Error("team-status-refresh-failed");
  }

  return {
    teamMembers: payload.teamMembers,
    pendingInviteCount: payload.pendingInviteCount
  };
}

export function useDashboardHomeTeamStatus(initialState: DashboardTeamStatusResponse) {
  const [teamStatus, setTeamStatus] = useState(initialState);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, TEAM_STATUS_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let hasConnected = false;

    const refreshTeamStatus = async () => {
      try {
        const nextState = await fetchDashboardTeamStatus();
        if (!cancelled) {
          setTeamStatus(nextState);
        }
      } catch {
        // Keep the last known roster snapshot until the next live event or refresh succeeds.
      }
    };

    const unsubscribe = subscribeDashboardLiveClient({
      onOpen() {
        if (!hasConnected) {
          hasConnected = true;
          return;
        }

        void refreshTeamStatus();
      },
      onMessage(event) {
        if (event.type === "team.presence.updated") {
          setTeamStatus((current) => ({
            ...current,
            teamMembers: current.teamMembers.map((member) =>
              member.id === event.userId
                ? {
                    ...member,
                    lastSeenAt: event.updatedAt
                  }
                : member
            )
          }));
          setNow(Date.now());
          return;
        }

        if (event.type === "team.members.updated") {
          void refreshTeamStatus();
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return {
    teamStatus,
    now
  };
}
