import {
  createTeamInvite,
  resendTeamInvite,
  revokeTeamInvite,
  updateTeamInviteRole
} from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function POST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const action = String(payload.action ?? "").trim();

    if (action === "invite") {
      const invites = await createTeamInvite({
        ownerUserId: auth.user.id,
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
      const invites = await resendTeamInvite(auth.user.id, inviteId);
      return jsonOk({ invites });
    }

    if (action === "remove") {
      const invites = await revokeTeamInvite(auth.user.id, inviteId);
      return jsonOk({ invites });
    }

    if (action === "role") {
      const invites = await updateTeamInviteRole(
        auth.user.id,
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
