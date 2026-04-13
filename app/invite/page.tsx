import type { Route } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { findExistingUserIdByEmail } from "@/lib/repositories/auth-repository";
import { AuthPageShell, AuthFormIntro } from "../login/auth-shell";
import { FormButtonLink } from "../ui/form-controls";
import { acceptTeamInvite, getTeamInvitePreview, switchCurrentWorkspace } from "@/lib/workspace-access";

type InvitePageProps = {
  searchParams: Promise<{
    invite?: string;
    email?: string;
  }>;
};

function inviteStateCopy(state: Awaited<ReturnType<typeof getTeamInvitePreview>>["state"]) {
  if (state === "accepted") {
    return "This invite has already been accepted.";
  }

  if (state === "expired") {
    return "This invite has expired. Ask the workspace owner to resend it.";
  }

  if (state === "revoked") {
    return "This invite is no longer active.";
  }

  if (state === "missing") {
    return "We couldn't find that invite.";
  }

  return null;
}

type InviteLinkQuery = {
  invite: string;
  email?: string;
};

function buildInviteAuthHref(pathname: "/login" | "/signup", query: InviteLinkQuery | null): Route {
  if (!query) {
    return pathname as Route;
  }

  const params = new URLSearchParams({
    invite: query.invite,
    ...(query.email ? { email: query.email } : {})
  });
  return `${pathname}?${params.toString()}` as Route;
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const params = await searchParams;
  const inviteId = String(params.invite ?? "").trim();
  const invite = inviteId
    ? await getTeamInvitePreview(inviteId)
    : {
        id: "",
        ownerUserId: null,
        email: "",
        role: "member" as const,
        message: "",
        teamName: "Workspace",
        teamDomain: null,
        inviterName: "Chatting",
        state: "missing" as const
      };
  const inviteLinkQuery = inviteId
    ? {
        invite: inviteId,
        ...(invite.email ? { email: invite.email } : {})
      }
    : null;
  const user = await getCurrentUser();
  const inviteHasExistingAccount =
    invite.state === "pending" && invite.email
      ? Boolean(await findExistingUserIdByEmail(invite.email.trim().toLowerCase()))
      : false;
  let autoAcceptError: string | null = null;

  if (user && invite.state === "pending" && invite.email.toLowerCase() === user.email.toLowerCase()) {
    try {
      const acceptedInvite = await acceptTeamInvite({
        inviteId,
        userId: user.id,
        email: user.email
      });
      await switchCurrentWorkspace({
        userId: user.id,
        ownerUserId: acceptedInvite.ownerUserId
      });
      redirect("/dashboard");
    } catch (error) {
      autoAcceptError = "We couldn't accept this invite automatically.";
    }
  }

  if (!user && invite.state === "pending" && inviteHasExistingAccount) {
    redirect(buildInviteAuthHref("/login", inviteLinkQuery));
  }

  if (user && invite.state === "accepted" && invite.email.toLowerCase() === user.email.toLowerCase()) {
    if (invite.ownerUserId) {
      try {
        await switchCurrentWorkspace({
          userId: user.id,
          ownerUserId: invite.ownerUserId
        });
      } catch {
        // If the workspace access has changed since the invite was accepted, fall back to the user's current team.
      }
    }
    redirect("/dashboard");
  }

  return (
    <AuthPageShell
      heroTitle="Join your team on Chatting"
      stats={[
        { value: invite.role === "admin" ? "Admin" : "Member", label: "Access" },
        { value: invite.teamName, label: "Workspace" }
      ]}
    >
      <div className="space-y-6">
        <AuthFormIntro
          title={`You're invited to join ${invite.teamName}`}
          caption={`${invite.inviterName} invited ${invite.email || "you"} to this workspace.`}
        />

        {inviteStateCopy(invite.state) || invite.message ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
            {inviteStateCopy(invite.state) ? (
              <p className="font-medium text-slate-900">{inviteStateCopy(invite.state)}</p>
            ) : null}
            {invite.message ? <p className={inviteStateCopy(invite.state) ? "mt-2 text-slate-600" : "text-slate-600"}>"{invite.message}"</p> : null}
          </div>
        ) : null}

        {autoAcceptError ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            {autoAcceptError}
          </div>
        ) : null}

        {user && invite.email && invite.email.toLowerCase() !== user.email.toLowerCase() ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            You're signed in as {user.email}, but this invite is for {invite.email}. Sign out and continue with the invited email.
          </div>
        ) : null}

        {invite.state === "pending" ? (
          inviteHasExistingAccount ? (
            <FormButtonLink
              href={buildInviteAuthHref("/login", inviteLinkQuery)}
              fullWidth
            >
              Sign in
            </FormButtonLink>
          ) : (
            <div className="flex flex-col gap-3">
              <FormButtonLink
                href={buildInviteAuthHref("/signup", inviteLinkQuery)}
                fullWidth
              >
                Create account
              </FormButtonLink>
              <FormButtonLink
                href={buildInviteAuthHref("/login", inviteLinkQuery)}
                variant="secondary"
                fullWidth
              >
                Sign in
              </FormButtonLink>
            </div>
          )
        ) : (
          <FormButtonLink
            href={
              invite.state === "accepted" && inviteLinkQuery
                ? buildInviteAuthHref("/login", inviteLinkQuery)
                : "/login"
            }
            variant="secondary"
            fullWidth
          >
            Back to sign in
          </FormButtonLink>
        )}
      </div>
    </AuthPageShell>
  );
}
