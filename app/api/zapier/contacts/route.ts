import { createDashboardContact } from "@/lib/services";
import { jsonError, jsonOk } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { getZapierPrimarySite, listZapierContacts } from "@/lib/zapier-api-resources";
import { requireZapierApiAuth } from "@/lib/zapier-api-auth";
import { readZapierCreateContactInput } from "@/lib/zapier-contact-input";
import { buildZapierContactCreatedPayload } from "@/lib/zapier-event-payloads";
import { withZapierIdempotentJsonResponse } from "@/lib/zapier-idempotency";

async function handleGET(request: Request) {
  const auth = await requireZapierApiAuth(request);
  if ("response" in auth) {
    return auth.response;
  }

  const limit = Number(new URL(request.url).searchParams.get("limit") ?? "10");
  const contacts = await listZapierContacts(auth.auth.ownerUserId, limit);
  return Response.json(
    contacts.map((contact) =>
      buildZapierContactCreatedPayload({
        contactId: contact.id,
        email: contact.email,
        name: contact.name,
        company: contact.company,
        source: "chat_form",
        timestamp: contact.first_seen_at
      })
    )
  );
}

async function handlePOST(request: Request) {
  const auth = await requireZapierApiAuth(request);
  if ("response" in auth) {
    return auth.response;
  }

  const body = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const input = readZapierCreateContactInput(body);
  if (!input.email) {
    return jsonError("missing-email", 400);
  }

  const site = await getZapierPrimarySite(auth.auth.ownerUserId);
  if (!site) {
    return jsonError("workspace-site-missing", 409);
  }

  return withZapierIdempotentJsonResponse({
    request,
    auth: auth.auth,
    requestBody: {
      route: "contacts.create",
      siteId: site.id,
      ...input
    },
    execute: async () => {
      try {
        const contact = await createDashboardContact({
          userId: auth.auth.ownerUserId,
          siteId: site.id,
          email: input.email,
          name: input.name,
          phone: input.phone,
          company: input.company,
          role: null,
          avatarUrl: null,
          status: input.status,
          tags: input.tags,
          customFields: input.customFields,
          source: "zapier_api"
        });

        if (!contact) {
          return jsonError("contact-not-found", 404);
        }

        return jsonOk(
          {
            id: contact.id,
            email: contact.email,
            name: contact.name,
            created_at: contact.firstSeenAt
          },
          201
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "CONTACT_SITE_FORBIDDEN"
        ) {
          return jsonError("contact-site-forbidden", 403);
        }

        return jsonError("contact-save-failed", 500);
      }
    }
  });
}

export const GET = withRouteErrorAlerting(
  handleGET,
  "app/api/zapier/contacts/route.ts:GET"
);
export const POST = withRouteErrorAlerting(
  handlePOST,
  "app/api/zapier/contacts/route.ts:POST"
);
