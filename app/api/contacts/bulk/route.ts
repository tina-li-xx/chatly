import { bulkUpdateDashboardContacts } from "@/lib/services";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const contacts = await bulkUpdateDashboardContacts({
      userId: auth.user.id,
      contactIds: Array.isArray(payload.contactIds) ? payload.contactIds.map((id) => String(id)) : [],
      status: typeof payload.status === "string" ? payload.status : null,
      addTag: typeof payload.addTag === "string" ? payload.addTag : null,
      deleteContacts: Boolean(payload.deleteContacts),
      exportContacts: Boolean(payload.exportContacts),
      exportFieldKeys: Array.isArray(payload.exportFieldKeys) ? payload.exportFieldKeys.map((field) => String(field)) : []
    });

    return jsonOk({ contacts });
  } catch {
    return jsonError("contact-bulk-failed", 500);
  }
}

export const POST = withRouteErrorAlerting(handlePOST, "app/api/contacts/bulk/route.ts:POST");
