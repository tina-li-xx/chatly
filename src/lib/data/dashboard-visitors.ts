import type { ConversationSummary } from "@/lib/types";
import { overlayConversationSummariesWithLivePresence } from "@/lib/data/conversation-summary-live-presence";
import { mapSummary, queryConversationSummaries } from "@/lib/data/shared";
import { queryVisitorsPageConversationSummaries } from "@/lib/repositories/visitors-page-conversation-repository";
import { optionalText } from "@/lib/utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";

type VisitorSummaryIdentityInput = {
  email?: string | null;
  sessionId?: string | null;
  siteId: string;
  userId: string;
};

function buildVisitorSummaryIdentity(input: VisitorSummaryIdentityInput, ownerUserId: string) {
  const siteId = input.siteId.trim();
  const email = optionalText(input.email)?.toLowerCase();
  const sessionId = optionalText(input.sessionId);

  if (!siteId || (!email && !sessionId)) {
    return null;
  }

  if (email && sessionId) {
    return {
      values: [siteId, email, sessionId, ownerUserId],
      whereClause: `
        c.site_id = $1
        AND (
          LOWER(COALESCE(c.email, '')) = LOWER($2)
          OR c.session_id = $3
          OR EXISTS (
            SELECT 1
            FROM visitor_presence_sessions vps
            WHERE vps.site_id = c.site_id
              AND (vps.conversation_id = c.id OR vps.session_id = c.session_id)
              AND LOWER(COALESCE(vps.email, '')) = LOWER($2)
          )
        )
        AND s.user_id = $4
      `
    };
  }

  if (email) {
    return {
      values: [siteId, email, ownerUserId],
      whereClause: `
        c.site_id = $1
        AND (
          LOWER(COALESCE(c.email, '')) = LOWER($2)
          OR EXISTS (
            SELECT 1
            FROM visitor_presence_sessions vps
            WHERE vps.site_id = c.site_id
              AND (vps.conversation_id = c.id OR vps.session_id = c.session_id)
              AND LOWER(COALESCE(vps.email, '')) = LOWER($2)
          )
        )
        AND s.user_id = $3
      `
    };
  }

  return {
    values: [siteId, sessionId, ownerUserId],
    whereClause: `
      c.site_id = $1
      AND c.session_id = $2
      AND s.user_id = $3
    `
  };
}

export async function listVisitorsPageConversationSummaries(userId: string): Promise<ConversationSummary[]> {
  const workspace = await getWorkspaceAccess(userId);
  const result = await queryVisitorsPageConversationSummaries(
    "s.user_id = $1",
    [workspace.ownerUserId],
    "ORDER BY c.updated_at DESC",
    userId
  );

  return overlayConversationSummariesWithLivePresence(
    result.rows.map(mapSummary),
    {
      ownerUserId: workspace.ownerUserId,
      viewerUserId: userId
    }
  );
}

export async function listConversationSummariesForVisitor(
  input: VisitorSummaryIdentityInput
): Promise<ConversationSummary[]> {
  const workspace = await getWorkspaceAccess(input.userId);
  const identity = buildVisitorSummaryIdentity(input, workspace.ownerUserId);

  if (!identity) {
    return [];
  }

  const result = await queryConversationSummaries(
    identity.whereClause,
    identity.values,
    "ORDER BY c.last_message_at DESC NULLS LAST, c.updated_at DESC",
    input.userId
  );

  return overlayConversationSummariesWithLivePresence(
    result.rows.map(mapSummary),
    {
      ownerUserId: workspace.ownerUserId,
      viewerUserId: input.userId
    }
  );
}
