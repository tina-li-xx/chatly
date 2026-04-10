ALTER TABLE mobile_push_registrations
  ADD COLUMN IF NOT EXISTS bundle_id text,
  ADD COLUMN IF NOT EXISTS environment text;

ALTER TABLE mobile_push_registrations
  DROP CONSTRAINT IF EXISTS mobile_push_registrations_provider_check;

ALTER TABLE mobile_push_registrations
  ADD CONSTRAINT mobile_push_registrations_provider_check
  CHECK (provider = ANY (ARRAY['expo'::text, 'apns'::text]));

ALTER TABLE mobile_push_registrations
  DROP CONSTRAINT IF EXISTS mobile_push_registrations_environment_check;

ALTER TABLE mobile_push_registrations
  ADD CONSTRAINT mobile_push_registrations_environment_check
  CHECK (environment IS NULL OR environment = ANY (ARRAY['sandbox'::text, 'production'::text]));
