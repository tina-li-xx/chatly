import "server-only";

import { schedulerConfigs } from "@/lib/runtime/scheduler-lock-keys";
import { createWindowedScheduler } from "@/lib/runtime/windowed-scheduler";

export const dailyDigestScheduler = createWindowedScheduler(
  schedulerConfigs.dailyDigest,
  async () => {
    const { runScheduledDailyDigests } = await import("@/lib/daily-digest");
    await runScheduledDailyDigests();
  }
);
