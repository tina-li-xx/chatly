"use client";

import {
  formatDashboardTeamLastActiveLabel,
  isDashboardTeamMemberOnline,
  type DashboardTeamStatusResponse
} from "@/lib/dashboard-team-status";
import { DashboardLink } from "./dashboard-shell";
import { useDashboardHomeTeamStatus } from "./use-dashboard-home-team-status";

function statusDotClass(online: boolean) {
  return online ? "bg-green-500" : "bg-slate-300";
}

function memberStatusLabel(lastSeenAt: string | null, now: number) {
  if (isDashboardTeamMemberOnline(lastSeenAt, now)) {
    return "Online now";
  }

  const lastActiveLabel = formatDashboardTeamLastActiveLabel(lastSeenAt, now);
  return lastActiveLabel === "Never" ? "Never active" : `Last active ${lastActiveLabel}`;
}

function visibleMembers(members: DashboardTeamStatusResponse["teamMembers"], now: number) {
  const currentUser = members.find((member) => member.isCurrentUser);
  const onlineMembers = members.filter(
    (member) => !member.isCurrentUser && isDashboardTeamMemberOnline(member.lastSeenAt, now)
  );
  const remainingMembers = members.filter(
    (member) => !member.isCurrentUser && !isDashboardTeamMemberOnline(member.lastSeenAt, now)
  );

  return [currentUser, ...onlineMembers, ...remainingMembers]
    .filter((member): member is DashboardTeamStatusResponse["teamMembers"][number] => Boolean(member))
    .slice(0, 3);
}

function teammateCountLabel(count: number) {
  return `${count} teammate${count === 1 ? "" : "s"}`;
}

export function DashboardHomeTeamCard({
  members,
  pendingInviteCount
}: {
  members: DashboardTeamStatusResponse["teamMembers"];
  pendingInviteCount: number;
}) {
  const { teamStatus, now } = useDashboardHomeTeamStatus({
    teamMembers: members,
    pendingInviteCount
  });
  const onlineCount = teamStatus.teamMembers.filter((member) =>
    isDashboardTeamMemberOnline(member.lastSeenAt, now)
  ).length;
  const displayedMembers = visibleMembers(teamStatus.teamMembers, now);
  const hiddenMemberCount = Math.max(0, teamStatus.teamMembers.length - displayedMembers.length);
  const footerLabel =
    hiddenMemberCount > 0
      ? `${hiddenMemberCount} more ${hiddenMemberCount === 1 ? "person" : "people"} on the workspace`
      : teammateCountLabel(teamStatus.teamMembers.length);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Team status</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {onlineCount} online
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {displayedMembers.map((member) => (
          <DashboardLink
            key={member.id}
            href="/dashboard/team"
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50"
          >
            <div className="relative">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                {member.avatarDataUrl ? (
                  <img src={member.avatarDataUrl} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  member.initials
                )}
              </span>
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${statusDotClass(
                  isDashboardTeamMemberOnline(member.lastSeenAt, now)
                )}`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-slate-900">{member.name}</p>
                {member.isCurrentUser ? (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">You</span>
                ) : null}
              </div>
              <p className="text-xs text-slate-500">{memberStatusLabel(member.lastSeenAt, now)}</p>
            </div>
          </DashboardLink>
        ))}

        {teamStatus.pendingInviteCount > 0 ? (
          <DashboardLink
            href="/dashboard/team"
            className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50"
          >
            <div className="relative">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-sm font-semibold text-amber-700">
                +
              </span>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {teamStatus.pendingInviteCount} pending invite{teamStatus.pendingInviteCount === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-slate-500">Waiting for teammates to accept access</p>
            </div>
          </DashboardLink>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">{footerLabel}</p>
        <DashboardLink href="/dashboard/team" className="text-sm font-medium text-blue-600 transition hover:text-blue-700">
          Invite teammate
        </DashboardLink>
      </div>
    </article>
  );
}
