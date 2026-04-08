import { randomUUID } from "node:crypto";
import { sendTeamInvitationEmail } from "@/lib/chatting-transactional-email-senders";
import type { DashboardTeamInvite } from "@/lib/data/settings-types";
import { getPublicAppUrl } from "@/lib/env";
import { maybeSendTeamExpansionEmail } from "@/lib/growth-outreach";
import {
  findEmailTemplateSettingsRow,
  insertTeamInviteRecord,
  listPendingTeamInviteRows,
  revokePendingTeamInvite,
  touchPendingTeamInvite,
  updatePendingTeamInviteRole
} from "@/lib/repositories/settings-repository";
import { countActiveTeamMembershipRows } from "@/lib/repositories/workspace-repository";
import { displayNameFromEmail } from "@/lib/user-display";
import { listSitesForUser } from "./sites";

function buildInviteUrl(inviteId: string, email: string) {
  const url = new URL("/invite", getPublicAppUrl());
  url.searchParams.set("invite", inviteId);
  url.searchParams.set("email", email);
  return url.toString();
}

async function sendPendingInviteEmail(ownerUserId: string, invite: DashboardTeamInvite) {
  const [profileRow, sites, activeMembershipCount] = await Promise.all([
    findEmailTemplateSettingsRow(ownerUserId),
    listSitesForUser(ownerUserId),
    countActiveTeamMembershipRows(ownerUserId)
  ]);
  if (!profileRow) {
    return;
  }

  const inviterName =
    [profileRow.first_name, profileRow.last_name].filter(Boolean).join(" ").trim() ||
    displayNameFromEmail(profileRow.email);
  const primarySite = sites[0];

  await sendTeamInvitationEmail({
    to: invite.email,
    inviterName,
    teamName: primarySite?.name || `${displayNameFromEmail(profileRow.email)} Team`,
    teamWebsite: primarySite?.domain ?? null,
    memberCount: 1 + activeMembershipCount,
    inviteUrl: buildInviteUrl(invite.id, invite.email)
  });
}

export async function listTeamInvites(ownerUserId: string) {
  const inviteRows = await listPendingTeamInviteRows(ownerUserId);

  return inviteRows.map((invite) => ({
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: "pending" as const,
    message: invite.message,
    createdAt: invite.created_at,
    updatedAt: invite.updated_at
  }));
}

export async function createTeamInvite(input: {
  ownerUserId: string;
  email: string;
  role: "admin" | "member";
  message?: string;
}) {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    throw new Error("MISSING_EMAIL");
  }

  await insertTeamInviteRecord({
    inviteId: randomUUID(),
    ownerUserId: input.ownerUserId,
    email,
    role: input.role,
    message: input.message?.trim() || ""
  });
  await maybeSendTeamExpansionEmail(input.ownerUserId);

  const invites = await listTeamInvites(input.ownerUserId);
  const newestInvite = invites.find((invite) => invite.email === email) ?? invites[0];
  if (newestInvite) {
    try {
      await sendPendingInviteEmail(input.ownerUserId, newestInvite);
    } catch (error) {
      console.error("team invite email failed", error);
    }
  }

  return invites;
}

export async function resendTeamInvite(ownerUserId: string, inviteId: string) {
  await touchPendingTeamInvite(ownerUserId, inviteId);
  const invites = await listTeamInvites(ownerUserId);
  const invite = invites.find((entry) => entry.id === inviteId);

  if (invite) {
    try {
      await sendPendingInviteEmail(ownerUserId, invite);
    } catch (error) {
      console.error("team invite resend email failed", error);
    }
  }

  return invites;
}

export async function updateTeamInviteRole(
  ownerUserId: string,
  inviteId: string,
  role: "admin" | "member"
) {
  await updatePendingTeamInviteRole(ownerUserId, inviteId, role);
  return listTeamInvites(ownerUserId);
}

export async function revokeTeamInvite(ownerUserId: string, inviteId: string) {
  await revokePendingTeamInvite(ownerUserId, inviteId);
  return listTeamInvites(ownerUserId);
}
