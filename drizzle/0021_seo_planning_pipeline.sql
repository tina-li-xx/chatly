CREATE TABLE IF NOT EXISTS seo_plan_runs (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_user_id text REFERENCES users(id) ON DELETE SET NULL,
  source_profile_slug text NOT NULL DEFAULT 'chatting-default',
  status text NOT NULL DEFAULT 'draft',
  strategy_snapshot_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT seo_plan_runs_status_check CHECK (
    status = ANY (ARRAY['draft'::text, 'generating'::text, 'ready'::text, 'failed'::text, 'archived'::text])
  )
);

CREATE INDEX IF NOT EXISTS idx_seo_plan_runs_owner_created
  ON seo_plan_runs (owner_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_seo_plan_runs_owner_status_updated
  ON seo_plan_runs (owner_user_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS seo_plan_items (
  id text PRIMARY KEY,
  run_id text NOT NULL REFERENCES seo_plan_runs(id) ON DELETE CASCADE,
  owner_user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position integer NOT NULL,
  status text NOT NULL DEFAULT 'planned',
  target_publish_at timestamptz,
  title text NOT NULL,
  target_keyword text NOT NULL,
  keyword_cluster text NOT NULL DEFAULT '',
  search_intent text NOT NULL DEFAULT '',
  content_format text NOT NULL DEFAULT 'article',
  persona_slug text NOT NULL DEFAULT '',
  theme_slug text NOT NULL DEFAULT '',
  category_slug text NOT NULL DEFAULT '',
  cta_id text NOT NULL DEFAULT '',
  priority_score integer NOT NULL DEFAULT 0,
  rationale text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT seo_plan_items_status_check CHECK (
    status = ANY (ARRAY['planned'::text, 'drafted'::text, 'skipped'::text, 'archived'::text])
  ),
  CONSTRAINT seo_plan_items_priority_score_check CHECK (priority_score >= 0 AND priority_score <= 100),
  CONSTRAINT seo_plan_items_run_position_key UNIQUE (run_id, position)
);

CREATE INDEX IF NOT EXISTS idx_seo_plan_items_owner_run_position
  ON seo_plan_items (owner_user_id, run_id, position);

CREATE INDEX IF NOT EXISTS idx_seo_plan_items_owner_status_priority
  ON seo_plan_items (owner_user_id, status, priority_score DESC, position ASC);

CREATE TABLE IF NOT EXISTS seo_generated_drafts (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_user_id text REFERENCES users(id) ON DELETE SET NULL,
  plan_run_id text REFERENCES seo_plan_runs(id) ON DELETE SET NULL,
  plan_item_id text REFERENCES seo_plan_items(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  title text NOT NULL,
  slug text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  author_slug text NOT NULL DEFAULT '',
  category_slug text NOT NULL DEFAULT '',
  publication_status text NOT NULL DEFAULT 'draft',
  reading_time integer NOT NULL DEFAULT 0,
  hero_image_prompt text NOT NULL DEFAULT '',
  draft_payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT seo_generated_drafts_status_check CHECK (
    status = ANY (ARRAY['draft'::text, 'ready_for_review'::text, 'approved'::text, 'scheduled'::text, 'archived'::text])
  ),
  CONSTRAINT seo_generated_drafts_publication_status_check CHECK (
    publication_status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'published'::text])
  ),
  CONSTRAINT seo_generated_drafts_reading_time_check CHECK (reading_time >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS seo_generated_drafts_owner_slug_key
  ON seo_generated_drafts (owner_user_id, slug);

CREATE INDEX IF NOT EXISTS idx_seo_generated_drafts_owner_status_updated
  ON seo_generated_drafts (owner_user_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_seo_generated_drafts_plan_item_created
  ON seo_generated_drafts (plan_item_id, created_at DESC);
