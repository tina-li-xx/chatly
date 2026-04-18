const MINUTE_MS = 60 * 1000; // 60,000 ms
const HOUR_MS = 60 * MINUTE_MS; // 3,600,000 ms
const HALF_DAY_MS = 12 * HOUR_MS; // 43,200,000 ms
const DAY_MS = 24 * HOUR_MS; // 86,400,000 ms

const DEFAULT_REPORT_SEND_TIME = {
  hour: 9,
  minute: 0
} as const;

export const JOB_TIME_MS = {
  day: DAY_MS,
  hour: HOUR_MS,
  minute: MINUTE_MS
} as const;

export const JOB_SCHEDULES = {
  conversationTemplateEmail: {
    intervalMs: MINUTE_MS, // every 1 minute
    retry: {
      initialDelayMs: 5 * MINUTE_MS, // 300,000 ms (5 minutes)
      leaseMs: 5 * MINUTE_MS, // 300,000 ms (5 minutes)
      maxDelayMs: 6 * HOUR_MS // 21,600,000 ms (6 hours)
    }
  },
  dailyDigest: {
    defaultSendTime: DEFAULT_REPORT_SEND_TIME,
    intervalMs: HALF_DAY_MS // every 12 hours
  },
  growthLifecycle: {
    intervalMs: DAY_MS // every 24 hours
  },
  workspaceCoaching: {
    defaultSendTime: DEFAULT_REPORT_SEND_TIME,
    intervalMs: HOUR_MS // every 1 hour
  },
  chattingSeoAutopilot: {
    intervalMs: DAY_MS // every 24 hours
  },
  weeklyPerformance: {
    defaultSendTime: DEFAULT_REPORT_SEND_TIME,
    intervalMs: HALF_DAY_MS // every 12 hours
  },
  zapierDelivery: {
    batchSize: 25,
    intervalMs: DAY_MS, // every 24 hours
    retryDelaysMs: [MINUTE_MS, 5 * MINUTE_MS, 30 * MINUTE_MS] // 1m, 5m, 30m
  }
} as const;

export const REPORT_SEND_TIME = DEFAULT_REPORT_SEND_TIME;
