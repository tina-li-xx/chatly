import "server-only";

import { randomUUID } from "node:crypto";
import {
  insertWorkspaceZapierDeliveryRow,
} from "@/lib/repositories/zapier-deliveries-repository";
import {
  listActiveWorkspaceZapierWebhookRows,
  type ZapierEventType
} from "@/lib/repositories/zapier-webhooks-repository";
import type { ZapierEventPayload } from "@/lib/zapier-event-payloads";
import { buildZapierEventKey } from "@/lib/zapier-delivery-shared";

type DeliveryInput = {
  ownerUserId: string;
  eventType: ZapierEventType;
  payload: ZapierEventPayload;
};

export async function deliverZapierEvent(input: DeliveryInput) {
  const webhooks = await listActiveWorkspaceZapierWebhookRows({
    ownerUserId: input.ownerUserId,
    eventType: input.eventType
  });
  const payloadJson = JSON.stringify(input.payload);
  const eventKey = buildZapierEventKey(input.payload);

  await Promise.all(
    webhooks.map((webhook) =>
      insertWorkspaceZapierDeliveryRow({
        id: randomUUID(),
        ownerUserId: input.ownerUserId,
        webhookId: webhook.id,
        eventType: input.eventType,
        eventKey,
        payloadJson
      })
    )
  );
}
