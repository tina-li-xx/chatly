ALTER TABLE "visitor_presence_sessions"
  ADD COLUMN IF NOT EXISTS "tags_json" jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE "visitor_presence_sessions"
  ADD COLUMN IF NOT EXISTS "custom_fields_json" jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE "visitor_contacts"
  ADD COLUMN IF NOT EXISTS "tags_json" jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE "visitor_contacts"
  ADD COLUMN IF NOT EXISTS "custom_fields_json" jsonb NOT NULL DEFAULT '{}'::jsonb;
