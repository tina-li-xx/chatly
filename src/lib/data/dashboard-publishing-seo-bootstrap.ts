import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { chattingSeoProfile } from "@/lib/chatting-seo-profile";
import { getChattingSeoGeneratedPlan } from "@/lib/chatting-seo-plan";
import { listDashboardPublishingPlanRunEntries } from "@/lib/data/dashboard-publishing-plan-run-entries";
import {
  countRemainingPlannedItems,
  currentAndUpcomingRuns,
  DASHBOARD_PUBLISHING_NEXT_RUN_THRESHOLD,
  latestPlanTargetPublishAt,
  withDashboardPublishingPlanRunRole
} from "@/lib/dashboard-publishing-plan-run-state";
import { withPostgresAdvisoryLock } from "@/lib/postgres-advisory-lock";
import type { ReplaceSeoPlanItemInput } from "@/lib/repositories/seo-pipeline-repository-shared";
import { replaceSeoPlanItemRows } from "@/lib/repositories/seo-plan-items-repository";
import {
  insertSeoPlanRunRow,
  updateSeoPlanRunStatus
} from "@/lib/repositories/seo-plan-runs-repository";

function lockKey(ownerUserId: string) {
  const digest = createHash("sha256").update(ownerUserId).digest();
  return [20260412, digest.readInt32BE(0)] as const;
}

function nextPublishDate(after: string, position: number) {
  const date = new Date(after);
  if (!Number.isFinite(date.getTime())) return null;
  date.setUTCHours(9, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + position + 1);
  return date.toISOString();
}

function alignPlanItems(items: ReplaceSeoPlanItemInput[], startsAfter: string | null) {
  return startsAfter
    ? items.map((item, index) => ({ ...item, position: index + 1, targetPublishAt: nextPublishDate(startsAfter, index) }))
    : items;
}

async function createDashboardPublishingPlanRun(input: {
  ownerUserId: string;
  actorUserId?: string | null;
  role: "current" | "upcoming";
  startsAfter?: string | null;
}) {
  const plan = await getChattingSeoGeneratedPlan({
    ownerUserId: input.ownerUserId,
    actorUserId: input.actorUserId ?? null
  });
  const items = alignPlanItems(plan.items, input.startsAfter ?? null);
  const generatedAt = plan.generatedAt;
  const summary = withDashboardPublishingPlanRunRole({
    source: "analysis-bootstrap",
    generatedAutomatically: true,
    planSource: plan.source,
    analysisSource: plan.analysis.source,
    researchSource: plan.analysis.researchSource,
    itemCount: items.length,
    planSummary: plan.summary
  }, input.role);
  const runId = `seo_run_${randomUUID()}`;
  const run = await insertSeoPlanRunRow({
    id: runId,
    ownerUserId: input.ownerUserId,
    actorUserId: input.actorUserId ?? null,
    sourceProfileSlug: input.role === "upcoming"
      ? "chatting-external-keyword-corpus-upcoming"
      : "chatting-external-keyword-corpus-bootstrap",
    status: "generating",
    strategySnapshotJson: {
      profile: chattingSeoProfile,
      analysis: plan.analysis
    } as Record<string, unknown>,
    summaryJson: summary
  });

  if (!run) {
    throw new Error("SEO_PLAN_BOOTSTRAP_RUN_INSERT_FAILED");
  }

  await replaceSeoPlanItemRows({
    ownerUserId: input.ownerUserId,
    runId,
    items
  });

  return updateSeoPlanRunStatus({
    id: runId,
    ownerUserId: input.ownerUserId,
    status: "ready",
    generatedAt,
    summaryJson: withDashboardPublishingPlanRunRole(summary, input.role, {
      keywordResearchMode: plan.analysis.researchSource === "live" ? "persisted-corpus" : "fallback",
      generatedAt,
      topKeywords: items.slice(0, 5).map((item) => item.targetKeyword)
    })
  });
}

export async function ensureDashboardPublishingSeoBootstrap(input: {
  ownerUserId: string;
  actorUserId?: string | null;
}) {
  const lock = await withPostgresAdvisoryLock(lockKey(input.ownerUserId), async () => {
    const entries = await listDashboardPublishingPlanRunEntries(input.ownerUserId, 6);
    let { current, upcoming } = currentAndUpcomingRuns(entries);

    if (!current && upcoming) {
      const promoted = await updateSeoPlanRunStatus({
        id: upcoming.run.id,
        ownerUserId: input.ownerUserId,
        status: upcoming.run.status,
        summaryJson: withDashboardPublishingPlanRunRole(upcoming.run.summary_json, "current")
      });
      current = promoted ? { run: promoted, items: upcoming.items, role: "current" } : null;
      upcoming = null;
    }

    if (!current) {
      return createDashboardPublishingPlanRun({
        ownerUserId: input.ownerUserId,
        actorUserId: input.actorUserId,
        role: "current"
      });
    }

    const remainingCurrentItems = countRemainingPlannedItems(current.items);
    if (remainingCurrentItems === 0) {
      const nextRun = upcoming?.run ?? await createDashboardPublishingPlanRun({
        ownerUserId: input.ownerUserId,
        actorUserId: input.actorUserId,
        role: "upcoming",
        startsAfter: latestPlanTargetPublishAt(current.items)
      });
      if (!nextRun) {
        throw new Error("SEO_PLAN_PROMOTION_RUN_MISSING");
      }
      await updateSeoPlanRunStatus({
        id: current.run.id,
        ownerUserId: input.ownerUserId,
        status: current.run.status,
        summaryJson: withDashboardPublishingPlanRunRole(current.run.summary_json, "historical")
      });
      return updateSeoPlanRunStatus({
        id: nextRun.id,
        ownerUserId: input.ownerUserId,
        status: nextRun.status,
        summaryJson: withDashboardPublishingPlanRunRole(nextRun.summary_json, "current")
      });
    }

    if (remainingCurrentItems < DASHBOARD_PUBLISHING_NEXT_RUN_THRESHOLD && !upcoming) {
      await createDashboardPublishingPlanRun({
        ownerUserId: input.ownerUserId,
        actorUserId: input.actorUserId,
        role: "upcoming",
        startsAfter: latestPlanTargetPublishAt(current.items)
      });
    }

    return current.run;
  });

  return lock.value ?? null;
}
