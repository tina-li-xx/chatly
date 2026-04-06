import type {
  DashboardAiAssistAction,
  DashboardAiAssistFeature
} from "@/lib/data/settings-ai-assist-usage";

export type WorkspaceAiAssistActivityRow = {
  id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  conversation_id: string | null;
  conversation_preview: string | null;
  feature: DashboardAiAssistFeature;
  action: DashboardAiAssistAction;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
};

export function buildAiAssistActivityRowsQuery(scopedEventsSql: string) {
  return `
  WITH scoped_events AS (
    ${scopedEventsSql}
  )
  SELECT
    e.id,
    e.actor_user_id,
    u.email AS actor_email,
    e.conversation_id,
    NULLIF(BTRIM(subject_message.content), '') AS conversation_preview,
    e.feature,
    e.action,
    e.metadata_json,
    e.created_at::text AS created_at
  FROM scoped_events e
  LEFT JOIN users u
    ON u.id = e.actor_user_id
  LEFT JOIN LATERAL (
    SELECT m.content
    FROM messages m
    WHERE m.conversation_id = e.conversation_id
      AND NULLIF(BTRIM(m.content), '') IS NOT NULL
    ORDER BY
      CASE WHEN m.sender = 'user' THEN 0 ELSE 1 END,
      m.created_at ASC
    LIMIT 1
  ) subject_message ON TRUE
  ORDER BY e.created_at DESC, e.id DESC
`;
}
