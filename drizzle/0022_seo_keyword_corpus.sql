CREATE TABLE IF NOT EXISTS seo_keyword_research_runs (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_user_id text REFERENCES users(id) ON DELETE SET NULL,
  source_profile_slug text NOT NULL DEFAULT 'chatting-default',
  status text NOT NULL DEFAULT 'draft',
  provider_chain text NOT NULL DEFAULT '',
  seed_queries_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  harvested_keyword_count integer NOT NULL DEFAULT 0,
  generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT seo_keyword_research_runs_status_check CHECK (
    status = ANY (ARRAY['draft'::text, 'generating'::text, 'ready'::text, 'failed'::text, 'archived'::text])
  ),
  CONSTRAINT seo_keyword_research_runs_harvested_keyword_count_check CHECK (harvested_keyword_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_seo_keyword_research_runs_owner_created
  ON seo_keyword_research_runs (owner_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_seo_keyword_research_runs_owner_status_updated
  ON seo_keyword_research_runs (owner_user_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS seo_keyword_corpus (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latest_run_id text REFERENCES seo_keyword_research_runs(id) ON DELETE SET NULL,
  normalized_keyword text NOT NULL,
  keyword text NOT NULL,
  suggested_title text NOT NULL DEFAULT '',
  source_query text NOT NULL DEFAULT '',
  source_title text NOT NULL DEFAULT '',
  theme_slug text NOT NULL DEFAULT '',
  intent text NOT NULL DEFAULT 'informational',
  difficulty text NOT NULL DEFAULT 'medium',
  audience_label text NOT NULL DEFAULT '',
  rationale text NOT NULL DEFAULT '',
  opportunity_score integer NOT NULL DEFAULT 0,
  evidence_count integer NOT NULL DEFAULT 0,
  chatting_rank integer,
  competitor_hits integer NOT NULL DEFAULT 0,
  providers_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  serp_results_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  first_seen_at timestamptz NOT NULL DEFAULT NOW(),
  last_seen_at timestamptz NOT NULL DEFAULT NOW(),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT seo_keyword_corpus_intent_check CHECK (
    intent = ANY (ARRAY['commercial'::text, 'informational'::text, 'comparison'::text])
  ),
  CONSTRAINT seo_keyword_corpus_difficulty_check CHECK (
    difficulty = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])
  ),
  CONSTRAINT seo_keyword_corpus_opportunity_score_check CHECK (
    opportunity_score >= 0 AND opportunity_score <= 100
  ),
  CONSTRAINT seo_keyword_corpus_evidence_count_check CHECK (evidence_count >= 0),
  CONSTRAINT seo_keyword_corpus_competitor_hits_check CHECK (competitor_hits >= 0),
  CONSTRAINT seo_keyword_corpus_chatting_rank_check CHECK (chatting_rank IS NULL OR chatting_rank > 0),
  CONSTRAINT seo_keyword_corpus_owner_keyword_key UNIQUE (owner_user_id, normalized_keyword)
);

CREATE INDEX IF NOT EXISTS idx_seo_keyword_corpus_owner_score_last_seen
  ON seo_keyword_corpus (owner_user_id, opportunity_score DESC, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_seo_keyword_corpus_owner_updated
  ON seo_keyword_corpus (owner_user_id, updated_at DESC);
