import { query } from "@/lib/db";
import type {
  DashboardAiAssistAction,
  DashboardAiAssistFeature
} from "@/lib/data/settings-ai-assist-usage";

export async function insertWorkspaceAiAssistEvent(input: {
  id: string;
  ownerUserId: string;
  actorUserId?: string | null;
  conversationId?: string | null;
  feature: DashboardAiAssistFeature;
  action: DashboardAiAssistAction;
  metadataJson?: Record<string, unknown>;
}) {
  await query(
    `
      INSERT INTO ai_assist_events (
        id,
        owner_user_id,
        actor_user_id,
        conversation_id,
        feature,
        action,
        metadata_json
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
    `,
    [
      input.id,
      input.ownerUserId,
      input.actorUserId ?? null,
      input.conversationId ?? null,
      input.feature,
      input.action,
      JSON.stringify(input.metadataJson ?? {})
    ]
  );
}

export async function getWorkspaceAiAssistUsageSummaryRow(
  ownerUserId: string,
  periodDays: number
) {
  const result = await query<{
    total_events: string;
    total_requests: string;
    active_teammates: string;
    last_event_at: string | null;
    summaries_viewed: string;
    replies_used: string;
    rewrites_applied: string;
    tags_applied: string;
  }>(
    `
      SELECT
        COUNT(*)::text AS total_events,
        COUNT(*) FILTER (WHERE action = 'requested')::text AS total_requests,
        COUNT(DISTINCT actor_user_id)::text AS active_teammates,
        MAX(created_at)::text AS last_event_at,
        COUNT(*) FILTER (WHERE feature = 'summary' AND action = 'shown')::text AS summaries_viewed,
        COUNT(*) FILTER (WHERE feature = 'reply' AND action = 'used')::text AS replies_used,
        COUNT(*) FILTER (WHERE feature = 'rewrite' AND action = 'applied')::text AS rewrites_applied,
        COUNT(*) FILTER (WHERE feature = 'tags' AND action = 'applied')::text AS tags_applied
      FROM ai_assist_events
      WHERE owner_user_id = $1
        AND created_at >= NOW() - ($2::int * INTERVAL '1 day')
    `,
    [ownerUserId, periodDays]
  );

  return result.rows[0] ?? null;
}

export async function listRecentWorkspaceAiAssistEventRows(
  ownerUserId: string,
  limit: number
) {
  const result = await query<{
    id: string;
    actor_user_id: string | null;
    actor_email: string | null;
    conversation_id: string | null;
    feature: DashboardAiAssistFeature;
    action: DashboardAiAssistAction;
    metadata_json: Record<string, unknown> | null;
    created_at: string;
  }>(
    `
      SELECT
        e.id,
        e.actor_user_id,
        u.email AS actor_email,
        e.conversation_id,
        e.feature,
        e.action,
        e.metadata_json,
        e.created_at::text AS created_at
      FROM ai_assist_events e
      LEFT JOIN users u
        ON u.id = e.actor_user_id
      WHERE e.owner_user_id = $1
      ORDER BY e.created_at DESC
      LIMIT $2
    `,
    [ownerUserId, limit]
  );

  return result.rows;
}
