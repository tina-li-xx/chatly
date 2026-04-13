ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS mobile_push_sound_alerts BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS mobile_push_vibration_alerts BOOLEAN NOT NULL DEFAULT true;
