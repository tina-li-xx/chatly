import { query } from "@/lib/db";
import type { BillingInterval, BillingPlanKey } from "@/lib/billing-plans";

export type FounderWorkspaceRow = {
  owner_user_id: string;
  owner_email: string;
  owner_created_at: string;
  email_verified_at: string | null;
  team_name: string | null;
  primary_domain: string | null;
  site_count: string;
  site_domains: string[] | null;
  verified_widget_count: string;
  has_widget_installed: boolean;
  plan_key: BillingPlanKey | null;
  billing_interval: BillingInterval | null;
  stripe_status: string | null;
  seat_quantity: number | null;
  trial_ends_at: string | null;
  conversations_last_30_days: string;
  conversations_last_7_days: string;
  open_conversations: string;
  last_conversation_at: string | null;
  last_login_at: string | null;
  team_member_count: string;
};

export type FounderRecentConversationRow = {
  conversation_id: string;
  owner_user_id: string;
  owner_email: string;
  team_name: string | null;
  site_name: string;
  visitor_email: string | null;
  created_at: string;
  status: "open" | "resolved";
  page_url: string | null;
  first_message_preview: string | null;
};

const OWNER_WORKSPACES_CTE = `
  WITH owner_workspaces AS (
    SELECT
      u.id AS owner_user_id,
      u.email AS owner_email,
      u.created_at AS owner_created_at,
      u.email_verified_at,
      primary_site.name AS team_name,
      primary_site.domain AS primary_domain
    FROM users u
    LEFT JOIN LATERAL (
      SELECT s.name, s.domain
      FROM sites s
      WHERE s.user_id = u.id
      ORDER BY s.created_at ASC
      LIMIT 1
    ) primary_site ON TRUE
    WHERE EXISTS (
      SELECT 1
      FROM sites s
      WHERE s.user_id = u.id
    )
    OR EXISTS (
      SELECT 1
      FROM billing_accounts b
      WHERE b.user_id = u.id
    )
  )
`;

export async function listFounderWorkspaceRows() {
  const result = await query<FounderWorkspaceRow>(
    `
      ${OWNER_WORKSPACES_CTE}
      , site_rollup AS (
        SELECT
          s.user_id AS owner_user_id,
          COUNT(*)::text AS site_count,
          ARRAY_REMOVE(ARRAY_AGG(NULLIF(s.domain, '') ORDER BY s.created_at), NULL) AS site_domains,
          COUNT(*) FILTER (WHERE s.widget_install_verified_at IS NOT NULL)::text AS verified_widget_count,
          BOOL_OR(s.widget_install_verified_at IS NOT NULL) AS has_widget_installed
        FROM sites s
        GROUP BY s.user_id
      )
      , conversation_rollup AS (
        SELECT
          s.user_id AS owner_user_id,
          COUNT(*) FILTER (WHERE c.created_at >= NOW() - INTERVAL '30 days')::text AS conversations_last_30_days,
          COUNT(*) FILTER (WHERE c.created_at >= NOW() - INTERVAL '7 days')::text AS conversations_last_7_days,
          COUNT(*) FILTER (WHERE c.status = 'open')::text AS open_conversations,
          MAX(c.updated_at) AS last_conversation_at
        FROM sites s
        LEFT JOIN conversations c
          ON c.site_id = s.id
        GROUP BY s.user_id
      )
      , workspace_users AS (
        SELECT ow.owner_user_id, ow.owner_user_id AS user_id
        FROM owner_workspaces ow
        UNION ALL
        SELECT tm.owner_user_id, tm.member_user_id AS user_id
        FROM team_memberships tm
        INNER JOIN owner_workspaces ow
          ON ow.owner_user_id = tm.owner_user_id
        WHERE tm.status = 'active'
      )
      , session_rollup AS (
        SELECT wu.owner_user_id, MAX(a.created_at) AS last_login_at
        FROM workspace_users wu
        LEFT JOIN auth_sessions a
          ON a.user_id = wu.user_id
        GROUP BY wu.owner_user_id
      )
      , team_rollup AS (
        SELECT ow.owner_user_id, (1 + COUNT(tm.member_user_id))::text AS team_member_count
        FROM owner_workspaces ow
        LEFT JOIN team_memberships tm
          ON tm.owner_user_id = ow.owner_user_id
         AND tm.status = 'active'
        GROUP BY ow.owner_user_id
      )
      SELECT
        ow.owner_user_id,
        ow.owner_email,
        ow.owner_created_at,
        ow.email_verified_at,
        ow.team_name,
        ow.primary_domain,
        COALESCE(sr.site_count, '0') AS site_count,
        sr.site_domains,
        COALESCE(sr.verified_widget_count, '0') AS verified_widget_count,
        COALESCE(sr.has_widget_installed, FALSE) AS has_widget_installed,
        ba.plan_key,
        ba.billing_interval,
        ba.stripe_status,
        ba.seat_quantity,
        ba.trial_ends_at,
        COALESCE(cr.conversations_last_30_days, '0') AS conversations_last_30_days,
        COALESCE(cr.conversations_last_7_days, '0') AS conversations_last_7_days,
        COALESCE(cr.open_conversations, '0') AS open_conversations,
        cr.last_conversation_at,
        ses.last_login_at,
        COALESCE(tr.team_member_count, '1') AS team_member_count
      FROM owner_workspaces ow
      LEFT JOIN site_rollup sr
        ON sr.owner_user_id = ow.owner_user_id
      LEFT JOIN billing_accounts ba
        ON ba.user_id = ow.owner_user_id
      LEFT JOIN conversation_rollup cr
        ON cr.owner_user_id = ow.owner_user_id
      LEFT JOIN session_rollup ses
        ON ses.owner_user_id = ow.owner_user_id
      LEFT JOIN team_rollup tr
        ON tr.owner_user_id = ow.owner_user_id
      ORDER BY COALESCE(cr.last_conversation_at, ses.last_login_at, ow.owner_created_at) DESC, ow.owner_user_id ASC
    `
  );

  return result.rows;
}

export async function listFounderRecentConversationRows(limit = 10) {
  const result = await query<FounderRecentConversationRow>(
    `
      ${OWNER_WORKSPACES_CTE}
      SELECT
        c.id AS conversation_id,
        s.user_id AS owner_user_id,
        ow.owner_email,
        COALESCE(ow.team_name, ow.owner_email) AS team_name,
        s.name AS site_name,
        c.email AS visitor_email,
        c.created_at,
        c.status,
        cm.page_url,
        first_user.content AS first_message_preview
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      INNER JOIN owner_workspaces ow
        ON ow.owner_user_id = s.user_id
      LEFT JOIN conversation_metadata cm
        ON cm.conversation_id = c.id
      LEFT JOIN LATERAL (
        SELECT m.content
        FROM messages m
        WHERE m.conversation_id = c.id
          AND m.sender = 'user'
        ORDER BY m.created_at ASC
        LIMIT 1
      ) first_user ON TRUE
      ORDER BY c.created_at DESC
      LIMIT $1
    `,
    [limit]
  );

  return result.rows;
}
