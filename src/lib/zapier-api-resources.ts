import "server-only";

import { mapContactRow } from "@/lib/data/contact-records";
import { listSitesForUser } from "@/lib/data/sites-core";
import { mapSummary } from "@/lib/data/shared";
import { listDashboardContactRows } from "@/lib/repositories/contacts-repository";
import { queryConversationSummaries } from "@/lib/repositories/shared-repository";

function normalizeLimit(limit: number | null | undefined) {
  if (!Number.isFinite(limit)) {
    return 10;
  }

  return Math.max(1, Math.min(50, Math.floor(limit ?? 10)));
}

export async function getZapierPrimarySite(ownerUserId: string) {
  const sites = await listSitesForUser(ownerUserId, ownerUserId);
  return sites[0] ?? null;
}

export async function listZapierContacts(ownerUserId: string, limit?: number | null) {
  const rows = await listDashboardContactRows(ownerUserId, ownerUserId);
  return rows.slice(0, normalizeLimit(limit)).map((row) => {
    const contact = mapContactRow(row);
    return {
      id: contact.id,
      email: contact.email,
      name: contact.name,
      company: contact.company,
      phone: contact.phone,
      status: contact.status,
      tags: contact.tags,
      first_seen_at: contact.firstSeenAt,
      last_seen_at: contact.lastSeenAt
    };
  });
}

export async function listZapierConversations(
  ownerUserId: string,
  limit?: number | null
) {
  const result = await queryConversationSummaries(
    "s.user_id = $1",
    [ownerUserId],
    `ORDER BY c.last_message_at DESC NULLS LAST, c.updated_at DESC LIMIT ${normalizeLimit(limit)}`,
    ownerUserId
  );
  const conversations = result.rows.map(mapSummary);

  return conversations.map((conversation) => ({
    id: conversation.id,
    visitor_email: conversation.email,
    page_url: conversation.pageUrl,
    status: conversation.status,
    created_at: conversation.createdAt,
    updated_at: conversation.updatedAt,
    last_message_preview: conversation.lastMessagePreview,
    tags: conversation.tags
  }));
}
