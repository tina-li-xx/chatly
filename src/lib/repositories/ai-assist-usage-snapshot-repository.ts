import { query } from "@/lib/db";
import {
  buildAiAssistActivityRowsQuery,
  type WorkspaceAiAssistActivityRow
} from "@/lib/repositories/ai-assist-activity-shared";

export type WorkspaceAiAssistSummaryRow = {
  current_requests: string;
  current_suggestion_requests: string;
  current_used: string;
  current_summaries: string;
  current_reply_requests: string;
  current_summary_requests: string;
  current_rewrite_requests: string;
  current_tag_requests: string;
  current_active_teammates: string;
  current_last_event_at: string | null;
  previous_requests: string;
  previous_suggestion_requests: string;
  previous_used: string;
  previous_summaries: string;
};

export type WorkspaceAiAssistTeamRow = {
  actor_user_id: string | null;
  actor_email: string | null;
  requests: string;
  suggestion_requests: string;
  used: string;
  summaries: string;
};

export type WorkspaceAiAssistUsageSnapshotRow = WorkspaceAiAssistSummaryRow & {
  team_rows: WorkspaceAiAssistTeamRow[] | null;
  activity_rows: WorkspaceAiAssistActivityRow[] | null;
};

function appendActorCondition(
  values: Array<string | number>,
  actorUserId: string | null | undefined
) {
  if (!actorUserId) {
    return "";
  }

  values.push(actorUserId);
  return `AND e.actor_user_id = $${values.length}::text`;
}

export async function getWorkspaceAiAssistUsageSnapshotRow(input: {
  ownerUserId: string;
  currentStart: string;
  currentEnd: string;
  previousStart: string;
  activityLimit: number;
  teamActorUserId?: string | null;
  activityActorUserId?: string | null;
}) {
  const values: Array<string | number> = [
    input.ownerUserId,
    input.currentStart,
    input.currentEnd,
    input.previousStart
  ];
  const teamActorCondition = appendActorCondition(values, input.teamActorUserId);
  const activityActorCondition = appendActorCondition(values, input.activityActorUserId);

  values.push(input.activityLimit);
  const activityLimitParam = `$${values.length}::int`;
  const activityRowsSql = buildAiAssistActivityRowsQuery(`
      SELECT
        e.id,
        e.actor_user_id,
        e.conversation_id,
        e.feature,
        e.action,
        e.metadata_json,
        e.created_at
      FROM current_events e
      WHERE TRUE
        ${activityActorCondition}
      ORDER BY e.created_at DESC, e.id DESC
      LIMIT ${activityLimitParam}
    `);

  const result = await query<WorkspaceAiAssistUsageSnapshotRow>(
    `
      WITH windowed_events AS (
        SELECT
          e.id,
          e.actor_user_id,
          e.conversation_id,
          e.feature,
          e.action,
          e.metadata_json,
          e.created_at,
          CASE
            WHEN e.created_at >= $2::timestamptz AND e.created_at < $3::timestamptz
              THEN 'current'
            ELSE 'previous'
          END AS period
        FROM ai_assist_events e
        WHERE e.owner_user_id = $1
          AND e.created_at >= $4::timestamptz
          AND e.created_at < $3::timestamptz
      ),
      current_events AS (
        SELECT *
        FROM windowed_events
        WHERE period = 'current'
      ),
      summary_row AS (
        SELECT
          COUNT(*) FILTER (WHERE period = 'current' AND action = 'requested')::text AS current_requests,
          COUNT(*) FILTER (WHERE period = 'current' AND action = 'requested' AND feature <> 'summary')::text AS current_suggestion_requests,
          COUNT(*) FILTER (WHERE period = 'current' AND ((feature = 'reply' AND action = 'used') OR (feature = 'rewrite' AND action = 'applied') OR (feature = 'tags' AND action = 'applied')))::text AS current_used,
          COUNT(*) FILTER (WHERE period = 'current' AND feature = 'summary' AND action = 'shown')::text AS current_summaries,
          COUNT(*) FILTER (WHERE period = 'current' AND feature = 'reply' AND action = 'requested')::text AS current_reply_requests,
          COUNT(*) FILTER (WHERE period = 'current' AND feature = 'summary' AND action = 'requested')::text AS current_summary_requests,
          COUNT(*) FILTER (WHERE period = 'current' AND feature = 'rewrite' AND action = 'requested')::text AS current_rewrite_requests,
          COUNT(*) FILTER (WHERE period = 'current' AND feature = 'tags' AND action = 'requested')::text AS current_tag_requests,
          COUNT(DISTINCT actor_user_id) FILTER (WHERE period = 'current')::text AS current_active_teammates,
          MAX(created_at) FILTER (WHERE period = 'current')::text AS current_last_event_at,
          COUNT(*) FILTER (WHERE period = 'previous' AND action = 'requested')::text AS previous_requests,
          COUNT(*) FILTER (WHERE period = 'previous' AND action = 'requested' AND feature <> 'summary')::text AS previous_suggestion_requests,
          COUNT(*) FILTER (WHERE period = 'previous' AND ((feature = 'reply' AND action = 'used') OR (feature = 'rewrite' AND action = 'applied') OR (feature = 'tags' AND action = 'applied')))::text AS previous_used,
          COUNT(*) FILTER (WHERE period = 'previous' AND feature = 'summary' AND action = 'shown')::text AS previous_summaries
        FROM windowed_events
      )
      SELECT
        summary_row.*,
        COALESCE((
          SELECT json_agg(team_row ORDER BY (team_row.requests)::int DESC, team_row.actor_email ASC NULLS LAST)
          FROM (
            SELECT
              e.actor_user_id,
              u.email AS actor_email,
              COUNT(*) FILTER (WHERE e.action = 'requested')::text AS requests,
              COUNT(*) FILTER (WHERE e.action = 'requested' AND e.feature <> 'summary')::text AS suggestion_requests,
              COUNT(*) FILTER (WHERE (e.feature = 'reply' AND e.action = 'used') OR (e.feature = 'rewrite' AND e.action = 'applied') OR (e.feature = 'tags' AND e.action = 'applied'))::text AS used,
              COUNT(*) FILTER (WHERE e.feature = 'summary' AND e.action = 'shown')::text AS summaries
            FROM current_events e
            LEFT JOIN users u
              ON u.id = e.actor_user_id
            WHERE TRUE
              ${teamActorCondition}
            GROUP BY e.actor_user_id, u.email
          ) team_row
        ), '[]'::json) AS team_rows,
        COALESCE((
          SELECT json_agg(activity_row ORDER BY activity_row.created_at DESC, activity_row.id DESC)
          FROM (${activityRowsSql}) activity_row
        ), '[]'::json) AS activity_rows
      FROM summary_row
    `,
    values
  );

  return result.rows[0] ?? null;
}
