import { subscribeToNewsletter } from "@/lib/services";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

function handleOPTIONS() {
  return publicNoContentResponse();
}

async function handlePOST(request: Request) {
  try {
    const payload = (await request.json()) as {
      email?: string;
      source?: string;
    };

    const result = await subscribeToNewsletter({
      email: String(payload.email ?? ""),
      source: String(payload.source ?? "blog")
    });

    return publicJsonResponse({
      ok: true,
      alreadySubscribed: result.alreadySubscribed
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "MISSING_EMAIL" || error.message === "INVALID_EMAIL") {
        return publicJsonResponse({ error: error.message.toLowerCase() }, { status: 400 });
      }

      if (
        error.message === "NEWSLETTER_PROVIDER_NOT_CONFIGURED" ||
        error.message === "NEWSLETTER_PROVIDER_SYNC_FAILED" ||
        error.message === "NEWSLETTER_DELIVERY_FAILED"
      ) {
        return publicJsonResponse({ error: "newsletter_delivery_failed" }, { status: 500 });
      }
    }

    return publicJsonResponse({ error: "newsletter_subscribe_failed" }, { status: 500 });
  }
}

export const OPTIONS = withRouteErrorAlerting(handleOPTIONS, "app/api/public/newsletter/route.ts:OPTIONS");
export const POST = withRouteErrorAlerting(handlePOST, "app/api/public/newsletter/route.ts:POST");
