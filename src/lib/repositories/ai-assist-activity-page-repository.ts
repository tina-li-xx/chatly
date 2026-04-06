import type { DashboardAiAssistFeature } from "@/lib/data/settings-ai-assist-usage";
import { query } from "@/lib/db";
import {
  buildAiAssistActivityRowsQuery,
  type WorkspaceAiAssistActivityRow
} from "@/lib/repositories/ai-assist-activity-shared";

export type WorkspaceAiAssistActivityMemberRow = {
  actor_user_id: string;
  actor_email: string | null;
};

function whereClause(input: {
  ownerUserId: string;
  actorUserId?: string | null;
  feature?: DashboardAiAssistFeature | null;
  rangeStart?: string | null;
  rangeEnd?: string | null;
  cursorCreatedAt?: string | null;
  cursorId?: string | null;
}) {
  const values: Array<string | number> = [input.ownerUserId];
  const conditions = ["e.owner_user_id = $1"];

  if (input.actorUserId) {
    values.push(input.actorUserId);
    conditions.push(`e.actor_user_id = $${values.length}::text`);
  }

  if (input.feature) {
    values.push(input.feature);
    conditions.push(`e.feature = $${values.length}::text`);
  }

  if (input.rangeStart) {
    values.push(input.rangeStart);
    conditions.push(`e.created_at >= $${values.length}::timestamptz`);
  }

  if (input.rangeEnd) {
    values.push(input.rangeEnd);
    conditions.push(`e.created_at < $${values.length}::timestamptz`);
  }

  if (input.cursorCreatedAt) {
    values.push(input.cursorCreatedAt);
    const cursorCreatedAt = `$${values.length}::timestamptz`;

    if (input.cursorId) {
      values.push(input.cursorId);
      conditions.push(
        `(e.created_at < ${cursorCreatedAt} OR (e.created_at = ${cursorCreatedAt} AND e.id < $${values.length}::text))`
      );
    } else {
      conditions.push(`e.created_at < ${cursorCreatedAt}`);
    }
  }

  return { conditions, values };
}

export async function listWorkspaceAiAssistActivityMembers(input: {
  ownerUserId: string;
  actorUserId?: string | null;
}) {
  const { conditions, values } = whereClause({
    ownerUserId: input.ownerUserId,
    actorUserId: input.actorUserId
  });
  const result = await query<WorkspaceAiAssistActivityMemberRow>(
    `
      SELECT DISTINCT
        e.actor_user_id,
        u.email AS actor_email
      FROM ai_assist_events e
      LEFT JOIN users u
        ON u.id = e.actor_user_id
      WHERE ${conditions.join("\n        AND ")}
        AND e.actor_user_id IS NOT NULL
      ORDER BY u.email ASC NULLS LAST
    `,
    values
  );

  return result.rows;
}

export async function hasWorkspaceAiAssistActivity(input: {
  ownerUserId: string;
  actorUserId?: string | null;
}) {
  const { conditions, values } = whereClause({
    ownerUserId: input.ownerUserId,
    actorUserId: input.actorUserId
  });
  const result = await query<{ exists: number }>(
    `
      SELECT 1 AS exists
      FROM ai_assist_events e
      WHERE ${conditions.join("\n        AND ")}
      LIMIT 1
    `,
    values
  );

  return Boolean(result.rowCount);
}

export async function listWorkspaceAiAssistFilteredActivityRows(input: {
  ownerUserId: string;
  actorUserId?: string | null;
  feature?: DashboardAiAssistFeature | null;
  rangeStart?: string | null;
  rangeEnd?: string | null;
  cursorCreatedAt?: string | null;
  cursorId?: string | null;
  limit?: number | null;
}) {
  const { conditions, values } = whereClause(input);
  values.push(input.limit ?? 1000000);
  const limitParam = `$${values.length}::int`;
  const result = await query<WorkspaceAiAssistActivityRow>(
    buildAiAssistActivityRowsQuery(`
      SELECT
        e.id,
        e.actor_user_id,
        e.conversation_id,
        e.feature,
        e.action,
        e.metadata_json,
        e.created_at
      FROM ai_assist_events e
      WHERE ${conditions.join("\n        AND ")}
      ORDER BY e.created_at DESC, e.id DESC
      LIMIT ${limitParam}
    `),
    values
  );

  return result.rows;
}
