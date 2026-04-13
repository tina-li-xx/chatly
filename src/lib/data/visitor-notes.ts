import { getWorkspaceAccess } from "@/lib/workspace-access";
import { findConversationIdentityForActivity } from "@/lib/repositories/conversations-read-repository";
import { hasConversationAccess } from "./shared";
import {
  deleteVisitorNoteRow,
  findSiteRowForOwner,
  findVisitorNoteRow,
  upsertVisitorNoteRow
} from "@/lib/repositories/visitor-notes-repository";
import type { VisitorNoteMentionToken } from "@/lib/visitor-note-mention-structure";
import {
  buildVisitorIdentity,
  mapVisitorNote,
  type VisitorIdentity
} from "./visitor-note-helpers";

async function resolveConversationIdentity(conversationId: string, userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const allowed = await hasConversationAccess(
    conversationId,
    workspace.ownerUserId,
    userId
  );

  if (!allowed) {
    return null;
  }

  const identity = await findConversationIdentityForActivity(conversationId, workspace.ownerUserId);
  if (!identity) {
    return null;
  }
  return buildVisitorIdentity({
    siteId: identity.site_id,
    sessionId: identity.session_id,
    email: identity.email
  });
}

async function ensureSiteAccess(siteId: string, userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  return findSiteRowForOwner(siteId, workspace.ownerUserId);
}

async function saveVisitorNote(
  identity: VisitorIdentity,
  note: string,
  mentions: VisitorNoteMentionToken[],
  updatedByUserId: string
) {
  const normalizedNote = note.trim();
  if (!normalizedNote) {
    await deleteVisitorNoteRow(identity.siteId, identity.identityType, identity.identityValue);
    return { note: null, updatedAt: null, mentions: [] };
  }

  const saved = mapVisitorNote(
    await upsertVisitorNoteRow({
      siteId: identity.siteId,
      identityType: identity.identityType,
      identityValue: identity.identityValue,
      note: normalizedNote,
      mentions,
      updatedByUserId
    })
  );

  return {
    note: saved?.note ?? null,
    updatedAt: saved?.updatedAt ?? null,
    mentions: saved?.mentions ?? []
  };
}

export async function getConversationVisitorNote(conversationId: string, userId: string) {
  const identity = await resolveConversationIdentity(conversationId, userId);
  if (!identity) {
    return null;
  }
  const note = mapVisitorNote(
    await findVisitorNoteRow(identity.siteId, identity.identityType, identity.identityValue)
  );

  return { note: note?.note ?? null, updatedAt: note?.updatedAt ?? null, mentions: note?.mentions ?? [] };
}

export async function getSiteVisitorNote(input: {
  siteId: string;
  sessionId?: string | null;
  email?: string | null;
  userId: string;
}) {
  if (!(await ensureSiteAccess(input.siteId, input.userId))) {
    return null;
  }

  const identity = buildVisitorIdentity(input);
  if (!identity) {
    return { note: null, updatedAt: null, mentions: [] };
  }
  const note = mapVisitorNote(
    await findVisitorNoteRow(identity.siteId, identity.identityType, identity.identityValue)
  );

  return { note: note?.note ?? null, updatedAt: note?.updatedAt ?? null, mentions: note?.mentions ?? [] };
}

export async function updateConversationVisitorNote(
  conversationId: string,
  note: string,
  mentions: VisitorNoteMentionToken[],
  userId: string
) {
  const identity = await resolveConversationIdentity(conversationId, userId);
  if (!identity) {
    return null;
  }

  return saveVisitorNote(identity, note, mentions, userId);
}

export async function updateSiteVisitorNote(input: {
  siteId: string;
  sessionId?: string | null;
  email?: string | null;
  note: string;
  mentions: VisitorNoteMentionToken[];
  userId: string;
}) {
  if (!(await ensureSiteAccess(input.siteId, input.userId))) {
    return null;
  }

  const identity = buildVisitorIdentity(input);
  if (!identity) {
    return { note: null, updatedAt: null, mentions: [] };
  }

  return saveVisitorNote(identity, input.note, input.mentions, input.userId);
}

export async function migrateVisitorNoteIdentity(input: {
  siteId: string;
  sessionId: string;
  previousEmail?: string | null;
  nextEmail?: string | null;
  updatedByUserId?: string | null;
}) {
  const from = buildVisitorIdentity({
    siteId: input.siteId,
    sessionId: input.sessionId,
    email: input.previousEmail
  });
  const to = buildVisitorIdentity({
    siteId: input.siteId,
    sessionId: input.sessionId,
    email: input.nextEmail
  });

  if (!from || !to || (from.identityType === to.identityType && from.identityValue === to.identityValue)) {
    return;
  }

  const [fromNote, toNote] = await Promise.all([
    findVisitorNoteRow(from.siteId, from.identityType, from.identityValue),
    findVisitorNoteRow(to.siteId, to.identityType, to.identityValue)
  ]);

  if (!fromNote) {
    return;
  }

  if (!toNote) {
    await upsertVisitorNoteRow({
        siteId: to.siteId,
        identityType: to.identityType,
        identityValue: to.identityValue,
        note: fromNote.note,
        mentions: fromNote.mentions_json,
        updatedByUserId: input.updatedByUserId ?? null
      });
  }

  await deleteVisitorNoteRow(from.siteId, from.identityType, from.identityValue);
}
