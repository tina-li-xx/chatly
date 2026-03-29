import { cache } from "react";
import {
  findTeamInviteAccessRow,
  findWorkspaceAccessRow,
  hasOwnedWorkspaceRecord,
  upsertActiveTeamMembership,
  acceptTeamInviteRecord,
  type TeamInviteAccessRow,
  type WorkspaceAccessRole
} from "@/lib/repositories/workspace-repository";
import { updateUserOnboardingStep } from "@/lib/repositories/onboarding-repository";
import { displayNameFromEmail } from "@/lib/user-display";

const TEAM_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type WorkspaceAccess = {
  ownerUserId: string;
  role: WorkspaceAccessRole;
  ownerEmail: string;
  ownerCreatedAt: string;
};

export type TeamInvitePreview = {
  id: string;
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

function inviteTeamName(row: TeamInviteAccessRow) {
  return row.team_name || `${displayNameFromEmail(row.owner_email)} Team`;
}

function inviteInviterName(row: TeamInviteAccessRow) {
  const fullName = [row.owner_first_name, row.owner_last_name].filter(Boolean).join(" ").trim();
  return fullName || displayNameFromEmail(row.owner_email);
}

function isInviteExpired(updatedAt: string) {
  return Date.now() - new Date(updatedAt).getTime() > TEAM_INVITE_TTL_MS;
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
      email: "",
      role: "member",
      message: "",
      teamName: "Workspace",
      teamDomain: null,
      inviterName: "Chatly",
      state: "missing"
    };
  }

  return {
    id: row.id,
    email: row.email,
    role: row.role,
    message: row.message,
    teamName: inviteTeamName(row),
    teamDomain: row.team_domain,
    inviterName: inviteInviterName(row),
    state: inviteStateForRow(row)
  };
}

function assertPendingInvite(row: TeamInviteAccessRow | null, email?: string) {
  if (!row) {
    throw new Error("INVITE_NOT_FOUND");
  }

  if (row.status === "revoked") {
    throw new Error("INVITE_REVOKED");
  }

  if (row.status === "accepted") {
    throw new Error("INVITE_ALREADY_ACCEPTED");
  }

  if (isInviteExpired(row.updated_at)) {
    throw new Error("INVITE_EXPIRED");
  }

  if (email && normalizeEmail(row.email) !== normalizeEmail(email)) {
    throw new Error("INVITE_EMAIL_MISMATCH");
  }

  return row;
}

export const getWorkspaceAccess = cache(async (userId: string): Promise<WorkspaceAccess> => {
  const row = await findWorkspaceAccessRow(userId);
  if (!row) {
    throw new Error("USER_NOT_FOUND");
  }

  return {
    ownerUserId: row.owner_user_id,
    role: row.role,
    ownerEmail: row.owner_email,
    ownerCreatedAt: row.owner_created_at
  };
});

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
    return {
      ownerUserId: row.owner_user_id,
      alreadyAccepted: true
    };
  }

  const invite = assertPendingInvite(row, input.email);

  if (invite.owner_user_id === input.userId) {
    throw new Error("INVITE_OWNER_CONFLICT");
  }

  if (await hasOwnedWorkspaceRecord(input.userId)) {
    throw new Error("INVITE_WORKSPACE_CONFLICT");
  }

  await upsertActiveTeamMembership({
    ownerUserId: invite.owner_user_id,
    memberUserId: input.userId,
    role: invite.role
  });
  await acceptTeamInviteRecord(invite.id, input.userId);
  await updateUserOnboardingStep(input.userId, "done");

  return {
    ownerUserId: invite.owner_user_id,
    alreadyAccepted: false
  };
}
