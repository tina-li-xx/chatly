import "server-only";

import { JOB_SCHEDULES } from "@/lib/job-schedules";
import type { PostgresAdvisoryLockKey } from "@/lib/postgres-advisory-lock";

export type WindowedSchedulerConfig = {
  failureMessage: string;
  globalStoreKey: string;
  intervalMs: number;
  jobKey: string;
  lockKey: PostgresAdvisoryLockKey;
};

export const schedulerConfigs = {
  conversationTemplateEmail: {
    failureMessage: "conversation template email scheduler failed",
    globalStoreKey: "__chattingConversationTemplateEmailScheduler__",
    intervalMs: JOB_SCHEDULES.conversationTemplateEmail.intervalMs,
    jobKey: "scheduler.conversation_template_email_retries",
    lockKey: [4301, 1]
  },
  dailyDigest: {
    failureMessage: "daily digest scheduler failed",
    globalStoreKey: "__chattingDailyDigestScheduler__",
    intervalMs: JOB_SCHEDULES.dailyDigest.intervalMs,
    jobKey: "scheduler.daily_digest",
    lockKey: [4301, 2]
  },
  growthLifecycle: {
    failureMessage: "growth lifecycle scheduler failed",
    globalStoreKey: "__chattingGrowthLifecycleScheduler__",
    intervalMs: JOB_SCHEDULES.growthLifecycle.intervalMs,
    jobKey: "scheduler.growth_lifecycle",
    lockKey: [4301, 3]
  },
  weeklyPerformance: {
    failureMessage: "weekly performance scheduler failed",
    globalStoreKey: "__chattingWeeklyPerformanceScheduler__",
    intervalMs: JOB_SCHEDULES.weeklyPerformance.intervalMs,
    jobKey: "scheduler.weekly_performance",
    lockKey: [4301, 4]
  },
  zapierDelivery: {
    failureMessage: "zapier delivery scheduler failed",
    globalStoreKey: "__chattingZapierDeliveryScheduler__",
    intervalMs: JOB_SCHEDULES.zapierDelivery.intervalMs,
    jobKey: "scheduler.zapier_delivery",
    lockKey: [4301, 5]
  },
  chattingSeoAutopilot: {
    failureMessage: "chatting seo autopilot scheduler failed",
    globalStoreKey: "__chattingSeoAutopilotScheduler__",
    intervalMs: JOB_SCHEDULES.chattingSeoAutopilot.intervalMs,
    jobKey: "scheduler.chatting_seo_autopilot",
    lockKey: [4301, 6]
  }
} satisfies Record<string, WindowedSchedulerConfig>;
