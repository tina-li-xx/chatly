import { query } from "@/lib/db";

export type VisitorContactRow = {
  site_id: string;
  email: string;
  latest_conversation_id: string | null;
  latest_session_id: string | null;
  tags_json: string[] | null;
  custom_fields_json: Record<string, string> | null;
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
};

export async function findVisitorContactRow(siteId: string, email: string) {
  const result = await query<VisitorContactRow>(
    `
      SELECT
        site_id,
        email,
        latest_conversation_id,
        latest_session_id,
        tags_json,
        custom_fields_json,
        first_seen_at,
        last_seen_at,
        created_at,
        updated_at
      FROM visitor_contacts
      WHERE site_id = $1
        AND email = $2
      LIMIT 1
    `,
    [siteId, email]
  );

  return result.rows[0] ?? null;
}

export async function upsertVisitorContactRow(input: {
  siteId: string;
  email: string;
  conversationId?: string | null;
  sessionId?: string | null;
  seenAt: string;
  visitorTags?: string[];
  customFields?: Record<string, string>;
}) {
  const siteId = input.siteId.trim();
  const email = input.email.trim().toLowerCase();
  const result = await query<VisitorContactRow>(
    `
      INSERT INTO visitor_contacts (
        site_id,
        email,
        latest_conversation_id,
        latest_session_id,
        tags_json,
        custom_fields_json,
        first_seen_at,
        last_seen_at,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $7, NOW(), NOW())
      ON CONFLICT (site_id, email)
      DO UPDATE SET
        latest_conversation_id = CASE
          WHEN EXCLUDED.last_seen_at >= visitor_contacts.last_seen_at
            THEN COALESCE(EXCLUDED.latest_conversation_id, visitor_contacts.latest_conversation_id)
          ELSE visitor_contacts.latest_conversation_id
        END,
        latest_session_id = CASE
          WHEN EXCLUDED.last_seen_at >= visitor_contacts.last_seen_at
            THEN COALESCE(EXCLUDED.latest_session_id, visitor_contacts.latest_session_id)
          ELSE visitor_contacts.latest_session_id
        END,
        tags_json = CASE
          WHEN EXCLUDED.tags_json <> '[]'::jsonb
            THEN EXCLUDED.tags_json
          ELSE visitor_contacts.tags_json
        END,
        custom_fields_json = CASE
          WHEN EXCLUDED.custom_fields_json <> '{}'::jsonb
            THEN visitor_contacts.custom_fields_json || EXCLUDED.custom_fields_json
          ELSE visitor_contacts.custom_fields_json
        END,
        first_seen_at = LEAST(visitor_contacts.first_seen_at, EXCLUDED.first_seen_at),
        last_seen_at = GREATEST(visitor_contacts.last_seen_at, EXCLUDED.last_seen_at),
        updated_at = NOW()
      RETURNING
        site_id,
        email,
        latest_conversation_id,
        latest_session_id,
        tags_json,
        custom_fields_json,
        first_seen_at,
        last_seen_at,
        created_at,
        updated_at
    `,
    [
      siteId,
      email,
      input.conversationId ?? null,
      input.sessionId ?? null,
      JSON.stringify(input.visitorTags ?? []),
      JSON.stringify(input.customFields ?? {}),
      input.seenAt
    ]
  );

  return result.rows[0] ?? null;
}
