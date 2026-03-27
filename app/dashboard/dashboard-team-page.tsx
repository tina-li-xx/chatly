"use client";

import { useEffect, useMemo, useState } from "react";
import type { DashboardTeamInvite, DashboardTeamMember } from "@/lib/data/settings";
import { displayNameFromEmail, initialsFromLabel } from "@/lib/user-display";
import { classNames, formatRelativeTime } from "@/lib/utils";
import { DotsVerticalIcon, PlusIcon, XIcon } from "./dashboard-ui";
import {
  DASHBOARD_ICON_BUTTON_CLASS,
  DASHBOARD_INPUT_CLASS,
  DASHBOARD_PRIMARY_BUTTON_CLASS,
  DASHBOARD_SECONDARY_BUTTON_CLASS,
  DASHBOARD_SELECT_CLASS,
  DashboardTopNotice,
  type DashboardNoticeState
} from "./dashboard-controls";

function roleBadgeClass(role: "owner" | "admin" | "member") {
  if (role === "owner") {
    return "bg-purple-100 text-purple-700";
  }

  if (role === "admin") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-slate-100 text-slate-700";
}

function statusBadge(status: "online" | "offline" | "pending") {
  if (status === "online") {
    return {
      dotClass: "bg-green-500",
      textClass: "text-green-600",
      label: "Online"
    };
  }

  if (status === "pending") {
    return {
      dotClass: "bg-amber-500",
      textClass: "text-amber-600",
      label: "Pending"
    };
  }

  return {
    dotClass: "bg-slate-300",
    textClass: "text-slate-500",
    label: "Offline"
  };
}

