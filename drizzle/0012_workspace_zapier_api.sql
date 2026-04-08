CREATE TABLE IF NOT EXISTS "workspace_zapier_api_keys" (
  "id" text NOT NULL,
  "owner_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "key_prefix" text NOT NULL,
  "key_hash" text NOT NULL,
  "key_salt" text NOT NULL,
  "last_used_at" timestamptz,
  "revoked_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "workspace_zapier_api_keys_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "workspace_zapier_api_keys_owner_updated_at_idx"
  ON "workspace_zapier_api_keys" ("owner_user_id", "updated_at");

CREATE INDEX IF NOT EXISTS "workspace_zapier_api_keys_prefix_revoked_at_idx"
  ON "workspace_zapier_api_keys" ("key_prefix", "revoked_at");

CREATE INDEX IF NOT EXISTS "workspace_zapier_api_keys_owner_revoked_at_idx"
  ON "workspace_zapier_api_keys" ("owner_user_id", "revoked_at");

CREATE TABLE IF NOT EXISTS "workspace_zapier_webhooks" (
  "id" text NOT NULL,
  "owner_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "event_type" text NOT NULL,
  "target_url" text NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "last_triggered_at" timestamptz,
  "last_response_code" integer,
  "last_response_body" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "workspace_zapier_webhooks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "workspace_zapier_webhooks_event_type_check" CHECK ("event_type" = ANY (ARRAY['conversation.created'::text, 'conversation.resolved'::text, 'contact.created'::text, 'tag.added'::text]))
);

CREATE INDEX IF NOT EXISTS "workspace_zapier_webhooks_owner_active_updated_at_idx"
  ON "workspace_zapier_webhooks" ("owner_user_id", "active", "updated_at");

CREATE INDEX IF NOT EXISTS "workspace_zapier_webhooks_owner_event_active_idx"
  ON "workspace_zapier_webhooks" ("owner_user_id", "event_type", "active");

CREATE UNIQUE INDEX IF NOT EXISTS "workspace_zapier_webhooks_owner_event_target_url_idx"
  ON "workspace_zapier_webhooks" ("owner_user_id", "event_type", "target_url");
