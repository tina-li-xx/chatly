CREATE INDEX IF NOT EXISTS "ai_assist_events_owner_actor_created_at_idx"
  ON "ai_assist_events" ("owner_user_id", "actor_user_id", "created_at");
