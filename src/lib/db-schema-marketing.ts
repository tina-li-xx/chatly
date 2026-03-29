import type { Pool } from "pg";

export async function runMarketingSchemaInitialization(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL DEFAULT 'blog',
      last_source TEXT NOT NULL DEFAULT 'blog',
      welcome_email_sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE newsletter_subscribers
    ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'blog';
  `);

  await pool.query(`
    ALTER TABLE newsletter_subscribers
    ADD COLUMN IF NOT EXISTS last_source TEXT NOT NULL DEFAULT 'blog';
  `);

  await pool.query(`
    ALTER TABLE newsletter_subscribers
    ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;
  `);

  await pool.query(`
    ALTER TABLE newsletter_subscribers
    DROP COLUMN IF EXISTS resend_contact_id;
  `);

  await pool.query(`
    UPDATE newsletter_subscribers
    SET source = 'blog'
    WHERE source IS NULL OR source = '';
  `);

  await pool.query(`
    UPDATE newsletter_subscribers
    SET last_source = COALESCE(NULLIF(last_source, ''), source, 'blog');
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tool_export_requests (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      tool_slug TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'free-tools',
      result_payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      delivery_sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE tool_export_requests
    ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'free-tools';
  `);

  await pool.query(`
    ALTER TABLE tool_export_requests
    ADD COLUMN IF NOT EXISTS result_payload_json JSONB NOT NULL DEFAULT '{}'::jsonb;
  `);

  await pool.query(`
    ALTER TABLE tool_export_requests
    ADD COLUMN IF NOT EXISTS delivery_sent_at TIMESTAMPTZ;
  `);
}
