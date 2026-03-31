import type { Pool } from "pg";
import { runSiteWidgetCopySchemaInitialization } from "./db-schema-site-widget-copy";

export async function runSiteSchemaInitialization(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      domain TEXT,
      brand_color TEXT NOT NULL DEFAULT '#2563EB',
      widget_title TEXT NOT NULL DEFAULT 'Talk to the team',
      greeting_text TEXT NOT NULL DEFAULT 'Hi there. Have a question? We''re here to help.',
      launcher_position TEXT NOT NULL DEFAULT 'right',
      avatar_style TEXT NOT NULL DEFAULT 'initials',
      team_photo_url TEXT,
      team_photo_key TEXT,
      show_online_status BOOLEAN NOT NULL DEFAULT TRUE,
      require_email_offline BOOLEAN NOT NULL DEFAULT FALSE,
      sound_notifications BOOLEAN NOT NULL DEFAULT FALSE,
      auto_open_paths TEXT[] NOT NULL DEFAULT '{}',
      response_time_mode TEXT NOT NULL DEFAULT 'minutes',
      operating_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      operating_hours_timezone TEXT NOT NULL DEFAULT 'UTC',
      operating_hours_json TEXT NOT NULL DEFAULT '',
      widget_install_verified_at TIMESTAMPTZ,
      widget_install_verified_url TEXT,
      widget_last_seen_at TIMESTAMPTZ,
      widget_last_seen_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS widget_title TEXT NOT NULL DEFAULT 'Talk to the team';
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS launcher_position TEXT NOT NULL DEFAULT 'right';
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS avatar_style TEXT NOT NULL DEFAULT 'initials';
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS team_photo_url TEXT;
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS team_photo_key TEXT;
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN NOT NULL DEFAULT TRUE;
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS require_email_offline BOOLEAN NOT NULL DEFAULT FALSE;
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS sound_notifications BOOLEAN NOT NULL DEFAULT FALSE;
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS auto_open_paths TEXT[] NOT NULL DEFAULT '{}';
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS response_time_mode TEXT NOT NULL DEFAULT 'minutes';
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS operating_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE;
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS operating_hours_timezone TEXT NOT NULL DEFAULT 'UTC';
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS operating_hours_json TEXT NOT NULL DEFAULT '';
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS widget_last_seen_at TIMESTAMPTZ;
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS widget_last_seen_url TEXT;
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS widget_install_verified_at TIMESTAMPTZ;
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS widget_install_verified_url TEXT;
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN widget_title SET DEFAULT 'Talk to the team';
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN brand_color SET DEFAULT '#2563EB';
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN greeting_text SET DEFAULT 'Hi there. Have a question? We''re here to help.';
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN launcher_position SET DEFAULT 'right';
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN avatar_style SET DEFAULT 'initials';
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN show_online_status SET DEFAULT TRUE;
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN require_email_offline SET DEFAULT FALSE;
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN sound_notifications SET DEFAULT FALSE;
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN auto_open_paths SET DEFAULT '{}';
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN response_time_mode SET DEFAULT 'minutes';
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN operating_hours_enabled SET DEFAULT FALSE;
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN operating_hours_timezone SET DEFAULT 'UTC';
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN operating_hours_json SET DEFAULT '';
  `);

  await pool.query(`
    UPDATE sites
    SET widget_title = 'Talk to the team'
    WHERE widget_title = 'Talk to the founder';
  `);

  await pool.query(`
    UPDATE sites
    SET brand_color = '#2563EB'
    WHERE brand_color = '#0f766e';
  `);

  await pool.query(`
    UPDATE sites
    SET greeting_text = 'Hi there. Have a question? We''re here to help.'
    WHERE greeting_text = 'Ask us anything before you bounce';
  `);

  await pool.query(`
    UPDATE sites
    SET launcher_position = 'right'
    WHERE launcher_position IS NULL OR launcher_position NOT IN ('left', 'right');
  `);

  await pool.query(`
    UPDATE sites
    SET avatar_style = 'initials'
    WHERE avatar_style IS NULL OR avatar_style NOT IN ('photos', 'initials', 'icon');
  `);

  await pool.query(`
    UPDATE sites
    SET response_time_mode = 'minutes'
    WHERE response_time_mode IS NULL OR response_time_mode NOT IN ('minutes', 'hours', 'day', 'hidden');
  `);

  await runSiteWidgetCopySchemaInitialization(pool);

  await pool.query(`
    UPDATE sites
    SET operating_hours_timezone = 'UTC'
    WHERE operating_hours_timezone IS NULL OR operating_hours_timezone = '';
  `);
}
