import { query } from "@/lib/db";
import type { BillingPlanKey } from "@/lib/billing-plans";
import type { DashboardEmailTemplateKey } from "@/lib/email-templates";

type RetryableTemplateDeliveryRow = {
  conversation_id: string;
  user_id: string | null;
  template_key: DashboardEmailTemplateKey;
  delivery_key: string;
  attempt_count: number;
};

export async function findConversationTemplateContext(conversationId: string) {
  const result = await query<{
    conversation_id: string;
    site_id: string;
    session_id: string;
    user_id: string;
    site_name: string;
    email: string | null;
    plan_key: BillingPlanKey | null;
  }>(
    `
      SELECT
        c.id AS conversation_id,
        c.site_id,
        c.session_id,
        s.user_id,
        s.name AS site_name,
        c.email,
        ba.plan_key
      FROM conversations c
      INNER JOIN sites s
        ON s.id = c.site_id
      LEFT JOIN billing_accounts ba
        ON ba.user_id = s.user_id
      WHERE c.id = $1
      LIMIT 1
    `,
    [conversationId]
  );

  return result.rows[0] ?? null;
}

export async function listConversationTranscriptRows(conversationId: string) {
  const result = await query<{
    id: string;
    sender: "user" | "founder";
    content: string;
    created_at: string;
  }>(
    `
      SELECT id, sender, content, created_at
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `,
    [conversationId]
  );

  return result.rows;
}

export async function claimTemplateDelivery(input: {
  deliveryId: string;
  conversationId: string;
  userId: string;
  templateKey: DashboardEmailTemplateKey;
  deliveryKey: string;
  recipientEmail: string;
  nextAttemptAt: Date;
}) {
  const result = await query<{ id: string }>(
    `
      INSERT INTO email_template_deliveries (
        id,
        conversation_id,
        user_id,
        template_key,
        delivery_key,
        recipient_email,
        status,
        created_at,
        next_attempt_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW(), $7)
      ON CONFLICT (delivery_key) DO NOTHING
      RETURNING id
    `,
    [
      input.deliveryId,
      input.conversationId,
      input.userId,
      input.templateKey,
      input.deliveryKey,
      input.recipientEmail,
      input.nextAttemptAt.toISOString()
    ]
  );

  return Boolean(result.rowCount);
}

export async function markTemplateDeliverySent(deliveryKey: string) {
  await query(
    `
      UPDATE email_template_deliveries
      SET status = 'sent',
          attempt_count = attempt_count + 1,
          last_error = NULL,
          last_attempt_at = NOW(),
          next_attempt_at = NULL,
          sent_at = NOW()
      WHERE delivery_key = $1
    `,
    [deliveryKey]
  );
}

export async function markTemplateDeliveryFailed(input: {
  deliveryKey: string;
  errorMessage: string;
  nextAttemptAt: Date;
}) {
  await query(
    `
      UPDATE email_template_deliveries
      SET status = 'failed',
          attempt_count = attempt_count + 1,
          last_error = $2,
          last_attempt_at = NOW(),
          next_attempt_at = $3,
          sent_at = NULL
      WHERE delivery_key = $1
    `,
    [input.deliveryKey, input.errorMessage, input.nextAttemptAt.toISOString()]
  );
}

export async function claimRetryableTemplateDeliveries(input: {
  now: Date;
  leaseUntil: Date;
  limit: number;
}) {
  const result = await query<RetryableTemplateDeliveryRow>(
    `
      WITH due AS (
        SELECT id
        FROM email_template_deliveries
        WHERE status IN ('pending', 'failed')
          AND next_attempt_at IS NOT NULL
          AND next_attempt_at <= $1
        ORDER BY next_attempt_at ASC, created_at ASC
        LIMIT $2
        FOR UPDATE SKIP LOCKED
      )
      UPDATE email_template_deliveries etd
      SET next_attempt_at = $3
      FROM due
      WHERE etd.id = due.id
      RETURNING
        etd.conversation_id,
        etd.user_id,
        etd.template_key,
        etd.delivery_key,
        etd.attempt_count
    `,
    [input.now.toISOString(), input.limit, input.leaseUntil.toISOString()]
  );

  return result.rows.map((row) => ({
    conversationId: row.conversation_id,
    userId: row.user_id,
    templateKey: row.template_key,
    deliveryKey: row.delivery_key,
    attemptCount: row.attempt_count
  }));
}

export async function listStoredMessageAttachments(messageId: string) {
  const result = await query<{
    file_name: string;
    content_type: string;
    content: Buffer;
  }>(
    `
      SELECT file_name, content_type, content
      FROM message_attachments
      WHERE message_id = $1
      ORDER BY created_at ASC
    `,
    [messageId]
  );

  return result.rows;
}
