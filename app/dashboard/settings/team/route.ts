import {
  createTeamInvite,
  resendTeamInvite,
  revokeTeamInvite,
  updateTeamInviteRole
} from "@/lib/services";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  if (auth.user.workspaceRole === "member") {
    return jsonError("forbidden", 403);
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const action = String(payload.action ?? "").trim();

    if (action === "invite") {
      const invites = await createTeamInvite({
        ownerUserId: auth.user.workspaceOwnerId,
        email: String(payload.email ?? ""),
        role: payload.role === "admin" ? "admin" : "member",
        message: String(payload.message ?? "")
      });
      return jsonOk({ invites });
    }

    const inviteId = String(payload.inviteId ?? "").trim();
    if (!inviteId) {
      return jsonError("invite-id-missing", 400);
    }

    if (action === "resend") {
      const invites = await resendTeamInvite(auth.user.workspaceOwnerId, inviteId);
      return jsonOk({ invites });
    }

    if (action === "remove") {
      const invites = await revokeTeamInvite(auth.user.workspaceOwnerId, inviteId);
      return jsonOk({ invites });
    }

    if (action === "role") {
      const invites = await updateTeamInviteRole(
        auth.user.workspaceOwnerId,
        inviteId,
        payload.role === "admin" ? "admin" : "member"
      );
      return jsonOk({ invites });
    }

    return jsonError("unknown-action", 400);
  } catch (error) {
    if (error instanceof Error && error.message === "MISSING_EMAIL") {
      return jsonError("missing-email", 400);
    }

    return jsonError("team-action-failed", 500);
  }
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/settings/team/route.ts:POST");
