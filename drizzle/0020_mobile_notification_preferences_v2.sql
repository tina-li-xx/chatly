ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS mobile_push_enabled BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS mobile_push_new_conversation_alerts BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS mobile_push_assignment_alerts BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS mobile_push_all_message_alerts BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS mobile_push_sound TEXT NOT NULL DEFAULT 'chime';
