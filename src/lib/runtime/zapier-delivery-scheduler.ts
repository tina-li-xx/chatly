import "server-only";

import { schedulerConfigs } from "@/lib/runtime/scheduler-lock-keys";
import { createWindowedScheduler } from "@/lib/runtime/windowed-scheduler";

export const zapierDeliveryScheduler = createWindowedScheduler(
  schedulerConfigs.zapierDelivery,
  async () => {
    const { runScheduledZapierDeliveries } = await import(
      "@/lib/zapier-delivery-runner"
    );
    await runScheduledZapierDeliveries();
  }
);
