CREATE TABLE IF NOT EXISTS "workspace_zapier_deliveries" (
  "id" text NOT NULL,
  "owner_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "webhook_id" text NOT NULL REFERENCES "workspace_zapier_webhooks"("id") ON DELETE CASCADE,
  "event_type" text NOT NULL,
  "event_key" text NOT NULL,
  "attempt_count" integer NOT NULL DEFAULT 0,
  "delivered_at" timestamptz,
  "last_attempt_at" timestamptz,
  "last_response_code" integer,
  "last_response_body" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "workspace_zapier_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "workspace_zapier_deliveries_webhook_event_key_idx"
  ON "workspace_zapier_deliveries" ("webhook_id", "event_type", "event_key");

CREATE INDEX IF NOT EXISTS "workspace_zapier_deliveries_owner_updated_at_idx"
  ON "workspace_zapier_deliveries" ("owner_user_id", "updated_at");

CREATE TABLE IF NOT EXISTS "workspace_zapier_idempotency_keys" (
  "api_key_id" text NOT NULL REFERENCES "workspace_zapier_api_keys"("id") ON DELETE CASCADE,
  "owner_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "idempotency_key" text NOT NULL,
  "request_hash" text NOT NULL,
  "response_status" integer NOT NULL,
  "response_json" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "workspace_zapier_idempotency_keys_pkey" PRIMARY KEY ("api_key_id", "idempotency_key")
);

CREATE INDEX IF NOT EXISTS "workspace_zapier_idempotency_keys_owner_updated_at_idx"
  ON "workspace_zapier_idempotency_keys" ("owner_user_id", "updated_at");
