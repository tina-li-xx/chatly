CREATE TABLE IF NOT EXISTS "ai_assist_events" (
  "id" text PRIMARY KEY NOT NULL,
  "owner_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "actor_user_id" text REFERENCES "users"("id") ON DELETE SET NULL,
  "conversation_id" text,
  "feature" text NOT NULL,
  "action" text NOT NULL,
  "metadata_json" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "ai_assist_events_owner_created_at_idx"
  ON "ai_assist_events" ("owner_user_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "ai_assist_events_owner_feature_created_at_idx"
  ON "ai_assist_events" ("owner_user_id", "feature", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "ai_assist_events_conversation_created_at_idx"
  ON "ai_assist_events" ("conversation_id", "created_at" DESC);
