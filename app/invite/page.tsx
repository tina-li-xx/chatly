import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
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

  return "Choose how you'd like to continue.";
}

type InviteLinkQuery = {
  invite: string;
  email?: string;
};

function buildInviteAuthHref(pathname: "/login" | "/signup", query: InviteLinkQuery | null) {
  return query ? { pathname, query } : pathname;
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
  const user = await getCurrentUser();
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

  const inviteLinkQuery = inviteId
    ? {
        invite: inviteId,
        ...(invite.email ? { email: invite.email } : {})
      }
    : null;

  return (
    <AuthPageShell
      heroTitle="Join your team on Chatting"
      heroDescription="Accept your workspace access and jump straight into the shared inbox."
      stats={[
        { value: invite.role === "admin" ? "Admin" : "Member", label: "Access" },
        { value: invite.teamName, label: "Workspace" },
        { value: invite.teamDomain || "Inbox", label: "Team site" }
      ]}
    >
      <div className="space-y-6">
        <AuthFormIntro
          title={`You're invited to join ${invite.teamName}`}
          caption={`${invite.inviterName} invited ${invite.email || "you"} to this workspace.`}
        />

        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900">{inviteStateCopy(invite.state)}</p>
          {invite.message ? <p className="mt-2 text-slate-600">"{invite.message}"</p> : null}
        </div>

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
