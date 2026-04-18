import { cache } from "react";
import {
  acceptTeamInviteRecord,
  findTeamInviteAccessRow,
  findWorkspaceAccessRow,
  listWorkspaceAccessRows,
  upsertActiveTeamMembership,
  type TeamInviteAccessRow,
  type WorkspaceAccessRole,
  type WorkspaceAccessRow
} from "@/lib/repositories/workspace-repository";
import { updateUserOnboardingStep } from "@/lib/repositories/onboarding-repository";
import { publishDashboardLive } from "@/lib/live-events";
import { displayNameFromEmail } from "@/lib/user-display";
import {
  getCurrentSessionActiveWorkspaceOwnerId,
  setCurrentSessionActiveWorkspaceOwnerId
} from "@/lib/workspace-session";
const TEAM_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type WorkspaceAccess = {
  ownerUserId: string;
  role: WorkspaceAccessRole;
  ownerEmail: string;
  ownerCreatedAt: string;
  teamName: string;
  teamDomain: string | null;
};

export type UserWorkspace = WorkspaceAccess & {
  isActive: boolean;
};

export type TeamInvitePreview = {
  id: string;
  ownerUserId: string | null;
  email: string;
  role: "admin" | "member";
  message: string;
  teamName: string;
  teamDomain: string | null;
  inviterName: string;
  state: "missing" | "pending" | "expired" | "revoked" | "accepted";
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function inviteTeamName(row: Pick<TeamInviteAccessRow, "team_name" | "owner_email">) {
  return row.team_name || `${displayNameFromEmail(row.owner_email)} Team`;
}

function isInviteExpired(updatedAt: string) {
  return Date.now() - new Date(updatedAt).getTime() > TEAM_INVITE_TTL_MS;
}

function toWorkspaceAccess(row: WorkspaceAccessRow): WorkspaceAccess {
  return {
    ownerUserId: row.owner_user_id,
    role: row.role,
    ownerEmail: row.owner_email,
    ownerCreatedAt: row.owner_created_at,
    teamName: inviteTeamName(row),
    teamDomain: row.team_domain
  };
}

async function resolveWorkspaceAccess(userId: string, ownerUserId?: string | null) {
  const preferred = ownerUserId ? await findWorkspaceAccessRow(userId, ownerUserId) : null;
  const fallback = preferred ?? (await findWorkspaceAccessRow(userId));

  if (!fallback) {
    throw new Error("USER_NOT_FOUND");
  }

  return toWorkspaceAccess(fallback);
}

export const getWorkspaceAccess = cache(async (
  userId: string,
  preferredOwnerUserId?: string
): Promise<WorkspaceAccess> => {
  const sessionOwnerUserId = preferredOwnerUserId ?? (await getCurrentSessionActiveWorkspaceOwnerId());
  const workspace = await resolveWorkspaceAccess(userId, sessionOwnerUserId);

  if (sessionOwnerUserId !== workspace.ownerUserId) {
    await setCurrentSessionActiveWorkspaceOwnerId(workspace.ownerUserId);
  }

  return workspace;
});

export async function listUserWorkspaces(userId: string): Promise<UserWorkspace[]> {
  const [activeWorkspace, rows] = await Promise.all([
    getWorkspaceAccess(userId),
    listWorkspaceAccessRows(userId),
  ]);

  return rows.map((row) => ({
    ...toWorkspaceAccess(row),
    isActive: row.owner_user_id === activeWorkspace.ownerUserId
  }));
}

export async function switchCurrentWorkspace(input: {
  userId: string;
  ownerUserId: string;
}) {
  const workspace = await resolveWorkspaceAccess(input.userId, input.ownerUserId);
  await setCurrentSessionActiveWorkspaceOwnerId(workspace.ownerUserId);
  return workspace;
}

function inviteStateForRow(row: TeamInviteAccessRow | null): TeamInvitePreview["state"] {
  if (!row) {
    return "missing";
  }

  if (row.status === "revoked") {
    return "revoked";
  }

  if (row.status === "accepted") {
    return "accepted";
  }

  return isInviteExpired(row.updated_at) ? "expired" : "pending";
}

function toInvitePreview(row: TeamInviteAccessRow | null): TeamInvitePreview {
  if (!row) {
    return {
      id: "",
      ownerUserId: null,
      email: "",
      role: "member",
      message: "",
      teamName: "Workspace",
      teamDomain: null,
      inviterName: "Chatting",
      state: "missing"
    };
  }

  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    email: row.email,
    role: row.role,
    message: row.message,
    teamName: inviteTeamName(row),
    teamDomain: row.team_domain,
    inviterName: [row.owner_first_name, row.owner_last_name].filter(Boolean).join(" ").trim() || displayNameFromEmail(row.owner_email),
    state: inviteStateForRow(row)
  };
}

function assertPendingInvite(row: TeamInviteAccessRow | null, email?: string) {
  if (!row) throw new Error("INVITE_NOT_FOUND");
  if (row.status === "revoked") throw new Error("INVITE_REVOKED");
  if (row.status === "accepted") throw new Error("INVITE_ALREADY_ACCEPTED");
  if (isInviteExpired(row.updated_at)) throw new Error("INVITE_EXPIRED");
  if (email && normalizeEmail(row.email) !== normalizeEmail(email)) throw new Error("INVITE_EMAIL_MISMATCH");
  return row;
}

export async function getTeamInvitePreview(inviteId: string): Promise<TeamInvitePreview> {
  return toInvitePreview(await findTeamInviteAccessRow(inviteId));
}

export async function validateTeamInvite(inviteId: string, email?: string) {
  return assertPendingInvite(await findTeamInviteAccessRow(inviteId), email);
}

export async function acceptTeamInvite(input: {
  inviteId: string;
  userId: string;
  email: string;
}) {
  const row = await findTeamInviteAccessRow(input.inviteId);
  if (row?.status === "accepted" && row.accepted_by_user_id === input.userId) {
    await updateUserOnboardingStep(input.userId, "done");
    return { ownerUserId: row.owner_user_id, alreadyAccepted: true };
  }
  const invite = assertPendingInvite(row, input.email);
  if (invite.owner_user_id === input.userId) throw new Error("INVITE_OWNER_CONFLICT");
  await upsertActiveTeamMembership({
    ownerUserId: invite.owner_user_id,
    memberUserId: input.userId,
    role: invite.role
  });
  await acceptTeamInviteRecord(invite.id, input.userId);
  await updateUserOnboardingStep(input.userId, "done");
  publishDashboardLive(invite.owner_user_id, {
    type: "team.members.updated",
    updatedAt: new Date().toISOString()
  });
  return { ownerUserId: invite.owner_user_id, alreadyAccepted: false };
}
