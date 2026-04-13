import "server-only";

import { listSeoPlanItemRows } from "@/lib/repositories/seo-plan-items-repository";
import { listSeoPlanRunRows } from "@/lib/repositories/seo-plan-runs-repository";

export async function listDashboardPublishingPlanRunEntries(ownerUserId: string, limit = 6) {
  const runs = await listSeoPlanRunRows(ownerUserId, limit);
  return Promise.all(
    runs.map(async (run) => ({
      run,
      items: await listSeoPlanItemRows(ownerUserId, run.id)
    }))
  );
}
