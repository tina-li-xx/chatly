import { getDashboardContact, updateDashboardContact } from "@/lib/data";
import { mergeDistinctValues } from "@/lib/data/contact-normalizers";
import { jsonError, jsonOk } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { requireZapierApiAuth } from "@/lib/zapier-api-auth";
import { withZapierIdempotentJsonResponse } from "@/lib/zapier-idempotency";

async function handlePOST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireZapierApiAuth(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const tag = String(body?.tag ?? "").trim();
  if (!tag) {
    return jsonError("missing-tag", 400);
  }

  const { id } = await context.params;
  const contact = await getDashboardContact(auth.auth.ownerUserId, id);
  if (!contact) {
    return jsonError("not-found", 404);
  }

  return withZapierIdempotentJsonResponse({
    request,
    auth: auth.auth,
    requestBody: {
      route: "contacts.tags.add",
      contactId: id,
      tag
    },
    execute: async () => {
      const updated = await updateDashboardContact({
        userId: auth.auth.ownerUserId,
        contactId: id,
        tags: mergeDistinctValues([...contact.tags, tag])
      });

      if (!updated) {
        return jsonError("not-found", 404);
      }

      return jsonOk({
        id: updated.id,
        tag
      });
    }
  });
}

export const POST = withRouteErrorAlerting(
  handlePOST,
  "app/api/zapier/contacts/[id]/tags/route.ts:POST"
);
