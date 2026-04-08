import type { ContactDetail } from "@/lib/contact-types";
import { recordContactExportEvent } from "@/lib/contact-events";
import { optionalText } from "@/lib/utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { mergeDistinctValues } from "@/lib/data/contact-normalizers";
import { getDashboardContact } from "@/lib/data/contact-queries";
import {
  deleteDashboardContact,
  updateDashboardContact
} from "@/lib/data/contact-mutations";

export async function bulkUpdateDashboardContacts(input: {
  userId: string;
  contactIds: string[];
  status?: string | null;
  addTag?: string | null;
  deleteContacts?: boolean;
  exportContacts?: boolean;
  exportFieldKeys?: string[];
}) {
  const updated: ContactDetail[] = [];

  if (input.exportContacts) {
    const contacts = (await Promise.all(
      input.contactIds.map((contactId) => getDashboardContact(input.userId, contactId))
    )).filter((contact): contact is ContactDetail => Boolean(contact));
    if (!contacts.length) {
      return contacts;
    }

    const workspace = await getWorkspaceAccess(input.userId);
    await recordContactExportEvent({
      ownerUserId: workspace.ownerUserId,
      actorUserId: input.userId,
      contactIds: contacts.map((contact) => contact.id),
      fieldKeys: input.exportFieldKeys ?? [],
      siteIds: contacts.map((contact) => contact.siteId)
    });

    return contacts;
  }

  for (const contactId of input.contactIds) {
    if (input.deleteContacts) {
      await deleteDashboardContact(input.userId, contactId);
      continue;
    }

    const contact = await getDashboardContact(input.userId, contactId);
    if (!contact) {
      continue;
    }

    const next = await updateDashboardContact({
      userId: input.userId,
      contactId,
      status: optionalText(input.status) ?? contact.status,
      tags: input.addTag
        ? mergeDistinctValues([...contact.tags, input.addTag])
        : contact.tags
    });
    if (next) {
      updated.push(next);
    }
  }

  return updated;
}
