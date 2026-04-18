import type { DashboardTeamMember } from "@/lib/data/settings-types";
import type { DashboardTeamPresenceMember } from "@/lib/dashboard-team-status";
import { buildDashboardTeamMember } from "@/lib/data/settings-helpers";
import { findDashboardSettingsRow } from "@/lib/repositories/settings-repository";
import { listActiveTeamMemberRows } from "@/lib/repositories/workspace-repository";
import { getWorkspaceAccess } from "@/lib/workspace-access";

function withPresence(member: DashboardTeamMember, lastSeenAt: string | null): DashboardTeamPresenceMember {
  return {
    ...member,
    lastSeenAt
  };
}

export async function listDashboardTeamPresenceMembersForWorkspace(
  userId: string,
  ownerUserId: string
): Promise<DashboardTeamPresenceMember[]> {
  const [ownerRow, activeTeamRows] = await Promise.all([
    findDashboardSettingsRow(ownerUserId),
    listActiveTeamMemberRows(ownerUserId)
  ]);

  if (!ownerRow) {
    throw new Error("Workspace owner not found.");
  }

  return [
    withPresence(
      buildDashboardTeamMember({
        userId: ownerRow.user_id,
        email: ownerRow.email,
        firstName: ownerRow.first_name,
        lastName: ownerRow.last_name,
        role: "owner",
        lastSeenAt: ownerRow.last_seen_at,
        isCurrentUser: ownerRow.user_id === userId,
        avatarDataUrl: ownerRow.avatar_data_url
      }),
      ownerRow.last_seen_at
    ),
    ...activeTeamRows.map((member) =>
      withPresence(
        buildDashboardTeamMember({
          userId: member.user_id,
          email: member.email,
          firstName: member.first_name,
          lastName: member.last_name,
          role: member.role,
          lastSeenAt: member.last_seen_at,
          isCurrentUser: member.user_id === userId,
          avatarDataUrl: member.avatar_data_url
        }),
        member.last_seen_at
      )
    )
  ];
}

export async function listDashboardTeamMembersForWorkspace(
  userId: string,
  ownerUserId: string
): Promise<DashboardTeamMember[]> {
  const members = await listDashboardTeamPresenceMembersForWorkspace(userId, ownerUserId);
  return members.map(({ lastSeenAt: _lastSeenAt, ...member }) => member);
}

export async function listDashboardTeamMembers(userId: string): Promise<DashboardTeamMember[]> {
  const workspace = await getWorkspaceAccess(userId);
  return listDashboardTeamMembersForWorkspace(userId, workspace.ownerUserId);
}
