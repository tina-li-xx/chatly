import type { DashboardTeamMember } from "@/lib/data/settings-types";

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export type DashboardTeamPresenceMember = DashboardTeamMember & {
  lastSeenAt: string | null;
};

export type DashboardTeamStatusResponse = {
  teamMembers: DashboardTeamPresenceMember[];
  pendingInviteCount: number;
};

export function isDashboardTeamMemberOnline(lastSeenAt: string | null, now = Date.now()) {
  if (!lastSeenAt) {
    return false;
  }

  return now - new Date(lastSeenAt).getTime() <= ONLINE_WINDOW_MS;
}

export function formatDashboardTeamLastActiveLabel(lastSeenAt: string | null, now = Date.now()) {
  if (!lastSeenAt) {
    return "Never";
  }

  const diffMs = now - new Date(lastSeenAt).getTime();
  const minutes = Math.max(0, Math.round(diffMs / (60 * 1000)));

  if (minutes <= 1) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric"
  }).format(new Date(lastSeenAt));
}
