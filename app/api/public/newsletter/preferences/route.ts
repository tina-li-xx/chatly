import { updateNewsletterPreferencesByToken } from "@/lib/data/newsletter";
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
      return publicJsonResponse({ error: "invalid_preferences_request" }, { status: 400 });
    }

    const result = await updateNewsletterPreferencesByToken({
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
      error.message === "INVALID_NEWSLETTER_PREFERENCES_TOKEN"
    ) {
      return publicJsonResponse({ error: "invalid_preferences_token" }, { status: 404 });
    }

    return publicJsonResponse({ error: "newsletter_preferences_failed" }, { status: 500 });
  }
}
