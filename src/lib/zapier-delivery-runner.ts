import "server-only";

import {
  listDueWorkspaceZapierDeliveryRows,
  updateWorkspaceZapierDeliveryRow
} from "@/lib/repositories/zapier-deliveries-repository";
import { recordWorkspaceZapierWebhookDelivery } from "@/lib/repositories/zapier-webhooks-repository";
import type { ZapierEventPayload } from "@/lib/zapier-event-payloads";
import {
  getZapierNextAttemptAt,
  shouldRetryZapierStatus,
  trimZapierResponseBody,
  ZAPIER_DELIVERY_BATCH_SIZE,
  ZAPIER_DELIVERY_MAX_ATTEMPTS
} from "@/lib/zapier-delivery-shared";

async function recordAttempt(input: {
  id: string;
  ownerUserId: string;
  webhookId: string;
  attemptCount: number;
  deliveredAt?: string | null;
  nextAttemptAt?: string | null;
  lastAttemptAt: string;
  lastResponseCode: number;
  lastResponseBody: string | null;
}) {
  await Promise.all([
    recordWorkspaceZapierWebhookDelivery({
      id: input.webhookId,
      ownerUserId: input.ownerUserId,
      lastTriggeredAt: input.lastAttemptAt,
      lastResponseCode: input.lastResponseCode,
      lastResponseBody: input.lastResponseBody
    }),
    updateWorkspaceZapierDeliveryRow({
      id: input.id,
      ownerUserId: input.ownerUserId,
      attemptCount: input.attemptCount,
      nextAttemptAt: input.nextAttemptAt ?? null,
      deliveredAt: input.deliveredAt ?? null,
      lastAttemptAt: input.lastAttemptAt,
      lastResponseCode: input.lastResponseCode,
      lastResponseBody: input.lastResponseBody
    })
  ]);
}

async function processDelivery(row: Awaited<ReturnType<typeof listDueWorkspaceZapierDeliveryRows>>[number]) {
  const timestamp = new Date().toISOString();
  const attemptCount = row.attempt_count + 1;
  const payload = JSON.parse(row.payload_json) as ZapierEventPayload;

  try {
    const response = await fetch(row.target_url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const responseBody = trimZapierResponseBody(await response.text().catch(() => ""));
    const canRetry =
      attemptCount < ZAPIER_DELIVERY_MAX_ATTEMPTS &&
      shouldRetryZapierStatus(response.status);

    await recordAttempt({
      id: row.id,
      ownerUserId: row.owner_user_id,
      webhookId: row.webhook_id,
      attemptCount,
      deliveredAt: response.ok ? timestamp : null,
      nextAttemptAt: response.ok || !canRetry ? null : getZapierNextAttemptAt(attemptCount),
      lastAttemptAt: timestamp,
      lastResponseCode: response.status,
      lastResponseBody: responseBody || null
    });
  } catch (error) {
    const responseBody =
      error instanceof Error ? trimZapierResponseBody(error.message) : "unknown-error";
    const canRetry = attemptCount < ZAPIER_DELIVERY_MAX_ATTEMPTS;

    await recordAttempt({
      id: row.id,
      ownerUserId: row.owner_user_id,
      webhookId: row.webhook_id,
      attemptCount,
      nextAttemptAt: canRetry ? getZapierNextAttemptAt(attemptCount) : null,
      lastAttemptAt: timestamp,
      lastResponseCode: 0,
      lastResponseBody: responseBody
    });
  }
}

export async function runScheduledZapierDeliveries() {
  while (true) {
    const rows = await listDueWorkspaceZapierDeliveryRows(
      ZAPIER_DELIVERY_BATCH_SIZE
    );

    if (rows.length === 0) {
      return;
    }

    for (const row of rows) {
      await processDelivery(row);
    }

    if (rows.length < ZAPIER_DELIVERY_BATCH_SIZE) {
      return;
    }
  }
}
