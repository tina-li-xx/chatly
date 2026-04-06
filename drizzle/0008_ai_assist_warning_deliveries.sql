CREATE TABLE IF NOT EXISTS "ai_assist_warning_deliveries" (
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "owner_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "cycle_start" date NOT NULL,
  "warning_key" text NOT NULL,
  "sent_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "ai_assist_warning_deliveries_pkey" PRIMARY KEY ("user_id", "owner_user_id", "cycle_start", "warning_key")
);

CREATE INDEX IF NOT EXISTS "ai_assist_warning_deliveries_owner_cycle_idx"
  ON "ai_assist_warning_deliveries" ("owner_user_id", "cycle_start", "warning_key");
