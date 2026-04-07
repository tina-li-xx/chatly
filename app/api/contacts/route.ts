import { createDashboardContact, listDashboardContacts } from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = await listDashboardContacts(auth.user.id);
    return jsonOk(payload);
  } catch {
    return jsonError("contacts-load-failed", 500);
  }
}

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const contact = await createDashboardContact({
      userId: auth.user.id,
      siteId: String(payload.siteId ?? "").trim(),
      email: String(payload.email ?? "").trim(),
      name: typeof payload.name === "string" ? payload.name : null,
      phone: typeof payload.phone === "string" ? payload.phone : null,
      company: typeof payload.company === "string" ? payload.company : null,
      role: typeof payload.role === "string" ? payload.role : null,
      avatarUrl: typeof payload.avatarUrl === "string" ? payload.avatarUrl : null,
      status: typeof payload.status === "string" ? payload.status : null,
      tags: Array.isArray(payload.tags) ? payload.tags.map((tag) => String(tag)) : [],
      customFields:
        payload.customFields && typeof payload.customFields === "object"
          ? Object.fromEntries(Object.entries(payload.customFields).map(([key, value]) => [key, String(value)]))
          : {}
    });

    if (!contact) {
      return jsonError("contact-not-found", 404);
    }

    return jsonOk({ contact }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "CONTACT_SITE_FORBIDDEN") {
      return jsonError("contact-site-forbidden", 403);
    }

    return jsonError("contact-save-failed", 500);
  }
}

export const GET = withRouteErrorAlerting(handleGET, "app/api/contacts/route.ts:GET");
export const POST = withRouteErrorAlerting(handlePOST, "app/api/contacts/route.ts:POST");
