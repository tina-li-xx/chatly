import type { Pool } from "pg";

export async function runUserSchemaInitialization(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      onboarding_step TEXT NOT NULL DEFAULT 'done',
      onboarding_completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS onboarding_step TEXT NOT NULL DEFAULT 'done';
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
  `);

  await pool.query(`
    ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_onboarding_step_check;
  `);

  await pool.query(`
    ALTER TABLE users
    ADD CONSTRAINT users_onboarding_step_check
    CHECK (onboarding_step IN ('signup', 'team', 'customize', 'install', 'done'));
  `);

  await pool.query(`
    UPDATE users
    SET onboarding_completed_at = COALESCE(onboarding_completed_at, created_at)
    WHERE onboarding_step = 'done'
      AND onboarding_completed_at IS NULL;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_email_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      type TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      consumed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE auth_email_tokens
    DROP CONSTRAINT IF EXISTS auth_email_tokens_type_check;
  `);

  await pool.query(`
    ALTER TABLE auth_email_tokens
    ADD CONSTRAINT auth_email_tokens_type_check
    CHECK (type IN ('password_reset', 'email_verification'));
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      job_title TEXT NOT NULL DEFAULT '',
      avatar_data_url TEXT,
      notification_email TEXT,
      reply_to_email TEXT,
      email_templates_json TEXT NOT NULL DEFAULT '',
      browser_notifications BOOLEAN NOT NULL DEFAULT TRUE,
      sound_alerts BOOLEAN NOT NULL DEFAULT TRUE,
      email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
      new_visitor_alerts BOOLEAN NOT NULL DEFAULT FALSE,
      high_intent_alerts BOOLEAN NOT NULL DEFAULT TRUE,
      assignment_notifications BOOLEAN NOT NULL DEFAULT TRUE,
      mention_notifications BOOLEAN NOT NULL DEFAULT TRUE,
      quiet_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      quiet_hours_start TEXT NOT NULL DEFAULT '22:00',
      quiet_hours_end TEXT NOT NULL DEFAULT '08:00',
      timezone TEXT,
      email_signature TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE user_settings
    ADD COLUMN IF NOT EXISTS email_templates_json TEXT NOT NULL DEFAULT '';
  `);

  await pool.query(`
    ALTER TABLE user_settings
    ALTER COLUMN email_templates_json SET DEFAULT '';
  `);

  await pool.query(`
    ALTER TABLE user_settings
    ADD COLUMN IF NOT EXISTS timezone TEXT;
  `);

  await pool.query(`
    UPDATE user_settings
    SET timezone = NULL
    WHERE timezone = '';
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS team_invites (
      id TEXT PRIMARY KEY,
      owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      accepted_at TIMESTAMPTZ,
      accepted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE team_invites
    ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
  `);

  await pool.query(`
    ALTER TABLE team_invites
    ADD COLUMN IF NOT EXISTS accepted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
  `);

  await pool.query(`
    ALTER TABLE team_invites
    DROP CONSTRAINT IF EXISTS team_invites_role_check;
  `);

  await pool.query(`
    ALTER TABLE team_invites
    ADD CONSTRAINT team_invites_role_check
    CHECK (role IN ('admin', 'member'));
  `);

  await pool.query(`
    ALTER TABLE team_invites
    DROP CONSTRAINT IF EXISTS team_invites_status_check;
  `);

  await pool.query(`
    ALTER TABLE team_invites
    ADD CONSTRAINT team_invites_status_check
    CHECK (status IN ('pending', 'accepted', 'revoked'));
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS team_memberships (
      owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      member_user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (owner_user_id, member_user_id)
    );
  `);

  await pool.query(`
    ALTER TABLE team_memberships
    DROP CONSTRAINT IF EXISTS team_memberships_role_check;
  `);

  await pool.query(`
    ALTER TABLE team_memberships
    DROP CONSTRAINT IF EXISTS team_memberships_member_unique;
  `);

  await pool.query(`
    ALTER TABLE team_memberships
    ADD CONSTRAINT team_memberships_member_unique
    UNIQUE (member_user_id);
  `);

  await pool.query(`
    ALTER TABLE team_memberships
    ADD CONSTRAINT team_memberships_role_check
    CHECK (role IN ('admin', 'member'));
  `);

  await pool.query(`
    ALTER TABLE team_memberships
    DROP CONSTRAINT IF EXISTS team_memberships_status_check;
  `);

  await pool.query(`
    ALTER TABLE team_memberships
    ADD CONSTRAINT team_memberships_status_check
    CHECK (status IN ('active', 'revoked'));
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_presence (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS growth_email_nudges (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      nudge_key TEXT NOT NULL,
      last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, nudge_key)
    );
  `);
}
