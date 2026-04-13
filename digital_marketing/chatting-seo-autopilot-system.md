# Chatting SEO Autopilot System

## What This Feature Is

This feature is an internal SEO growth engine for Chatting.

It is designed to behave like an Outrank-style content system, but for one product only:
Chatting.

Instead of asking users to describe their business, the system already knows the business.
It uses Chatting's existing product context, SEO surfaces, competitor framing, live search research, stored keyword history, a 30-day planning engine, and article generation to keep the publishing pipeline moving automatically.

In short, it does this:

1. Discover keyword opportunities from live search
2. Store those opportunities in a persistent keyword corpus
3. Track SERP snapshots over time
4. Score keywords from historical evidence, not just one-off queries
5. Generate a 30-day plan from the stored corpus
6. Generate drafts from the plan
7. Feed those drafts into Chatting's publishing workflow

---

## Product Goal

The goal is not "write some blog posts."

The goal is to build an internal, compounding SEO system that:

- continuously finds topics Chatting can win
- prioritizes those topics by real search evidence
- turns them into a usable monthly plan
- creates drafts automatically
- keeps improving as it accumulates more search intelligence over time

This is closer to an internal SEO operating system than a one-shot content generator.

---

## What Was Implemented

### 1. Chatting-specific source of truth

The system does not use a generic business onboarding step.
It is anchored to Chatting's existing source-of-truth content and strategy.

Core sources:

- `digital_marketing/chatting-product-context.md`
- `src/lib/site-seo.ts`
- `src/lib/pricing.ts`
- `src/lib/blog-data.ts`
- `src/lib/guides-data.ts`
- `src/lib/free-tools-data.ts`
- `src/lib/chatting-seo-profile.ts`

Purpose:

- define positioning
- define ideal buyers
- define competitor set
- define approved claims and content guardrails
- define content themes and known product surfaces

This gives the system a fixed business context for all later planning and generation.

---

### 2. Live research layer

The feature uses free search sources instead of a paid SEO provider.

Provider order:

1. `SearXNG` JSON, if `SEARXNG_BASE_URL` is configured
2. Bing RSS fallback
3. DuckDuckGo HTML fallback

Implementation:

- `src/lib/chatting-seo-live-research-service.ts`
- `src/lib/chatting-seo-live-research.ts`
- `src/lib/chatting-seo-serp-matching.ts`

What the live layer does:

- run search queries
- normalize result titles, URLs, snippets, and domains
- detect whether Chatting is visible in results
- detect whether competitors are visible in results
- identify basic content patterns like article, comparison, tool, pricing, docs, feature page

This is the external evidence layer that replaces fake or purely internal keyword planning.

---

### 3. Persistent keyword ingestion

The system now stores discovered keywords instead of throwing them away after a single run.

Implementation:

- `src/lib/chatting-seo-keyword-corpus-queries.ts`
- `src/lib/chatting-seo-keyword-corpus-discovery.ts`
- `src/lib/chatting-seo-keyword-corpus-extraction.ts`

The ingestion process expands queries from several sources:

- seed keywords from Chatting's approved candidate pool
- autosuggest-style expansions
- competitor alternative queries
- comparison queries
- use-case queries
- refresh queries for previously tracked keywords

Examples:

- `chat widget`
- `chat widget for small teams`
- `intercom alternative for small teams`
- `chatting vs intercom`
- `shared inbox for website chat`
- `live chat for small saas teams`

For each discovery query, the system:

1. runs live search
2. extracts promising keyword phrases from result titles and snippets
3. normalizes them into canonical keywords
4. stores them in the keyword corpus

This is the first major shift from "live-search a handful of terms right now" to "build a reusable keyword database over time."

---

## Keyword Registry

The keyword registry is the persistent database of discovered opportunities.

Main table:

- `seo_keyword_corpus`

Schema and repository:

- `src/lib/drizzle/schema/seo-keyword-research.ts`
- `drizzle/0022_seo_keyword_corpus.sql`
- `drizzle/0023_seo_keyword_history.sql`
- `src/lib/repositories/seo-keyword-corpus-repository.ts`
- `src/lib/repositories/seo-keyword-corpus-repository-shared.ts`

Each canonical keyword stores:

- keyword
- normalized keyword
- suggested title
- source query
- source title
- associated theme
- associated competitor
- intent
- difficulty
- audience label
- rationale
- current opportunity score
- evidence count
- appearance count
- missing cycle count
- current Chatting rank
- competitor hit count
- persistence score
- competitor density score
- Chatting gap score
- small-team relevance score
- commercial intent score
- stability score
- providers used
- result domains seen
- latest SERP results
- metadata
- first seen timestamp
- last seen timestamp
- stale timestamp

