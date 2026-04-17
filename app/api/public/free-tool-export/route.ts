import { requestFreeToolExport } from "@/lib/services";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

function handleOPTIONS() {
  return publicNoContentResponse();
}

async function handlePOST(request: Request) {
  try {
    const payload = (await request.json()) as {
      email?: string;
      toolSlug?: string;
      source?: string;
      resultPayload?: unknown;
    };

    await requestFreeToolExport({
      email: String(payload.email ?? ""),
      toolSlug: String(payload.toolSlug ?? ""),
      source: String(payload.source ?? "free-tools"),
      resultPayload: payload.resultPayload ?? {}
    });

    return publicJsonResponse({ ok: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "MISSING_EMAIL" || error.message === "INVALID_EMAIL" || error.message === "INVALID_TOOL_EXPORT") {
        return publicJsonResponse({ error: error.message.toLowerCase() }, { status: 400 });
      }

      if (error.message === "UNSUPPORTED_TOOL_EXPORT") {
        return publicJsonResponse({ error: "unsupported_tool_export" }, { status: 400 });
      }

      if (error.message === "FREE_TOOL_EXPORT_DELIVERY_FAILED") {
        return publicJsonResponse({ error: "free_tool_export_delivery_failed" }, { status: 500 });
      }
    }

    return publicJsonResponse({ error: "free_tool_export_failed" }, { status: 500 });
  }
}

export const OPTIONS = withRouteErrorAlerting(handleOPTIONS, "app/api/public/free-tool-export/route.ts:OPTIONS");
export const POST = withRouteErrorAlerting(handlePOST, "app/api/public/free-tool-export/route.ts:POST");
