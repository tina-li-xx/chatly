import { updateMobilePassword } from "@/lib/services/mobile";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  if (
    typeof body?.currentPassword !== "string" ||
    typeof body?.newPassword !== "string" ||
    typeof body?.confirmPassword !== "string"
  ) {
    return jsonError("missing-fields", 400);
  }

  try {
    await updateMobilePassword(auth.user.id, body);
    return jsonOk({ updated: true });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "PASSWORD_CONFIRM":
          return jsonError("password-mismatch", 400);
        case "MISSING_CURRENT_PASSWORD":
          return jsonError("missing-current-password", 400);
        case "MISSING_PASSWORD":
          return jsonError("missing-password", 400);
        case "WEAK_PASSWORD":
          return jsonError("weak-password", 400);
        case "INVALID_CURRENT_PASSWORD":
          return jsonError("invalid-current-password", 400);
      }
    }

    throw error;
  }
}

export const POST = withRouteErrorAlerting(
  handlePOST,
  "app/api/mobile/password/change/route.ts:POST"
);
