import {
  deleteDashboardContact,
  getDashboardContact,
  getDashboardContactSettings,
  updateDashboardContact
} from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;
  const includeSettings = new URL(request.url).searchParams.get("includeSettings") === "1";
  const contact = await getDashboardContact(auth.user.id, id);

  if (!contact) {
    return jsonError("contact-not-found", 404);
  }

  const settingsPayload = includeSettings
    ? await getDashboardContactSettings(auth.user.id)
    : null;

  return jsonOk({
    contact,
    settings: settingsPayload?.settings
  });
}

async function handlePATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const notePayload =
      payload.note && typeof payload.note === "object"
        ? (payload.note as Record<string, unknown>)
        : null;
    const contact = await updateDashboardContact({
      userId: auth.user.id,
      contactId: id,
      name: typeof payload.name === "string" ? payload.name : undefined,
      phone: typeof payload.phone === "string" || payload.phone === null ? (payload.phone as string | null) : undefined,
      company: typeof payload.company === "string" || payload.company === null ? (payload.company as string | null) : undefined,
      role: typeof payload.role === "string" || payload.role === null ? (payload.role as string | null) : undefined,
      avatarUrl: typeof payload.avatarUrl === "string" || payload.avatarUrl === null ? (payload.avatarUrl as string | null) : undefined,
      status: typeof payload.status === "string" ? payload.status : undefined,
      location:
        payload.location && typeof payload.location === "object"
          ? {
              city: typeof (payload.location as Record<string, unknown>).city === "string" || (payload.location as Record<string, unknown>).city === null
                ? ((payload.location as Record<string, unknown>).city as string | null)
                : undefined,
              region: typeof (payload.location as Record<string, unknown>).region === "string" || (payload.location as Record<string, unknown>).region === null
                ? ((payload.location as Record<string, unknown>).region as string | null)
                : undefined,
              country: typeof (payload.location as Record<string, unknown>).country === "string" || (payload.location as Record<string, unknown>).country === null
                ? ((payload.location as Record<string, unknown>).country as string | null)
                : undefined
            }
          : undefined,
      tags: Array.isArray(payload.tags) ? payload.tags.map((tag) => String(tag)) : undefined,
      customFields:
        payload.customFields && typeof payload.customFields === "object"
          ? Object.fromEntries(Object.entries(payload.customFields).map(([key, value]) => [key, String(value)]))
          : undefined,
      note: notePayload
        ? {
            id: typeof notePayload.id === "string" ? notePayload.id : null,
            body: String(notePayload.body ?? "")
          }
        : null,
      deleteNoteId: typeof payload.deleteNoteId === "string" ? payload.deleteNoteId : null
    });

    if (!contact) {
      return jsonError("contact-not-found", 404);
    }

    return jsonOk({ contact });
  } catch (error) {
    if (error instanceof Error && error.message === "CONTACT_NOTE_FORBIDDEN") {
      return jsonError("contact-note-forbidden", 403);
    }

    return jsonError("contact-save-failed", 500);
  }
}

async function handleDELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;
  const deleted = await deleteDashboardContact(auth.user.id, id);
  if (!deleted) {
    return jsonError("contact-not-found", 404);
  }

  return jsonOk({});
}

export const GET = withRouteErrorAlerting(handleGET, "app/api/contacts/[id]/route.ts:GET");
export const PATCH = withRouteErrorAlerting(handlePATCH, "app/api/contacts/[id]/route.ts:PATCH");
export const DELETE = withRouteErrorAlerting(handleDELETE, "app/api/contacts/[id]/route.ts:DELETE");
