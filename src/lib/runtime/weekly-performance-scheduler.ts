import "server-only";

import { schedulerConfigs } from "@/lib/runtime/scheduler-lock-keys";
import { createWindowedScheduler } from "@/lib/runtime/windowed-scheduler";

export const weeklyPerformanceScheduler = createWindowedScheduler(
  schedulerConfigs.weeklyPerformance,
  async () => {
    const { runScheduledWeeklyPerformanceEmails } = await import(
      "@/lib/weekly-performance"
    );
    await runScheduledWeeklyPerformanceEmails();
  }
);
