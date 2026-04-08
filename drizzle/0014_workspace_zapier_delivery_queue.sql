ALTER TABLE "workspace_zapier_deliveries"
  ADD COLUMN IF NOT EXISTS "payload_json" text;

UPDATE "workspace_zapier_deliveries"
SET "payload_json" = COALESCE("payload_json", '{}');

ALTER TABLE "workspace_zapier_deliveries"
  ALTER COLUMN "payload_json" SET NOT NULL;

ALTER TABLE "workspace_zapier_deliveries"
  ADD COLUMN IF NOT EXISTS "next_attempt_at" timestamptz;

UPDATE "workspace_zapier_deliveries"
SET "next_attempt_at" = NULL
WHERE "next_attempt_at" IS NULL;

CREATE INDEX IF NOT EXISTS "workspace_zapier_deliveries_next_attempt_at_idx"
  ON "workspace_zapier_deliveries" ("next_attempt_at", "delivered_at");
