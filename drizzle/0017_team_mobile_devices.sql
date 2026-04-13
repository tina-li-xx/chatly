CREATE TABLE IF NOT EXISTS team_mobile_devices (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  push_token text NOT NULL,
  platform text,
  app_id text,
  disabled_at timestamptz,
  last_seen_at timestamptz NOT NULL DEFAULT NOW(),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS team_mobile_devices_push_token_key
  ON team_mobile_devices (push_token);

CREATE INDEX IF NOT EXISTS idx_team_mobile_devices_user
  ON team_mobile_devices (user_id, disabled_at, updated_at DESC);
