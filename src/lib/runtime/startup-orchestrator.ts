import "server-only";

import { isProductionRuntime } from "@/lib/env";
import { normalizeEnvValue, type EnvSource } from "@/lib/env-core";

const ENABLE_RUNTIME_SCHEDULERS_ENV = "ENABLE_RUNTIME_SCHEDULERS";

type RuntimeScheduler = {
  start: () => void;
};

type RuntimeSchedulerConfig = {
  envVar: string;
  load: () => Promise<RuntimeScheduler>;
};

const runtimeSchedulerConfigs: RuntimeSchedulerConfig[] = [
  {
    envVar: "ENABLE_DAILY_DIGEST_SCHEDULER",
    load: async () => (await import("@/lib/runtime/daily-digest-scheduler")).dailyDigestScheduler
  },
  {
    envVar: "ENABLE_CHATTING_SEO_AUTOPILOT_SCHEDULER",
    load: async () => (await import("@/lib/runtime/chatting-seo-autopilot-scheduler")).chattingSeoAutopilotScheduler
  },
  {
    envVar: "ENABLE_GROWTH_LIFECYCLE_SCHEDULER",
    load: async () => (await import("@/lib/runtime/growth-lifecycle-scheduler")).growthLifecycleScheduler
  },
  {
    envVar: "ENABLE_ZAPIER_DELIVERY_SCHEDULER",
    load: async () => (await import("@/lib/runtime/zapier-delivery-scheduler")).zapierDeliveryScheduler
  },
  {
    envVar: "ENABLE_WEEKLY_PERFORMANCE_SCHEDULER",
    load: async () => (await import("@/lib/runtime/weekly-performance-scheduler")).weeklyPerformanceScheduler
  }
];

function parseEnvToggle(value: unknown) {
  const normalized = normalizeEnvValue(value).toLowerCase();
  if (!normalized) return null;
  if (["0", "false", "off", "no"].includes(normalized)) return false;
  if (["1", "true", "on", "yes"].includes(normalized)) return true;
  return true;
}

function areRuntimeSchedulersEnabled(source: EnvSource = process.env) {
  const explicit = parseEnvToggle(source[ENABLE_RUNTIME_SCHEDULERS_ENV]);
  if (explicit !== null) {
    return explicit;
  }

  return isProductionRuntime(source.NODE_ENV);
}

function isRuntimeSchedulerEnabled(envVar: string, source: EnvSource = process.env) {
  const explicit = parseEnvToggle(source[envVar]);
  if (explicit !== null) {
    return explicit;
  }

  return areRuntimeSchedulersEnabled(source);
}

export async function startNodeRuntimeServices(source: EnvSource = process.env) {
  const enabledSchedulers = runtimeSchedulerConfigs.filter((config) =>
    isRuntimeSchedulerEnabled(config.envVar, source)
  );

  if (!enabledSchedulers.length) {
    return;
  }

  const [
    {
      assertIntegrationsEnvConfigured,
      assertRedisLiveEnvConfigured,
      assertStartupProductionCoreEnvConfigured
    },
    { warmLiveEventBridge },
    ...schedulerModules
  ] = await Promise.all([
    import("@/lib/env.server"),
    import("@/lib/live-events"),
    ...enabledSchedulers.map((config) => config.load())
  ]);

  assertStartupProductionCoreEnvConfigured({ source });
  assertIntegrationsEnvConfigured({ source });
  assertRedisLiveEnvConfigured({ source });
  await warmLiveEventBridge();
  schedulerModules.forEach((scheduler) => scheduler.start());
}
