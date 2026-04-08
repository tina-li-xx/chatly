CREATE TABLE IF NOT EXISTS "workspace_integrations" (
  "owner_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "status" text NOT NULL DEFAULT 'connected',
  "account_label" text,
  "external_account_id" text,
  "settings_json" text NOT NULL DEFAULT '',
  "credentials_json" text NOT NULL DEFAULT '',
  "error_message" text,
  "connected_at" timestamptz,
  "last_validated_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "workspace_integrations_pkey" PRIMARY KEY ("owner_user_id", "provider"),
  CONSTRAINT "workspace_integrations_provider_check" CHECK ("provider" = ANY (ARRAY['slack'::text, 'zapier'::text, 'shopify'::text])),
  CONSTRAINT "workspace_integrations_status_check" CHECK ("status" = ANY (ARRAY['connected'::text, 'reconnect'::text, 'error'::text]))
);

CREATE INDEX IF NOT EXISTS "workspace_integrations_owner_updated_at_idx"
  ON "workspace_integrations" ("owner_user_id", "updated_at");

CREATE TABLE IF NOT EXISTS "workspace_webhooks" (
  "id" text PRIMARY KEY,
  "owner_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "url" text NOT NULL,
  "events_json" text NOT NULL DEFAULT '[]',
  "secret" text NOT NULL DEFAULT '',
  "status" text NOT NULL DEFAULT 'active',
  "last_triggered_at" timestamptz,
  "last_response_code" integer,
  "last_response_body" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "workspace_webhooks_status_check" CHECK ("status" = ANY (ARRAY['active'::text, 'disabled'::text]))
);

CREATE INDEX IF NOT EXISTS "workspace_webhooks_owner_updated_at_idx"
  ON "workspace_webhooks" ("owner_user_id", "updated_at");

CREATE INDEX IF NOT EXISTS "workspace_webhooks_owner_status_updated_at_idx"
  ON "workspace_webhooks" ("owner_user_id", "status", "updated_at");
