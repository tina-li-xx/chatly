import { updateEmailUnsubscribePreferencesByToken } from "@/lib/email-unsubscribe";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

function handleOPTIONS() {
  return publicNoContentResponse();
}

async function handlePOST(request: Request) {
  try {
    const payload = (await request.json()) as {
      token?: string;
      subscribed?: boolean;
    };

    if (typeof payload.subscribed !== "boolean") {
      return publicJsonResponse({ error: "invalid_unsubscribe_request" }, { status: 400 });
    }

    const result = await updateEmailUnsubscribePreferencesByToken({
      token: String(payload.token ?? ""),
      subscribed: payload.subscribed
    });

    return publicJsonResponse({
      ok: true,
      email: result.email,
      subscribed: result.subscribed
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_EMAIL_UNSUBSCRIBE_TOKEN"
    ) {
      return publicJsonResponse({ error: "invalid_unsubscribe_token" }, { status: 404 });
    }

    return publicJsonResponse({ error: "email_unsubscribe_failed" }, { status: 500 });
  }
}

export const OPTIONS = withRouteErrorAlerting(handleOPTIONS, "app/api/public/email/unsubscribe/route.ts:OPTIONS");
export const POST = withRouteErrorAlerting(handlePOST, "app/api/public/email/unsubscribe/route.ts:POST");
