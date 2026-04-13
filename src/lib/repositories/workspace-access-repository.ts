import { query } from "@/lib/db";

export type WorkspaceAccessRole = "owner" | "admin" | "member";

export type WorkspaceAccessRow = {
  owner_user_id: string;
  role: WorkspaceAccessRole;
  owner_email: string;
  owner_created_at: string;
  team_name: string | null;
  team_domain: string | null;
};

export type TeamInviteAccessRow = {
  id: string;
  owner_user_id: string;
  email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "revoked";
  message: string;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  accepted_by_user_id: string | null;
  team_name: string | null;
  team_domain: string | null;
  owner_email: string;
  owner_first_name: string | null;
  owner_last_name: string | null;
};

const WORKSPACE_ACCESS_CTE = `
  WITH workspace_access AS (
    SELECT
      u.id AS owner_user_id,
      'owner'::text AS role
    FROM users u
    WHERE u.id = $1
      AND (
        u.owner_onboarding_stage <> 'complete'
        OR EXISTS (
          SELECT 1
          FROM sites owned_site
          WHERE owned_site.user_id = u.id
        )
      )

    UNION ALL

    SELECT
      tm.owner_user_id,
      tm.role::text AS role
    FROM team_memberships tm
    WHERE tm.member_user_id = $1
      AND tm.status = 'active'
  )
`;

const WORKSPACE_ACCESS_SELECT = `
  SELECT
    wa.owner_user_id,
    wa.role::text AS role,
    owner_user.email AS owner_email,
    owner_user.created_at AS owner_created_at,
    primary_site.name AS team_name,
    primary_site.domain AS team_domain
  FROM workspace_access wa
  INNER JOIN users owner_user
    ON owner_user.id = wa.owner_user_id
  LEFT JOIN LATERAL (
    SELECT s.name, s.domain
    FROM sites s
    WHERE s.user_id = wa.owner_user_id
    ORDER BY s.created_at ASC
    LIMIT 1
  ) primary_site ON TRUE
`;

export function workspaceAccessClause(ownerColumn: string, ownerParam: string, viewerParam: string) {
  return `(
    ${ownerColumn} = ${ownerParam}
    AND (
      ${ownerParam} = ${viewerParam}
      OR EXISTS (
        SELECT 1
        FROM team_memberships tm
        WHERE tm.owner_user_id = ${ownerParam}
          AND tm.member_user_id = ${viewerParam}
          AND tm.status = 'active'
      )
    )
  )`;
}

export function conversationAccessClause(
  ownerColumn: string,
  assignedUserColumn: string,
  ownerParam: string,
  viewerParam: string
) {
  return `(
    ${ownerColumn} = ${ownerParam}
    AND (
      ${ownerParam} = ${viewerParam}
      OR EXISTS (
        SELECT 1
        FROM team_memberships tm
        WHERE tm.owner_user_id = ${ownerParam}
          AND tm.member_user_id = ${viewerParam}
          AND tm.status = 'active'
          AND (
            tm.role = 'admin'
            OR ${assignedUserColumn} = ${viewerParam}
          )
      )
    )
  )`;
}

export async function findWorkspaceAccessRow(userId: string, ownerUserId?: string) {
  const params = ownerUserId ? [userId, ownerUserId] : [userId];
  const whereClause = ownerUserId ? "WHERE wa.owner_user_id = $2" : "";
  const result = await query<WorkspaceAccessRow>(
    `
      ${WORKSPACE_ACCESS_CTE}
      ${WORKSPACE_ACCESS_SELECT}
      ${whereClause}
      ORDER BY
        CASE WHEN wa.owner_user_id = $1 THEN 0 ELSE 1 END,
        CASE WHEN wa.role = 'owner' THEN 0 ELSE 1 END,
        owner_user.created_at ASC
      LIMIT 1
    `,
    params
  );

  return result.rows[0] ?? null;
}

export async function listWorkspaceAccessRows(userId: string) {
  const result = await query<WorkspaceAccessRow>(
    `
      ${WORKSPACE_ACCESS_CTE}
      ${WORKSPACE_ACCESS_SELECT}
      ORDER BY
        CASE WHEN wa.owner_user_id = $1 THEN 0 ELSE 1 END,
        CASE WHEN wa.role = 'owner' THEN 0 ELSE 1 END,
        COALESCE(primary_site.name, owner_user.email) ASC,
        wa.owner_user_id ASC
    `,
    [userId]
  );

  return result.rows;
}

export async function findTeamInviteAccessRow(inviteId: string) {
  const result = await query<TeamInviteAccessRow>(
    `
      SELECT
        ti.id,
        ti.owner_user_id,
        ti.email,
        ti.role,
        ti.status,
        ti.message,
        ti.created_at,
        ti.updated_at,
        ti.accepted_at,
        ti.accepted_by_user_id,
        owner_user.email AS owner_email,
        owner_settings.first_name AS owner_first_name,
        owner_settings.last_name AS owner_last_name,
        primary_site.name AS team_name,
        primary_site.domain AS team_domain
      FROM team_invites ti
      INNER JOIN users owner_user
        ON owner_user.id = ti.owner_user_id
      LEFT JOIN user_settings owner_settings
        ON owner_settings.user_id = ti.owner_user_id
      LEFT JOIN LATERAL (
        SELECT s.name, s.domain
        FROM sites s
        WHERE s.user_id = ti.owner_user_id
        ORDER BY s.created_at ASC
        LIMIT 1
      ) primary_site ON TRUE
      WHERE ti.id = $1
      LIMIT 1
    `,
    [inviteId]
  );

  return result.rows[0] ?? null;
}
