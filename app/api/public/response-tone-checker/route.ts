import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";
import {
  normalizeResponseToneContext,
  validateResponseToneMessage
} from "@/lib/response-tone-checker";
import { analyzeResponseToneWithClaude } from "@/lib/response-tone-checker-service";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

function handleOPTIONS() {
  return publicNoContentResponse();
}

async function handlePOST(request: Request) {
  try {
    const payload = (await request.json()) as { message?: string; context?: string };
    const message = String(payload.message ?? "");
    const error = validateResponseToneMessage(message);

    if (error) {
      return publicJsonResponse({ error: error.toLowerCase() }, { status: 400 });
    }

    const analysis = await analyzeResponseToneWithClaude({
      message,
      context: normalizeResponseToneContext(String(payload.context ?? "general"))
    });

    return publicJsonResponse({ ok: true, analysis });
  } catch (error) {
    if (error instanceof Error && (error.message === "ANTHROPIC_NOT_CONFIGURED" || error.message === "MINIMAX_NOT_CONFIGURED")) {
      return publicJsonResponse({ error: "response_tone_provider_not_configured" }, { status: 500 });
    }

    if (error instanceof Error && (error.message === "RESPONSE_TONE_PROVIDER_FAILED" || error.message === "INVALID_TONE_ANALYSIS_RESPONSE")) {
      return publicJsonResponse({ error: "response_tone_analysis_failed" }, { status: 500 });
    }

    return publicJsonResponse({ error: "response_tone_analysis_failed" }, { status: 500 });
  }
}

export const OPTIONS = withRouteErrorAlerting(handleOPTIONS, "app/api/public/response-tone-checker/route.ts:OPTIONS");
export const POST = withRouteErrorAlerting(handlePOST, "app/api/public/response-tone-checker/route.ts:POST");
