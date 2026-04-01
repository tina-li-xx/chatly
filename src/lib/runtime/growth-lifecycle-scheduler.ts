import "server-only";

import { schedulerConfigs } from "@/lib/runtime/scheduler-lock-keys";
import { createWindowedScheduler } from "@/lib/runtime/windowed-scheduler";

export const growthLifecycleScheduler = createWindowedScheduler(
  schedulerConfigs.growthLifecycle,
  async () => {
    const { runScheduledGrowthLifecycleEmails } = await import(
      "@/lib/growth-outreach-runner"
    );
    await runScheduledGrowthLifecycleEmails();
  }
);
