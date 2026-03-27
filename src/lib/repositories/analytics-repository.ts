import { query } from "@/lib/db";

export type AnalyticsConversationRow = {
  id: string;
  created_at: string;
  updated_at: string;
  status: "open" | "resolved";
  page_url: string | null;
  referrer: string | null;
  helpful: boolean | null;
  first_response_seconds: string | null;
  resolution_seconds: string | null;
  tags: string[] | null;
};

export type AnalyticsReplyEventRow = {
  created_at: string;
  response_seconds: string;
};

export async function listAnalyticsConversations(userId: string) {
  const result = await query<AnalyticsConversationRow>(
    `
      SELECT
        c.id,
        c.created_at,
        c.updated_at,
        c.status,
        cm.page_url,
        cm.referrer,
        f.helpful,
        CASE
          WHEN fr.first_reply_at IS NOT NULL
           AND fu.first_user_at IS NOT NULL
           AND fr.first_reply_at > fu.first_user_at
          THEN EXTRACT(EPOCH FROM (fr.first_reply_at - fu.first_user_at))::text
          ELSE NULL
        END AS first_response_seconds,
        CASE
          WHEN c.status = 'resolved' AND c.updated_at > c.created_at
          THEN EXTRACT(EPOCH FROM (c.updated_at - c.created_at))::text
          ELSE NULL
        END AS resolution_seconds,
        COALESCE(tag_rollup.tags, '{}') AS tags
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      LEFT JOIN conversation_metadata cm
        ON cm.conversation_id = c.id
      LEFT JOIN feedback f
        ON f.conversation_id = c.id
      LEFT JOIN LATERAL (
        SELECT MIN(m.created_at) AS first_user_at
        FROM messages m
        WHERE m.conversation_id = c.id
          AND m.sender = 'user'
      ) fu ON TRUE
      LEFT JOIN LATERAL (
        SELECT MIN(m.created_at) AS first_reply_at
        FROM messages m
        WHERE m.conversation_id = c.id
          AND m.sender = 'founder'
          AND (fu.first_user_at IS NULL OR m.created_at > fu.first_user_at)
      ) fr ON TRUE
      LEFT JOIN LATERAL (
        SELECT ARRAY_AGG(t.tag ORDER BY t.tag) AS tags
        FROM tags t
        WHERE t.conversation_id = c.id
      ) tag_rollup ON TRUE
      WHERE s.user_id = $1
      ORDER BY c.created_at ASC
    `,
    [userId]
  );

  return result.rows;
}

export async function listAnalyticsReplyEvents(userId: string) {
  const result = await query<AnalyticsReplyEventRow>(
    `
      WITH ordered_messages AS (
        SELECT
          m.created_at,
          m.sender,
          LAG(m.sender) OVER (
            PARTITION BY m.conversation_id
            ORDER BY m.created_at
          ) AS previous_sender,
          LAG(m.created_at) OVER (
            PARTITION BY m.conversation_id
            ORDER BY m.created_at
          ) AS previous_created_at
        FROM messages m
        INNER JOIN conversations c
          ON c.id = m.conversation_id
        INNER JOIN sites s
          ON s.id = c.site_id
        WHERE s.user_id = $1
      )
      SELECT
        created_at,
        EXTRACT(EPOCH FROM (created_at - previous_created_at))::text AS response_seconds
      FROM ordered_messages
      WHERE sender = 'founder'
        AND previous_sender = 'user'
        AND previous_created_at IS NOT NULL
        AND created_at > previous_created_at
      ORDER BY created_at ASC
    `,
    [userId]
  );

  return result.rows;
}
