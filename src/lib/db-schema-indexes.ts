import type { Pool } from "pg";

export async function runIndexSchemaInitialization(pool: Pool) {
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_users_email
      ON users(email);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_auth_sessions_token_hash
      ON auth_sessions(token_hash);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_sites_user_id
      ON sites(user_id, created_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
      ON conversations(updated_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_conversations_site_id
      ON conversations(site_id, updated_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at
      ON messages(conversation_id, created_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id
      ON message_attachments(message_id, created_at ASC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_email_template_deliveries_conversation
      ON email_template_deliveries(conversation_id, created_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_email_template_deliveries_retry_queue
      ON email_template_deliveries(status, next_attempt_at ASC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_tags_conversation_id
      ON tags(conversation_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_conversation_typing_lookup
      ON conversation_typing(conversation_id, expires_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_visitor_typing_lookup
      ON visitor_typing(conversation_id, expires_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_conversation_reads_user_id
      ON conversation_reads(user_id, updated_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_visitor_presence_site_last_seen
      ON visitor_presence_sessions(site_id, last_seen_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_visitor_presence_conversation_last_seen
      ON visitor_presence_sessions(conversation_id, last_seen_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_visitor_notes_site_updated_at
      ON visitor_notes(site_id, updated_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_team_invites_owner_status
      ON team_invites(owner_user_id, status, updated_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_team_memberships_member_status
      ON team_memberships(member_user_id, status, updated_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_team_memberships_owner_status
      ON team_memberships(owner_user_id, status, updated_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_billing_invoices_user_id
      ON billing_invoices(user_id, issued_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_billing_accounts_stripe_customer_id
      ON billing_accounts(stripe_customer_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_billing_accounts_stripe_subscription_id
      ON billing_accounts(stripe_subscription_id);
  `);
}
