import {
  recordContactDeletedEvent,
  recordContactDiffEvents
} from "@/lib/contact-events";
import { gravatarUrlForEmail } from "@/lib/contact-avatar";
import { encodeContactId } from "@/lib/contact-utils";
import { deleteDashboardContactRow } from "@/lib/repositories/contacts-repository";
import { optionalText } from "@/lib/utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { deliverZapierEvent } from "@/lib/zapier-event-delivery";
import { buildZapierContactCreatedPayload } from "@/lib/zapier-event-payloads";
import { hasAccessibleSite } from "@/lib/data/contact-access";
import { mergeDistinctValues } from "@/lib/data/contact-normalizers";
import { resolveUpdatedContactNotes } from "@/lib/data/contact-note-updates";
import { saveMappedContact } from "@/lib/data/contact-records";
import { getDashboardContact } from "@/lib/data/contact-queries";
import { identifyDashboardContact } from "@/lib/data/contact-sync";

export async function updateDashboardContact(input: {
  userId: string;
  contactId: string;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
  location?: { city?: string | null; region?: string | null; country?: string | null };
  tags?: string[];
  customFields?: Record<string, string>;
  note?: { id?: string | null; body: string } | null;
  deleteNoteId?: string | null;
}) {
  const workspace = await getWorkspaceAccess(input.userId);
  const detail = await getDashboardContact(input.userId, input.contactId);
  if (!detail) {
    return null;
  }

  const notes = await resolveUpdatedContactNotes({
    userId: input.userId,
    workspaceRole: workspace.role,
    notes: detail.notes,
    note: input.note,
    deleteNoteId: input.deleteNoteId
  });

  const nextDetail = {
    ...detail,
    name: optionalText(input.name) ?? detail.name,
    phone: input.phone === null ? null : optionalText(input.phone) ?? detail.phone,
    company: input.company === null ? null : optionalText(input.company) ?? detail.company,
    role: input.role === null ? null : optionalText(input.role) ?? detail.role,
    avatarUrl:
      input.avatarUrl === null
        ? gravatarUrlForEmail(detail.email)
        : optionalText(input.avatarUrl) ?? detail.avatarUrl,
    status: optionalText(input.status) ?? detail.status,
    location: {
      city: input.location?.city === null ? null : optionalText(input.location?.city) ?? detail.location.city,
      region: input.location?.region === null ? null : optionalText(input.location?.region) ?? detail.location.region,
      country: input.location?.country === null ? null : optionalText(input.location?.country) ?? detail.location.country
    },
    tags: Array.isArray(input.tags) ? mergeDistinctValues(input.tags) : detail.tags,
    customFields: input.customFields
      ? Object.fromEntries(Object.entries(input.customFields).filter(([, value]) => optionalText(value)))
      : detail.customFields,
    notes
  };

  await saveMappedContact(nextDetail);
  await recordContactDiffEvents({
    before: detail,
    after: nextDetail,
    source: "dashboard",
    actorUserId: input.userId,
    includeNoteEvents: true
  });

  return getDashboardContact(input.userId, input.contactId);
}

export async function createDashboardContact(input: {
  userId: string;
  siteId: string;
  email: string;
  source?: string;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
  tags?: string[];
  customFields?: Record<string, string>;
}) {
  if (!(await hasAccessibleSite(input.userId, input.siteId))) {
    throw new Error("CONTACT_SITE_FORBIDDEN");
  }

  const contactId = encodeContactId(input.siteId, input.email);
  const existing = await getDashboardContact(input.userId, contactId);

  await identifyDashboardContact({
    siteId: input.siteId,
    email: input.email,
    name: input.name,
    phone: input.phone,
    company: input.company,
    role: input.role,
    avatarUrl: input.avatarUrl,
    status: input.status,
    visitorTags: input.tags,
    customFields: input.customFields
  });

  const next = await getDashboardContact(input.userId, contactId);
  if (next && !existing) {
    await deliverZapierEvent({
      ownerUserId: (await getWorkspaceAccess(input.userId)).ownerUserId,
      eventType: "contact.created",
      payload: buildZapierContactCreatedPayload({
        contactId: next.id,
        email: next.email,
        name: next.name,
        company: next.company,
        source: input.source ?? "dashboard",
        timestamp: next.firstSeenAt
      })
    });
  }

  return next;
}

export async function deleteDashboardContact(userId: string, contactId: string) {
  const detail = await getDashboardContact(userId, contactId);
  if (!detail) {
    return false;
  }

  await deleteDashboardContactRow(detail.siteId, detail.email);
  await recordContactDeletedEvent({
    contact: detail,
    actorUserId: userId
  });
  return true;
}
