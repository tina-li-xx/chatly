ALTER TABLE seo_keyword_corpus
  ADD COLUMN IF NOT EXISTS associated_competitor_slug text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS appearance_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS missing_cycle_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS persistence_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS competitor_density_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS chatting_gap_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS small_team_relevance_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commercial_intent_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stability_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS result_domains_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS stale_at timestamptz;

ALTER TABLE seo_keyword_corpus
  DROP CONSTRAINT IF EXISTS seo_keyword_corpus_appearance_count_check,
  DROP CONSTRAINT IF EXISTS seo_keyword_corpus_missing_cycle_count_check,
  DROP CONSTRAINT IF EXISTS seo_keyword_corpus_persistence_score_check,
  DROP CONSTRAINT IF EXISTS seo_keyword_corpus_competitor_density_score_check,
  DROP CONSTRAINT IF EXISTS seo_keyword_corpus_chatting_gap_score_check,
  DROP CONSTRAINT IF EXISTS seo_keyword_corpus_small_team_relevance_score_check,
  DROP CONSTRAINT IF EXISTS seo_keyword_corpus_commercial_intent_score_check,
  DROP CONSTRAINT IF EXISTS seo_keyword_corpus_stability_score_check;

ALTER TABLE seo_keyword_corpus
  ADD CONSTRAINT seo_keyword_corpus_appearance_count_check CHECK (appearance_count >= 0),
  ADD CONSTRAINT seo_keyword_corpus_missing_cycle_count_check CHECK (missing_cycle_count >= 0),
  ADD CONSTRAINT seo_keyword_corpus_persistence_score_check CHECK (persistence_score >= 0 AND persistence_score <= 100),
  ADD CONSTRAINT seo_keyword_corpus_competitor_density_score_check CHECK (competitor_density_score >= 0 AND competitor_density_score <= 100),
  ADD CONSTRAINT seo_keyword_corpus_chatting_gap_score_check CHECK (chatting_gap_score >= 0 AND chatting_gap_score <= 100),
  ADD CONSTRAINT seo_keyword_corpus_small_team_relevance_score_check CHECK (small_team_relevance_score >= 0 AND small_team_relevance_score <= 100),
  ADD CONSTRAINT seo_keyword_corpus_commercial_intent_score_check CHECK (commercial_intent_score >= 0 AND commercial_intent_score <= 100),
  ADD CONSTRAINT seo_keyword_corpus_stability_score_check CHECK (stability_score >= 0 AND stability_score <= 100);

CREATE TABLE IF NOT EXISTS seo_keyword_serp_snapshots (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  run_id text NOT NULL REFERENCES seo_keyword_research_runs(id) ON DELETE CASCADE,
  keyword_corpus_id text REFERENCES seo_keyword_corpus(id) ON DELETE SET NULL,
  normalized_keyword text NOT NULL,
  source_query text NOT NULL DEFAULT '',
  provider text NOT NULL DEFAULT '',
  rank integer NOT NULL,
  result_url text NOT NULL DEFAULT '',
  result_domain text NOT NULL DEFAULT '',
  result_title text NOT NULL DEFAULT '',
  result_snippet text NOT NULL DEFAULT '',
  matched_competitor_slug text NOT NULL DEFAULT '',
  is_chatting boolean NOT NULL DEFAULT false,
  content_pattern text NOT NULL DEFAULT 'article',
  captured_at timestamptz NOT NULL DEFAULT NOW(),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT seo_keyword_serp_snapshots_rank_check CHECK (rank > 0)
);

CREATE INDEX IF NOT EXISTS idx_seo_keyword_serp_snapshots_owner_keyword_captured
  ON seo_keyword_serp_snapshots (owner_user_id, normalized_keyword, captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_seo_keyword_serp_snapshots_owner_run_rank
  ON seo_keyword_serp_snapshots (owner_user_id, run_id, rank ASC);