export function DashboardTeamPage({
  initialMembers,
  initialInvites
}: {
  initialMembers: DashboardTeamMember[];
  initialInvites: DashboardTeamInvite[];
}) {
  const [teamMembers] = useState(initialMembers);
  const [teamInvites, setTeamInvites] = useState(initialInvites);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteDraft, setInviteDraft] = useState({
    email: "",
    role: "member" as "admin" | "member",
    message: ""
  });
  const [openInviteMenuId, setOpenInviteMenuId] = useState<string | null>(null);
  const [inviteActionId, setInviteActionId] = useState<string | null>(null);
  const [isInviteSubmitting, setIsInviteSubmitting] = useState(false);
  const [notice, setNotice] = useState<DashboardNoticeState>(null);

  const teamStats = useMemo(() => {
    const onlineCount = teamMembers.filter((member) => member.status === "online").length;
    const reservedSeats = teamMembers.length + teamInvites.length;

    return {
      owners: teamMembers.length,
      online: onlineCount,
      pending: teamInvites.length,
      reservedSeats
    };
  }, [teamInvites.length, teamMembers]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!openInviteMenuId) {
      return;
    }

    const closeMenu = () => setOpenInviteMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [openInviteMenuId]);

  async function handleInviteSubmit() {
    if (isInviteSubmitting) {
      return;
    }

    setIsInviteSubmitting(true);

    try {
      const response = await fetch("/dashboard/settings/team", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          action: "invite",
          email: inviteDraft.email,
          role: inviteDraft.role,
          message: inviteDraft.message
        })
      });

      const payload = (await response.json()) as
        | { ok: true; invites: DashboardTeamInvite[] }
        | { ok: false; error: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "team-action-failed" : payload.error);
      }

      setTeamInvites(payload.invites);
      setInviteDraft({
        email: "",
        role: "member",
        message: ""
      });
      setInviteModalOpen(false);
      setNotice({
        tone: "success",
        message: "Invite sent"
      });
    } catch (error) {
      setNotice({
        tone: "error",
        message:
          error instanceof Error && error.message === "missing-email"
            ? "Enter an email address before sending an invite."
            : "We couldn't send that invite."
      });
    } finally {
      setIsInviteSubmitting(false);
    }
  }

  async function handleInviteAction(action: "resend" | "remove" | "role", inviteId: string, role?: "admin" | "member") {
    setInviteActionId(inviteId);

    try {
      const response = await fetch("/dashboard/settings/team", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          action,
          inviteId,
          role
        })
      });

      const payload = (await response.json()) as
        | { ok: true; invites: DashboardTeamInvite[] }
        | { ok: false; error: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "team-action-failed" : payload.error);
      }

      setTeamInvites(payload.invites);
      setOpenInviteMenuId(null);
      setNotice({
        tone: "success",
        message:
          action === "remove"
            ? "Invite removed"
            : action === "resend"
              ? "Invite resent"
              : "Role updated"
      });
    } catch (error) {
      setNotice({
        tone: "error",
        message: "We couldn't update that invite."
      });
    } finally {
      setInviteActionId(null);
    }
  }

  return (
    <>
      <DashboardTopNotice notice={notice} />

      <div className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
          Keep the workspace owner and any pending inbox invites organized in one place.
        </section>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
              {teamStats.owners} owner{teamStats.owners === 1 ? "" : "s"}
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
              {teamStats.reservedSeats} reserved seat{teamStats.reservedSeats === 1 ? "" : "s"}
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
              {teamStats.pending} pending invite{teamStats.pending === 1 ? "" : "s"}
            </span>
          </div>

          <button type="button" onClick={() => setInviteModalOpen(true)} className={DASHBOARD_PRIMARY_BUTTON_CLASS}>
            <PlusIcon className="h-4 w-4" />
            Invite member
          </button>
        </div>

        <section className="overflow-visible rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Workspace access</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Role</th>
                  <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Updated</th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => {
                  const status = statusBadge(member.status);

                  return (
                    <tr key={member.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                            {member.avatarDataUrl ? (
                              <img src={member.avatarDataUrl} alt={member.name} className="h-full w-full object-cover" />
                            ) : (
                              member.initials
                            )}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-900">{member.name}</p>
                              {member.isCurrentUser ? <span className="text-xs text-slate-400">(You)</span> : null}
                            </div>
                            <p className="text-[13px] text-slate-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={classNames("rounded-md px-3 py-1 text-[13px] font-medium", roleBadgeClass(member.role))}>
                          Owner
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={classNames("inline-flex items-center gap-2 text-sm", status.textClass)}>
                          <span className={classNames("h-2 w-2 rounded-full", status.dotClass)} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{member.lastActiveLabel}</td>
                      <td className="px-5 py-4" />
                    </tr>
                  );
                })}

                {teamInvites.map((invite) => {
                  const status = statusBadge("pending");
                  const inviteName = displayNameFromEmail(invite.email);
                  const nextRole = invite.role === "admin" ? "member" : "admin";

                  return (
                    <tr key={invite.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                            {initialsFromLabel(inviteName)}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{inviteName}</p>
                            <p className="text-[13px] text-slate-500">{invite.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={classNames("rounded-md px-3 py-1 text-[13px] font-medium", roleBadgeClass(invite.role))}>
                          {invite.role === "admin" ? "Admin" : "Member"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={classNames("inline-flex items-center gap-2 text-sm", status.textClass)}>
                          <span className={classNames("h-2 w-2 rounded-full", status.dotClass)} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatRelativeTime(invite.updatedAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="relative inline-flex" onClick={(event) => event.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setOpenInviteMenuId((current) => (current === invite.id ? null : invite.id))}
                            className={DASHBOARD_ICON_BUTTON_CLASS}
                            aria-label={`Manage invite for ${invite.email}`}
                          >
                            <DotsVerticalIcon className="h-4 w-4" />
                          </button>

                          {openInviteMenuId === invite.id ? (
                            <div className="absolute right-0 top-10 z-20 min-w-[180px] rounded-lg border border-slate-200 bg-white p-1 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                              <button
                                type="button"
                                onClick={() => handleInviteAction("role", invite.id, nextRole)}
                                className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                disabled={inviteActionId === invite.id}
                              >
                                Make {nextRole === "admin" ? "admin" : "member"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInviteAction("resend", invite.id)}
                                className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                disabled={inviteActionId === invite.id}
                              >
                                Resend invite
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInviteAction("remove", invite.id)}
                                className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                                disabled={inviteActionId === invite.id}
                              >
                                Remove from team
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {inviteModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Invite team member</h3>
                <p className="mt-1 text-sm text-slate-500">Add another teammate to the Chatting inbox.</p>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className={DASHBOARD_ICON_BUTTON_CLASS}
                aria-label="Close invite modal"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  value={inviteDraft.email}
                  onChange={(event) => setInviteDraft((current) => ({ ...current, email: event.target.value }))}
                  placeholder="teammate@company.com"
                  className={DASHBOARD_INPUT_CLASS}
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Role</span>
                <select
                  value={inviteDraft.role}
                  onChange={(event) =>
                    setInviteDraft((current) => ({
                      ...current,
                      role: event.target.value === "admin" ? "admin" : "member"
                    }))
                  }
                  className={DASHBOARD_SELECT_CLASS}
                >
                  <option value="admin">Admin - can manage team and settings</option>
                  <option value="member">Member - can chat with visitors</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Message</span>
                <textarea
                  value={inviteDraft.message}
                  onChange={(event) => setInviteDraft((current) => ({ ...current, message: event.target.value }))}
                  placeholder="Add a personal note"
                  className="min-h-[110px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500"
                />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setInviteModalOpen(false)} className={DASHBOARD_SECONDARY_BUTTON_CLASS}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInviteSubmit}
                className={DASHBOARD_PRIMARY_BUTTON_CLASS}
                disabled={isInviteSubmitting}
              >
                {isInviteSubmitting ? "Sending..." : "Send invite"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
