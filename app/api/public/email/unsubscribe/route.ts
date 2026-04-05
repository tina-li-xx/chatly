import { updateEmailUnsubscribePreferencesByToken } from "@/lib/email-unsubscribe";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";

export function OPTIONS() {
  return publicNoContentResponse();
}

export async function POST(request: Request) {
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
