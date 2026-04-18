import "server-only";

import { createHash } from "node:crypto";
import { JOB_SCHEDULES } from "@/lib/job-schedules";
import type { ZapierEventPayload } from "@/lib/zapier-event-payloads";

const ZAPIER_RETRY_DELAYS_MS = JOB_SCHEDULES.zapierDelivery.retryDelaysMs;

export const ZAPIER_DELIVERY_BATCH_SIZE = JOB_SCHEDULES.zapierDelivery.batchSize;
export const ZAPIER_DELIVERY_MAX_ATTEMPTS = ZAPIER_RETRY_DELAYS_MS.length;

export function trimZapierResponseBody(body: string) {
  return body.length > 1000 ? `${body.slice(0, 997)}...` : body;
}

export function buildZapierEventKey(payload: ZapierEventPayload) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function shouldRetryZapierStatus(status: number) {
  return status === 0 || status === 408 || status === 429 || status >= 500;
}

export function getZapierNextAttemptAt(attemptCount: number) {
  const delayMs = ZAPIER_RETRY_DELAYS_MS[attemptCount - 1];
  if (!delayMs) {
    return null;
  }

  return new Date(Date.now() + delayMs).toISOString();
}
