import {
  createHelpCenterArticle,
  deleteHelpCenterArticle,
  updateHelpCenterArticle
} from "@/lib/services";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

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
      const article = await createHelpCenterArticle(auth.user.id, {
        title: String(payload.title ?? ""),
        slug: String(payload.slug ?? ""),
        body: String(payload.body ?? "")
      });
      return jsonOk({ article });
    }

    if (action === "update") {
      const article = await updateHelpCenterArticle(auth.user.id, {
        id: String(payload.id ?? "").trim(),
        title: String(payload.title ?? ""),
        slug: String(payload.slug ?? ""),
        body: String(payload.body ?? "")
      });
      return jsonOk({ article });
    }

    if (action === "delete") {
      const id = String(payload.id ?? "").trim();
      if (!id) {
        return jsonError("missing-fields", 400);
      }

      await deleteHelpCenterArticle(auth.user.id, id);
      return jsonOk({ id });
    }

    return jsonError("unknown-action", 400);
  } catch (error) {
    if (error instanceof Error && error.message === "MISSING_FIELDS") {
      return jsonError("missing-fields", 400);
    }
    if (error instanceof Error && error.message === "SLUG_TAKEN") {
      return jsonError("slug-taken", 409);
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return jsonError("not-found", 404);
    }

    return jsonError("help-center-failed", 500);
  }
}

export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/help-center/articles/route.ts:POST");
