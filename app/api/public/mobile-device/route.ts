import { getSiteByPublicId, registerPublicMobilePushDevice, unregisterPublicMobilePushDevice } from "@/lib/services";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

function handleOPTIONS() {
  return publicNoContentResponse();
}

async function handlePOST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const siteId = String(body.siteId ?? "").trim();
    const sessionId = String(body.sessionId ?? "").trim();
    const pushToken = String(body.pushToken ?? "").trim();
    const provider = body.provider === "apns" ? "apns" : body.provider === "expo" || body.provider == null ? "expo" : null;
    const conversationId =
      typeof body.conversationId === "string" && body.conversationId.trim()
        ? body.conversationId.trim()
        : null;
    const environment = body.environment === "sandbox" || body.environment === "production" ? body.environment : null;
    const bundleId = typeof body.bundleId === "string" ? body.bundleId.trim() : null;

    if (!siteId || !sessionId || !pushToken) {
      return publicJsonResponse({ error: "siteId, sessionId, and pushToken are required." }, { status: 400 });
    }
    if (!provider) {
      return publicJsonResponse({ error: "provider must be expo or apns." }, { status: 400 });
    }
    if (provider === "apns" && (!bundleId || !environment)) {
      return publicJsonResponse({ error: "APNs registrations require bundleId and environment." }, { status: 400 });
    }
    if (!(await getSiteByPublicId(siteId))) {
      return publicJsonResponse({ error: "Site not found." }, { status: 404 });
    }

    const result = await registerPublicMobilePushDevice({
      siteId,
      sessionId,
      conversationId,
      pushToken,
      provider,
      platform: typeof body.platform === "string" ? body.platform : null,
      appId: typeof body.appId === "string" ? body.appId : null,
      bundleId,
      environment
    });

    if (!result.ok) {
      return publicJsonResponse({ error: "Conversation not found for this visitor session." }, { status: 404 });
    }

    return publicJsonResponse({ ok: true });
  } catch (error) {
    console.error("public mobile device register error", error);
    return publicJsonResponse({ error: "Unable to register mobile device." }, { status: 500 });
  }
}

async function handleDELETE(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const siteId = String(body.siteId ?? "").trim();
    const sessionId = String(body.sessionId ?? "").trim();
    const pushToken = String(body.pushToken ?? "").trim();

    if (!siteId || !sessionId || !pushToken) {
      return publicJsonResponse({ error: "siteId, sessionId, and pushToken are required." }, { status: 400 });
    }

    await unregisterPublicMobilePushDevice({ siteId, sessionId, pushToken });
    return publicJsonResponse({ ok: true });
  } catch (error) {
    console.error("public mobile device unregister error", error);
    return publicJsonResponse({ error: "Unable to unregister mobile device." }, { status: 500 });
  }
}

export const OPTIONS = withRouteErrorAlerting(handleOPTIONS, "app/api/public/mobile-device/route.ts:OPTIONS");
export const POST = withRouteErrorAlerting(handlePOST, "app/api/public/mobile-device/route.ts:POST");
export const DELETE = withRouteErrorAlerting(handleDELETE, "app/api/public/mobile-device/route.ts:DELETE");
