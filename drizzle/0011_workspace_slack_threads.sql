CREATE TABLE IF NOT EXISTS "workspace_slack_threads" (
  "conversation_id" text NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "owner_user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "slack_team_id" text NOT NULL,
  "slack_channel_id" text NOT NULL,
  "slack_channel_name" text,
  "slack_message_ts" text NOT NULL,
  "slack_thread_ts" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "workspace_slack_threads_pkey" PRIMARY KEY ("conversation_id")
);

CREATE INDEX IF NOT EXISTS "workspace_slack_threads_team_channel_thread_idx"
  ON "workspace_slack_threads" ("slack_team_id", "slack_channel_id", "slack_thread_ts");

CREATE INDEX IF NOT EXISTS "workspace_slack_threads_owner_updated_at_idx"
  ON "workspace_slack_threads" ("owner_user_id", "updated_at");
