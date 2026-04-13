import { query } from "@/lib/db";
import type { SeoPlanRunStatus } from "@/lib/seo-planning-types";
import {
  SEO_PLAN_RUN_COLUMNS,
  type SeoPlanRunRow
} from "@/lib/repositories/seo-pipeline-repository-shared";

export async function listSeoPlanRunRows(ownerUserId: string, limit = 20) {
  const result = await query<SeoPlanRunRow>(
    `
      SELECT
        ${SEO_PLAN_RUN_COLUMNS}
      FROM seo_plan_runs
      WHERE owner_user_id = $1
      ORDER BY COALESCE(generated_at, updated_at, created_at) DESC, created_at DESC
      LIMIT $2
    `,
    [ownerUserId, limit]
  );

  return result.rows;
}

export async function findSeoPlanRunRow(ownerUserId: string, id: string) {
  const result = await query<SeoPlanRunRow>(
    `
      SELECT
        ${SEO_PLAN_RUN_COLUMNS}
      FROM seo_plan_runs
      WHERE owner_user_id = $1
        AND id = $2
      LIMIT 1
    `,
    [ownerUserId, id]
  );

  return result.rows[0] ?? null;
}

export async function insertSeoPlanRunRow(input: {
  id: string;
  ownerUserId: string;
  actorUserId?: string | null;
  sourceProfileSlug?: string;
  status?: SeoPlanRunStatus;
  strategySnapshotJson?: Record<string, unknown>;
  summaryJson?: Record<string, unknown>;
  generatedAt?: string | null;
}) {
  const result = await query<SeoPlanRunRow>(
    `
      INSERT INTO seo_plan_runs (
        id,
        owner_user_id,
        actor_user_id,
        source_profile_slug,
        status,
        strategy_snapshot_json,
        summary_json,
        generated_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, NOW())
      RETURNING
        ${SEO_PLAN_RUN_COLUMNS}
    `,
    [
      input.id,
      input.ownerUserId,
      input.actorUserId ?? null,
      input.sourceProfileSlug ?? "chatting-default",
      input.status ?? "draft",
      JSON.stringify(input.strategySnapshotJson ?? {}),
      JSON.stringify(input.summaryJson ?? {}),
      input.generatedAt ?? null
    ]
  );

  return result.rows[0] ?? null;
}

export async function updateSeoPlanRunStatus(input: {
  id: string;
  ownerUserId: string;
  status: SeoPlanRunStatus;
  summaryJson?: Record<string, unknown> | null;
  generatedAt?: string | null;
}) {
  const result = await query<SeoPlanRunRow>(
    `
      UPDATE seo_plan_runs
      SET status = $3,
          summary_json = COALESCE($4::jsonb, summary_json),
          generated_at = COALESCE($5, generated_at),
          updated_at = NOW()
      WHERE id = $1
        AND owner_user_id = $2
      RETURNING
        ${SEO_PLAN_RUN_COLUMNS}
    `,
    [
      input.id,
      input.ownerUserId,
      input.status,
      input.summaryJson ? JSON.stringify(input.summaryJson) : null,
      input.generatedAt ?? null
    ]
  );

  return result.rows[0] ?? null;
}
