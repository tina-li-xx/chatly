import type { VisitorPresenceSession } from "@/lib/types";
import { syncDashboardContactFromPresence } from "@/lib/data/contacts";
import { shouldSyncVisitorContact } from "@/lib/data/visitor-contact-sync-policy";
import { publishDashboardLive } from "@/lib/live-events";
import {
  findSiteOwnerRow,
  findVisitorPresenceSessionRow,
  listVisitorPresenceRowsForUser,
  upsertVisitorPresenceSessionRow
} from "@/lib/repositories/visitor-presence-repository";
import { optionalDateTime, optionalText } from "@/lib/utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";

export type RecordVisitorPresenceInput = {
  siteId: string;
  sessionId: string;
  conversationId?: string | null;
  email?: string | null;
  pageUrl?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  timezone?: string | null;
  locale?: string | null;
  visitorTags?: string[];
  customFields?: Record<string, string>;
};

function mapVisitorPresenceSession(
  row: Awaited<ReturnType<typeof upsertVisitorPresenceSessionRow>>
): VisitorPresenceSession | null {
  if (!row) return null;
  return {
    siteId: row.site_id,
    sessionId: row.session_id,
    conversationId: row.conversation_id,
    email: row.email,
    currentPageUrl: row.current_page_url,
    referrer: row.referrer,
    userAgent: row.user_agent,
    country: row.country,
    region: row.region,
    city: row.city,
    timezone: row.timezone,
    locale: row.locale,
    tags: row.tags_json ?? [],
    customFields: row.custom_fields_json ?? {},
    startedAt: row.started_at,
    lastSeenAt: row.last_seen_at
  } satisfies VisitorPresenceSession;
}

export async function syncVisitorContact(input: {
  siteId: string;
  email?: string | null;
  conversationId?: string | null;
  sessionId?: string | null;
  seenAt?: string | Date | null;
  pageUrl?: string | null;
  referrer?: string | null;
  location?: { city?: string | null; region?: string | null; country?: string | null };
  visitorTags?: string[];
  customFields?: Record<string, string>;
  sessionDurationSeconds?: number | null;
}) {
  const siteId = input.siteId.trim();
  const email = optionalText(input.email)?.toLowerCase();

  if (!siteId || !email) return null;
  try {
    return await syncDashboardContactFromPresence({
      siteId,
      email,
      conversationId: optionalText(input.conversationId),
      sessionId: optionalText(input.sessionId),
      seenAt: optionalDateTime(input.seenAt) ?? new Date().toISOString(),
      pageUrl: optionalText(input.pageUrl),
      referrer: optionalText(input.referrer),
      location: input.location,
      visitorTags: input.visitorTags,
      customFields: input.customFields,
      sessionDurationSeconds: input.sessionDurationSeconds
    });
  } catch (error) {
    console.error("visitor contact sync failed", error);
    return null;
  }
}

export async function recordVisitorPresence(input: RecordVisitorPresenceInput) {
  const sessionId = input.sessionId.trim();
  if (!input.siteId || !sessionId) return null;
  const [owner, previous] = await Promise.all([findSiteOwnerRow(input.siteId), findVisitorPresenceSessionRow(input.siteId, sessionId)]);
  const next = mapVisitorPresenceSession(
    await upsertVisitorPresenceSessionRow({
      siteId: input.siteId,
      sessionId,
      conversationId: optionalText(input.conversationId),
      email: optionalText(input.email),
      currentPageUrl: optionalText(input.pageUrl),
      referrer: optionalText(input.referrer),
      userAgent: optionalText(input.userAgent),
      country: optionalText(input.country),
      region: optionalText(input.region),
      city: optionalText(input.city),
      timezone: optionalText(input.timezone),
      locale: optionalText(input.locale),
      visitorTags: input.visitorTags,
      customFields: input.customFields
    })
  );

  if (next && shouldSyncVisitorContact(previous, next)) {
    const sessionDurationSeconds = Math.max(
      0,
      Math.round((new Date(next.lastSeenAt).getTime() - new Date(next.startedAt).getTime()) / 1000)
    );
    await syncVisitorContact({
      siteId: next.siteId,
      email: next.email,
      conversationId: next.conversationId,
      sessionId: next.sessionId,
      seenAt: next.lastSeenAt,
      pageUrl: next.currentPageUrl,
      referrer: next.referrer,
      location: {
        city: next.city,
        region: next.region,
        country: next.country
      },
      visitorTags: next.tags,
      customFields: next.customFields,
      sessionDurationSeconds
    });
  }

  if (!owner?.user_id || !next) return next;
  const pageChanged =
    optionalText(previous?.current_page_url) !== next.currentPageUrl &&
    Boolean(next.currentPageUrl);
  const conversationChanged = optionalText(previous?.conversation_id) !== next.conversationId;
  const emailChanged = optionalText(previous?.email) !== next.email && Boolean(next.email);

  if (pageChanged || conversationChanged || emailChanged || !previous) {
    publishDashboardLive(owner.user_id, {
      type: "visitor.presence.updated",
      siteId: next.siteId,
      sessionId: next.sessionId,
      conversationId: next.conversationId,
      pageUrl: next.currentPageUrl,
      updatedAt: next.lastSeenAt,
      session: next
    });
  }

  return next;
}

export async function getVisitorPresenceSession(input: {
  userId: string;
  siteId: string;
  sessionId: string;
}) {
  const siteId = input.siteId.trim();
  const sessionId = input.sessionId.trim();

  if (!siteId || !sessionId) return null;
  const workspace = await getWorkspaceAccess(input.userId);
  const [owner, row] = await Promise.all([
    findSiteOwnerRow(siteId),
    findVisitorPresenceSessionRow(siteId, sessionId)
  ]);

  if (!row || owner?.user_id !== workspace.ownerUserId) {
    return null;
  }

  return mapVisitorPresenceSession(row);
}

export async function listVisitorPresenceSessions(userId: string): Promise<VisitorPresenceSession[]> {
  const workspace = await getWorkspaceAccess(userId);
  const rows = await listVisitorPresenceRowsForUser(workspace.ownerUserId, userId);
  const sessions: VisitorPresenceSession[] = [];

  for (const row of rows) {
    const session = mapVisitorPresenceSession(row);
    if (session) {
      sessions.push(session);
    }
  }

  return sessions;
}
