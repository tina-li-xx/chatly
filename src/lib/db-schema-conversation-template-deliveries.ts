import type { Pool } from "pg";

export async function runConversationTemplateDeliverySchemaInitialization(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_template_deliveries (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      template_key TEXT NOT NULL,
      delivery_key TEXT NOT NULL UNIQUE,
      recipient_email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempt_count INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      last_attempt_at TIMESTAMPTZ,
      next_attempt_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      sent_at TIMESTAMPTZ
    );
  `);

  await pool.query(`
    ALTER TABLE email_template_deliveries
    ADD COLUMN IF NOT EXISTS user_id TEXT;
  `);

  await pool.query(`
    ALTER TABLE email_template_deliveries
    DROP CONSTRAINT IF EXISTS email_template_deliveries_user_id_fkey;
  `);

  await pool.query(`
    ALTER TABLE email_template_deliveries
    ADD CONSTRAINT email_template_deliveries_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  `);

  await pool.query(`
    ALTER TABLE email_template_deliveries
    ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0;
  `);

  await pool.query(`
    ALTER TABLE email_template_deliveries
    ADD COLUMN IF NOT EXISTS last_error TEXT;
  `);

  await pool.query(`
    ALTER TABLE email_template_deliveries
    ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ;
  `);

  await pool.query(`
    ALTER TABLE email_template_deliveries
    ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ;
  `);

  await pool.query(`
    UPDATE email_template_deliveries etd
    SET user_id = s.user_id
    FROM conversations c
    INNER JOIN sites s
      ON s.id = c.site_id
    WHERE etd.conversation_id = c.id
      AND etd.user_id IS NULL;
  `);

  await pool.query(`
    UPDATE email_template_deliveries
    SET next_attempt_at = created_at
    WHERE next_attempt_at IS NULL
      AND status = 'pending';
  `);

  await pool.query(`
    ALTER TABLE email_template_deliveries
    DROP CONSTRAINT IF EXISTS email_template_deliveries_status_check;
  `);

  await pool.query(`
    ALTER TABLE email_template_deliveries
    ADD CONSTRAINT email_template_deliveries_status_check
    CHECK (status IN ('pending', 'failed', 'sent'));
  `);
}
