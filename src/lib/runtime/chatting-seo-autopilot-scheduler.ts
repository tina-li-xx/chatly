import "server-only";

import { schedulerConfigs } from "@/lib/runtime/scheduler-lock-keys";
import { createWindowedScheduler } from "@/lib/runtime/windowed-scheduler";

export const chattingSeoAutopilotScheduler = createWindowedScheduler(
  schedulerConfigs.chattingSeoAutopilot,
  async () => {
    const { runChattingSeoAutopilot } = await import("@/lib/chatting-seo-autopilot");
    await runChattingSeoAutopilot();
  }
);
