import { registerTeamMobileDevice, unregisterTeamMobileDevice } from "@/lib/services/mobile";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const pushToken = String(body?.pushToken ?? "").trim();
  const provider =
    body?.provider === "apns"
      ? "apns"
      : body?.provider === "fcm"
        ? "fcm"
        : body?.provider === "expo" || body?.provider == null
          ? "expo"
          : null;

  if (!pushToken) {
    return jsonError("missing-fields", 400);
  }
  if (!provider) {
    return jsonError("invalid-provider", 400);
  }
  if (
    provider === "apns" &&
    (
      typeof body?.bundleId !== "string" ||
      (body?.environment !== "sandbox" && body?.environment !== "production")
    )
  ) {
    return jsonError("missing-fields", 400);
  }

  await registerTeamMobileDevice({
    userId: auth.user.id,
    pushToken,
    provider,
    platform: typeof body?.platform === "string" ? body.platform : null,
    appId: typeof body?.appId === "string" ? body.appId : null,
    bundleId: typeof body?.bundleId === "string" ? body.bundleId : null,
    environment:
      body?.environment === "sandbox" || body?.environment === "production"
        ? body.environment
        : null
  });

  return jsonOk({ registered: true });
}

async function handleDELETE(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const pushToken = String(body?.pushToken ?? "").trim();

  if (!pushToken) {
    return jsonError("missing-fields", 400);
  }

  await unregisterTeamMobileDevice({
    userId: auth.user.id,
    pushToken
  });

  return jsonOk({ revoked: true });
}

export const POST = withRouteErrorAlerting(handlePOST, "app/api/mobile/device/route.ts:POST");
export const DELETE = withRouteErrorAlerting(handleDELETE, "app/api/mobile/device/route.ts:DELETE");
