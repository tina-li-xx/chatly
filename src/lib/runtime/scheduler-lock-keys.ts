import "server-only";

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
    globalStoreKey: "__chatlyConversationTemplateEmailScheduler__",
    intervalMs: 60 * 1000,
    jobKey: "scheduler.conversation_template_email_retries",
    lockKey: [4301, 1]
  },
  dailyDigest: {
    failureMessage: "daily digest scheduler failed",
    globalStoreKey: "__chatlyDailyDigestScheduler__",
    intervalMs: 60 * 60 * 1000,
    jobKey: "scheduler.daily_digest",
    lockKey: [4301, 2]
  },
  growthLifecycle: {
    failureMessage: "growth lifecycle scheduler failed",
    globalStoreKey: "__chatlyGrowthLifecycleScheduler__",
    intervalMs: 60 * 60 * 1000,
    jobKey: "scheduler.growth_lifecycle",
    lockKey: [4301, 3]
  },
  weeklyPerformance: {
    failureMessage: "weekly performance scheduler failed",
    globalStoreKey: "__chatlyWeeklyPerformanceScheduler__",
    intervalMs: 60 * 60 * 1000,
    jobKey: "scheduler.weekly_performance",
    lockKey: [4301, 4]
  }
} satisfies Record<string, WindowedSchedulerConfig>;