This registry is the durable memory of the SEO system.

---

## SERP Snapshots

The system stores historical SERP evidence separately from the keyword registry.

Main table:

- `seo_keyword_serp_snapshots`

Repository:

- `src/lib/repositories/seo-keyword-serp-snapshots-repository.ts`
- `src/lib/repositories/seo-keyword-serp-snapshots-repository-shared.ts`

For each tracked keyword, snapshots record:

- run ID
- linked keyword corpus record
- normalized keyword
- source query
- provider
- rank
- result URL
- result domain
- result title
- result snippet
- matched competitor slug
- whether the result is Chatting
- content pattern
- captured timestamp

This creates a historical record of search behavior instead of a single ephemeral research pass.

---

## Historical Scoring

The system computes internal keyword scores from accumulated evidence.

Implementation:

- `src/lib/chatting-seo-keyword-history.ts`

Current score components:

- `persistenceScore`
  - rewards terms that keep reappearing over time
- `competitorDensityScore`
  - rewards terms where many known competitors keep showing up
- `chattingGapScore`
  - rewards terms where competitors rank but Chatting does not
- `smallTeamRelevanceScore`
  - rewards terms aligned with Chatting's small-team positioning
- `commercialIntentScore`
  - rewards buyer-intent or comparison-heavy keywords
- `stabilityScore`
  - rewards terms that appear consistently across refresh cycles and domains

These components are blended into `opportunityScore`.

Important detail:

This is **not** true Ahrefs/Semrush-style volume data.
It is a historical evidence model built from repeated free-source SERP observation.

That means:

- better than one-shot heuristics
- more honest than pretending we have search-volume data
- still not the same as a commercial keyword database

---

## Refresh Cycle

The refresh cycle is the core of the system.

Implementation:

- `src/lib/chatting-seo-keyword-corpus.ts`
- `src/lib/chatting-seo-keyword-corpus-refresh.ts`
- `src/lib/repositories/seo-keyword-corpus-cycle-repository.ts`

The cycle works like this:

1. Load the current stored corpus
2. Build discovery queries from seeds, competitors, use cases, and previously tracked terms
3. Run discovery searches
4. Extract and normalize discovered keyword ideas
5. Select a tracked slice for canonical SERP snapshots
6. Run live search again for those tracked keywords
7. Upsert the keyword corpus with updated evidence and historical scores
8. Insert SERP snapshot rows for the tracked results
9. Mark non-seen keywords as missed for this cycle
10. Decay stale terms instead of deleting them

This is what turns the feature into a long-running intelligence layer.

---

## Planner Integration

The planner now reads the stored keyword corpus instead of planning only from fresh ad hoc searches.

Implementation:

- `src/lib/chatting-seo-keyword-corpus-mappers.ts`
- `src/lib/chatting-seo-analysis.ts`
- `src/lib/chatting-seo-plan.ts`
- `src/lib/data/dashboard-publishing-seo-bootstrap.ts`

Planning flow:

1. Load the stored keyword research
2. Convert the top corpus rows into Chatting SEO candidates
3. Feed those candidates into analysis
4. Build a 30-day plan from that corpus-backed analysis
5. Save the plan into:
   - `seo_plan_runs`
   - `seo_plan_items`

This means the plan is now based on stored historical evidence, not just a one-time query burst.

---

## Draft Generation

Once the plan exists, draft generation works from plan items.

Relevant pieces:

- `seo_generated_drafts`
- existing draft generation services
- publishing queue UI

Current behavior:

- drafts are generated from the current plan
- drafts stay linked to plan items
- drafts can be regenerated one at a time
- the system maintains a rolling draft buffer

This is the "Generate articles on autopilot" part of the flow.

---

## Continuous Refresh

The historical keyword corpus is now part of the existing SEO autopilot cycle.

Implementation:

- `src/lib/chatting-seo-autopilot.ts`
- `src/lib/runtime/chatting-seo-autopilot-scheduler.ts`
- `src/lib/runtime/startup-orchestrator.ts`

Behavior:

- the scheduler runs on the existing autopilot cadence
- the autopilot now refreshes the stored keyword corpus first
- after research refresh, it continues into plan/bootstrap and draft generation

This ensures the system keeps learning over time instead of staying frozen after the first plan.

---

## Internal UI

The feature is surfaced inside:

- `/dashboard/publishing`

The publishing workspace now acts as the control center for:

- analysis
- plans
- drafts
- queue

It also supports manual regeneration controls for:

- one plan item at a time
- one draft at a time

This keeps the automation useful without removing editorial control.

---

## How To Replicate This In Another Project

