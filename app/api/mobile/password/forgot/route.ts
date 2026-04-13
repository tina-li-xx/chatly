import { requestPasswordReset } from "@/lib/auth-password-reset";
import { jsonError, jsonOk } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();

  if (!email) {
    return jsonError("missing-email", 400);
  }

  await requestPasswordReset(email);
  return jsonOk({ email, sent: true });
}

export const POST = withRouteErrorAlerting(
  handlePOST,
  "app/api/mobile/password/forgot/route.ts:POST",
);
