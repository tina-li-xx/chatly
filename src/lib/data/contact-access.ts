import type { ContactConversationHistoryEntry } from "@/lib/contact-types";
import { normalizeBillingPlanKey } from "@/lib/billing-plans";
import { query } from "@/lib/db";
import { getContactPlanLimits } from "@/lib/plan-limits";
import {
  findBillingAccountRow
} from "@/lib/repositories/billing-repository";
import {
  findWorkspaceContactSettingsValue
} from "@/lib/repositories/contact-settings-repository";
import {
  findAccessibleDashboardContactRow
} from "@/lib/repositories/contacts-repository";
import { workspaceAccessClause } from "@/lib/repositories/workspace-access-repository";
import { decodeContactId, parseContactSettingsJson } from "@/lib/contact-utils";
import { getWorkspaceAccess } from "@/lib/workspace-access";

export async function resolveAccessibleContactContext(userId: string, contactId: string) {
  const decoded = decodeContactId(contactId);
  if (!decoded) {
    return null;
  }

  const workspace = await getWorkspaceAccess(userId);
  const row = await findAccessibleDashboardContactRow(
    workspace.ownerUserId,
    userId,
    decoded.siteId,
    decoded.email
  );
  if (!row) {
    return null;
  }

  return { decoded, workspace, row };
}

export async function loadConversationHistory(
  ownerUserId: string,
  viewerUserId: string,
  siteId: string,
  email: string
) {
  const result = await query<ContactConversationHistoryEntry>(
    `
      WITH matching_conversations AS (
        SELECT
          c.id,
          c.status,
          c.created_at,
          c.assigned_user_id
        FROM conversations c
        INNER JOIN sites s
          ON s.id = c.site_id
        WHERE c.site_id = $1
          AND LOWER(COALESCE(c.email, '')) = LOWER($2)
          AND ${workspaceAccessClause("s.user_id", "$3", "$4")}
      ),
      message_counts AS (
        SELECT
          m.conversation_id,
          COUNT(*)::int AS message_count
        FROM messages m
        INNER JOIN matching_conversations mc
          ON mc.id = m.conversation_id
        GROUP BY m.conversation_id
      ),
      first_user_messages AS (
        SELECT DISTINCT ON (m.conversation_id)
          m.conversation_id,
          LEFT(NULLIF(TRIM(m.content), ''), 80) AS title
        FROM messages m
        INNER JOIN matching_conversations mc
          ON mc.id = m.conversation_id
        WHERE m.sender = 'user'
        ORDER BY m.conversation_id, m.created_at ASC
      )
      SELECT
        mc.id,
        COALESCE(fum.title, 'Conversation') AS title,
        mc.status,
        mc.created_at AS "createdAt",
        mc.assigned_user_id AS "assignedUserId",
        COALESCE(counts.message_count, 0) AS "messageCount"
      FROM matching_conversations mc
      LEFT JOIN first_user_messages fum
        ON fum.conversation_id = mc.id
      LEFT JOIN message_counts counts
        ON counts.conversation_id = mc.id
      ORDER BY mc.created_at DESC
    `,
    [siteId, email, ownerUserId, viewerUserId]
  );

  return result.rows;
}

export async function resolveContactSettings(userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const [account, settingsJson] = await Promise.all([
    findBillingAccountRow(workspace.ownerUserId),
    findWorkspaceContactSettingsValue(workspace.ownerUserId)
  ]);
  const planKey = normalizeBillingPlanKey(account?.plan_key);
  const settings = parseContactSettingsJson(settingsJson, planKey);

  return {
    workspace,
    planKey,
    settings,
    limits: getContactPlanLimits(planKey)
  };
}

export async function hasAccessibleSite(userId: string, siteId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const result = await query<{ id: string }>(
    `
      SELECT s.id
      FROM sites s
      WHERE s.id = $1
        AND ${workspaceAccessClause("s.user_id", "$2", "$3")}
      LIMIT 1
    `,
    [siteId, workspace.ownerUserId, userId]
  );

  return Boolean(result.rows[0]?.id);
}
