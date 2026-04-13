import { resetPasswordWithToken } from "@/lib/auth-password-reset";
import { jsonError, jsonOk } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = String(body?.token ?? "").trim();
  const password = String(body?.password ?? "").trim();
  const confirmPassword = String(body?.confirmPassword ?? "").trim();

  if (!token) {
    return jsonError("invalid-reset-token", 400);
  }

  if (!password) {
    return jsonError("missing-password", 400);
  }

  if (password !== confirmPassword) {
    return jsonError("password-mismatch", 400);
  }

  try {
    await resetPasswordWithToken(token, password);
    return jsonOk({ reset: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_RESET_TOKEN") {
        return jsonError("invalid-reset-token", 400);
      }
      if (error.message === "WEAK_PASSWORD") {
        return jsonError("weak-password", 400);
      }
    }

    throw error;
  }
}

export const POST = withRouteErrorAlerting(
  handlePOST,
  "app/api/mobile/password/reset/route.ts:POST",
);
