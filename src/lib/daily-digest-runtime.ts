import type { AnalyticsDataset } from "@/lib/data/analytics";
import { getAnalyticsDatasetForOwnerUserId } from "@/lib/data/analytics";
import { mapSummary, queryConversationSummaries } from "@/lib/data/shared";
import { releaseDailyDigestDelivery } from "@/lib/repositories/daily-digest-repository";
import { withRetryableDatabaseConnectionRetry } from "@/lib/retryable-database-errors";
import type { ConversationSummary } from "@/lib/types";

export type DailyDigestWorkspaceData = {
  dataset: AnalyticsDataset;
  summaries: ConversationSummary[];
};

export class DailyDigestCleanupError extends Error {
  constructor(
    readonly sendError: unknown,
    readonly cleanupError: unknown
  ) {
    super("daily digest delivery cleanup failed");
    this.name = "DailyDigestCleanupError";
  }
}

export function withDailyDigestRetry<T>(task: () => Promise<T>, maxAttempts = 2) {
  return withRetryableDatabaseConnectionRetry(task, maxAttempts);
}

export async function cleanupClaimedDailyDigestDelivery(input: {
  userId: string;
  ownerUserId: string;
  deliveryDateKey: string;
  sendError: unknown;
}) {
  try {
    await withRetryableDatabaseConnectionRetry(
      () =>
        releaseDailyDigestDelivery(
          input.userId,
          input.ownerUserId,
          input.deliveryDateKey
        ),
      3
    );
  } catch (cleanupError) {
    throw new DailyDigestCleanupError(input.sendError, cleanupError);
  }
}

export async function loadDailyDigestWorkspaceData(ownerUserId: string): Promise<DailyDigestWorkspaceData> {
  const [dataset, summariesResult] = await withRetryableDatabaseConnectionRetry(() =>
    Promise.all([
      getAnalyticsDatasetForOwnerUserId(ownerUserId),
      queryConversationSummaries(
        "s.user_id = $1",
        [ownerUserId],
        "ORDER BY c.last_message_at DESC NULLS LAST, c.updated_at DESC",
        ownerUserId
      )
    ])
  );

  return { dataset, summaries: summariesResult.rows.map(mapSummary) };
}

export function createDailyDigestWorkspaceDataLoader() {
  const cache = new Map<string, Promise<DailyDigestWorkspaceData>>();

  return async (ownerUserId: string) => {
    const cached = cache.get(ownerUserId);
    if (cached) return cached;

    const pending = loadDailyDigestWorkspaceData(ownerUserId).catch((error) => {
      cache.delete(ownerUserId);
      throw error;
    });

    cache.set(ownerUserId, pending);
    return pending;
  };
}
