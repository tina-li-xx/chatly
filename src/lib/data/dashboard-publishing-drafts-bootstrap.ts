import "server-only";

import { createHash } from "node:crypto";
import { generateDashboardPublishingDraft } from "@/lib/dashboard-publishing-draft-generation";
import { listDashboardPublishingPlanRunEntries } from "@/lib/data/dashboard-publishing-plan-run-entries";
import { currentAndUpcomingRuns } from "@/lib/dashboard-publishing-plan-run-state";
import { withPostgresAdvisoryLock } from "@/lib/postgres-advisory-lock";
import { listSeoGeneratedDraftRows } from "@/lib/repositories/seo-generated-drafts-repository";
import { isQueuedGeneratedDraftRow } from "@/lib/seo-generated-blog-posts";

const UPCOMING_DRAFT_BUFFER = 3;

function lockKey(ownerUserId: string) {
  const digest = createHash("sha256").update(ownerUserId).digest();
  return [20260413, digest.readInt32BE(0)] as const;
}

export async function ensureDashboardPublishingDraftAutopilot(input: {
  ownerUserId: string;
  actorUserId?: string | null;
}) {
  const entries = await listDashboardPublishingPlanRunEntries(input.ownerUserId, 6);
  const current = currentAndUpcomingRuns(entries).current;
  if (!current) {
    return [];
  }

  const lock = await withPostgresAdvisoryLock(lockKey(input.ownerUserId), async () => {
    const existingDrafts = await listSeoGeneratedDraftRows(input.ownerUserId, 50);
    const existingQueuedDraftCount = existingDrafts.filter((row) => isQueuedGeneratedDraftRow(row)).length;
    const draftSlots = Math.max(UPCOMING_DRAFT_BUFFER - existingQueuedDraftCount, 0);
    const generated = [];

    for (const item of current.items.filter((entry) => entry.status === "planned").slice(0, draftSlots)) {
      const result = await generateDashboardPublishingDraft({
        ownerUserId: input.ownerUserId,
        actorUserId: input.actorUserId,
        planItem: item,
        mode: "autopilot"
      });
      if (!result.created || !result.draft) {
        continue;
      }
      generated.push(result.draft);
    }

    return generated;
  });

  return lock.value ?? [];
}
