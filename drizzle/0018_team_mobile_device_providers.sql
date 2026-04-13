ALTER TABLE team_mobile_devices
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS bundle_id text,
  ADD COLUMN IF NOT EXISTS environment text;

UPDATE team_mobile_devices
SET provider = 'expo'
WHERE provider IS NULL;

ALTER TABLE team_mobile_devices
  ALTER COLUMN provider SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE team_mobile_devices
    ADD CONSTRAINT team_mobile_devices_provider_check
    CHECK (provider = ANY (ARRAY['expo'::text, 'apns'::text, 'fcm'::text]));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE team_mobile_devices
    ADD CONSTRAINT team_mobile_devices_environment_check
    CHECK (environment IS NULL OR environment = ANY (ARRAY['sandbox'::text, 'production'::text]));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