To replicate this system in another product, keep the same architecture but swap the source-of-truth layer.

### Step 1. Create a fixed strategy profile

Define one internal source of truth for the product:

- product summary
- pricing anchor
- target buyers
- content themes
- competitor set
- approved claims
- content guardrails

Do not build a generic intake flow unless the product truly needs to be multi-tenant.

### Step 2. Build a seed keyword layer

Start with:

- product terms
- use-case terms
- competitor terms
- comparison terms
- feature terms

This gives the discovery process something to expand from.

### Step 3. Add free live research

Use a provider chain similar to this:

1. self-hosted SearXNG
2. Bing RSS fallback
3. DuckDuckGo fallback

Normalize search results into a common shape:

- rank
- title
- URL
- domain
- snippet

### Step 4. Persist the corpus

Store canonical keywords in a durable table.

At minimum keep:

- normalized keyword
- source query
- intent
- rationale
- score
- first/last seen timestamps
- provider set
- result domains
- snapshot linkage

### Step 5. Store SERP snapshots

Do not just keep the latest result list inside the keyword row.
Store snapshots separately so you can build historical scoring and trend logic later.

### Step 6. Score from repeated evidence

You do not need paid volume data on day one.
You do need repeatable signals.

Good first score components:

- does this keyword keep reappearing?
- do competitors keep showing up?
- is your product absent?
- is it aligned with your ICP?
- does it look commercially valuable?
- is it stable across cycles?

### Step 7. Plan from stored history

The planner should read the stored corpus, not raw search results directly.

That lets you:

- preserve learning over time
- avoid starting from zero on every run
- build more stable monthly planning

### Step 8. Put refresh on a schedule

This system only compounds if it runs continuously.

A good v1 cadence:

- hourly or every few hours for refresh
- daily or on-demand plan generation
- rolling draft generation from the current plan

---

## Reusable Design Principles

If you want this to transfer well to other projects, keep these principles:

### Use one product-specific context source

Do not duplicate strategy in ten places.

### Separate discovery from planning

Discovery gathers evidence.
Planning chooses what to write next.

### Separate the registry from snapshots

The registry stores the current canonical state.
Snapshots store historical search evidence.

### Score from evidence, not vibes

Even heuristic scores should be based on observable repeated search behavior.

### Let automation run, but keep editorial override

Automatic planning and draft generation are useful.
Manual regenerate controls are still necessary.

---

## Known Tradeoffs

This implementation intentionally trades depth for free infrastructure.

What it does well:

- accumulates keyword intelligence over time
- uses live external search evidence
- persists and scores opportunities
- plans from historical data
- works without a paid SEO API

What it does not do yet:

- true search volume data
- true keyword difficulty data
- full Ahrefs/Semrush-grade keyword universe coverage
- full backlink intelligence
- snapshot every stored keyword every cycle

The current design is a strong free, internal, product-specific SEO intelligence system.
It is not pretending to be a full commercial SEO data platform.

---

## Main Files

Core logic:

- `src/lib/chatting-seo-keyword-corpus.ts`
- `src/lib/chatting-seo-keyword-corpus-refresh.ts`
- `src/lib/chatting-seo-keyword-corpus-discovery.ts`
- `src/lib/chatting-seo-keyword-corpus-queries.ts`
- `src/lib/chatting-seo-keyword-history.ts`
- `src/lib/chatting-seo-serp-matching.ts`

Repositories:

- `src/lib/repositories/seo-keyword-corpus-repository.ts`
- `src/lib/repositories/seo-keyword-corpus-cycle-repository.ts`
- `src/lib/repositories/seo-keyword-corpus-repository-shared.ts`
- `src/lib/repositories/seo-keyword-serp-snapshots-repository.ts`
- `src/lib/repositories/seo-keyword-serp-snapshots-repository-shared.ts`
- `src/lib/repositories/seo-keyword-research-runs-repository.ts`

Planner / autopilot integration:

- `src/lib/chatting-seo-analysis.ts`
- `src/lib/chatting-seo-plan.ts`
- `src/lib/data/dashboard-publishing-seo-bootstrap.ts`
- `src/lib/chatting-seo-autopilot.ts`
- `src/lib/runtime/chatting-seo-autopilot-scheduler.ts`

Docs and constraints:

- `digital_marketing/chatting-product-context.md`
- `CONCERNS.md`

---

## Short Summary

This feature upgraded Chatting from:

- "run a few live searches and guess what to write"

to:

- "continuously collect search evidence, store a keyword corpus, track SERP history, score opportunities over time, plan from that stored intelligence, and automatically turn the plan into drafts."

That is the core pattern to replicate in other products.
