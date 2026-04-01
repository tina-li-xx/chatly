import type { Pool } from "pg";
import { runConversationTemplateDeliverySchemaInitialization } from "./db-schema-conversation-template-deliveries";

export async function runConversationSchemaInitialization(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      email TEXT,
      session_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE conversations
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open';
  `);

  await pool.query(`
    UPDATE conversations
    SET status = 'open'
    WHERE status IS NULL;
  `);

  await pool.query(`
    ALTER TABLE conversations
    DROP CONSTRAINT IF EXISTS conversations_status_check;
  `);

  await pool.query(`
    ALTER TABLE conversations
    ADD CONSTRAINT conversations_status_check
    CHECK (status IN ('open', 'resolved'));
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender TEXT NOT NULL CHECK (sender IN ('user', 'founder')),
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversation_metadata (
      conversation_id TEXT PRIMARY KEY REFERENCES conversations(id) ON DELETE CASCADE,
      page_url TEXT,
      referrer TEXT,
      user_agent TEXT,
      country TEXT,
      region TEXT,
      city TEXT,
      timezone TEXT,
      locale TEXT
    );
  `);

  await pool.query(`
    ALTER TABLE conversation_metadata
    ADD COLUMN IF NOT EXISTS country TEXT;
  `);

  await pool.query(`
    ALTER TABLE conversation_metadata
    ADD COLUMN IF NOT EXISTS region TEXT;
  `);

  await pool.query(`
    ALTER TABLE conversation_metadata
    ADD COLUMN IF NOT EXISTS city TEXT;
  `);

  await pool.query(`
    ALTER TABLE conversation_metadata
    ADD COLUMN IF NOT EXISTS timezone TEXT;
  `);

  await pool.query(`
    ALTER TABLE conversation_metadata
    ADD COLUMN IF NOT EXISTS locale TEXT;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      conversation_id TEXT PRIMARY KEY REFERENCES conversations(id) ON DELETE CASCADE,
      rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE feedback
    ADD COLUMN IF NOT EXISTS rating SMALLINT;
  `);

  await pool.query(`
    ALTER TABLE feedback
    DROP CONSTRAINT IF EXISTS feedback_rating_check;
  `);

  await pool.query(`
    ALTER TABLE feedback
    ADD CONSTRAINT feedback_rating_check
    CHECK (rating BETWEEN 1 AND 5);
  `);

  await runConversationTemplateDeliverySchemaInitialization(pool);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversation_typing (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, conversation_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS visitor_typing (
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      session_id TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (conversation_id, session_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversation_reads (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, conversation_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS message_attachments (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      content_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      content BYTEA NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tags (
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      tag TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (conversation_id, tag)
    );
  `);
}
