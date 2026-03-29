import { getDashboardBillingSummary } from "@/lib/data/billing";
import { buildActivation, buildHealth } from "@/lib/data/dashboard-growth-activation-health";
import { buildExpansion } from "@/lib/data/dashboard-growth-expansion";
import type { DashboardHomeGrowthData } from "@/lib/data/dashboard-growth-types";
import { getDashboardGrowthSnapshot } from "@/lib/repositories/dashboard-growth-repository";

export type { DashboardHomeGrowthData, DashboardHomeGrowthMetric } from "@/lib/data/dashboard-growth-types";

export async function getDashboardGrowthData(
  userId: string,
  userCreatedAt: string,
  hasWidgetInstalled: boolean,
  avgResponseSeconds: number | null
) {
  const [snapshot, billing] = await Promise.all([
    getDashboardGrowthSnapshot(userId),
    getDashboardBillingSummary(userId)
  ]);
  const totalConversations = Number(snapshot.total_conversations ?? 0);
  const currentVolume = Number(snapshot.conversations_last_7_days ?? 0);
  const previousVolume = Number(snapshot.conversations_previous_7_days ?? 0);
  const loginsLast7Days = Number(snapshot.login_sessions_last_7_days ?? 0);
  const now = new Date();

  return {
    activation: buildActivation(
      userCreatedAt,
      hasWidgetInstalled,
      totalConversations,
      snapshot.first_conversation_at,
      now
    ),
    health: buildHealth(
      totalConversations,
      currentVolume,
      previousVolume,
      avgResponseSeconds,
      loginsLast7Days,
      snapshot.last_login_at
    ),
    expansion: buildExpansion(billing)
  } satisfies DashboardHomeGrowthData;
}
