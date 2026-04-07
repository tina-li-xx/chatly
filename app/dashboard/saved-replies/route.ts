import {
  createSavedReply,
  deleteSavedReply,
  listSavedReplies,
  updateSavedReply
} from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const savedReplies = await listSavedReplies(auth.user.id, auth.user.workspaceOwnerId);
  return jsonOk({ savedReplies });
}

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  if (auth.user.workspaceRole === "member") {
    return jsonError("forbidden", 403);
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const action = String(payload.action ?? "").trim();

    if (action === "create") {
      const savedReply = await createSavedReply(auth.user.id, {
        title: String(payload.title ?? ""),
        body: String(payload.body ?? ""),
        tags: Array.isArray(payload.tags) ? payload.tags.map(String) : []
      }, auth.user.workspaceOwnerId);
      return jsonOk({ savedReply });
    }

    if (action === "update") {
      const savedReply = await updateSavedReply(auth.user.id, {
        id: String(payload.id ?? "").trim(),
        title: String(payload.title ?? ""),
        body: String(payload.body ?? ""),
        tags: Array.isArray(payload.tags) ? payload.tags.map(String) : []
      }, auth.user.workspaceOwnerId);
      return jsonOk({ savedReply });
    }

    if (action === "delete") {
      const id = String(payload.id ?? "").trim();
      if (!id) {
        return jsonError("missing-fields", 400);
      }

      await deleteSavedReply(auth.user.id, id, auth.user.workspaceOwnerId);
      return jsonOk({ id });
    }

    return jsonError("unknown-action", 400);
  } catch (error) {
    if (error instanceof Error && error.message === "MISSING_FIELDS") {
      return jsonError("missing-fields", 400);
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return jsonError("not-found", 404);
    }

    return jsonError("saved-replies-failed", 500);
  }
}

export const GET = withRouteErrorAlerting(handleGET, "app/dashboard/saved-replies/route.ts:GET");
export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/saved-replies/route.ts:POST");
