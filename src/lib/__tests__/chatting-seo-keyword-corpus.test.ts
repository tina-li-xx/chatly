const mocks = vi.hoisted(() => ({
  buildChattingSeoBaseAnalysisInput: vi.fn(),
  buildChattingSeoKeywordCorpusRefresh: vi.fn(),
  getChattingSeoLiveResearch: vi.fn(),
  withPostgresAdvisoryLock: vi.fn(),
  listSeoKeywordResearchRunRows: vi.fn(),
  insertSeoKeywordResearchRunRow: vi.fn(),
  updateSeoKeywordResearchRunStatus: vi.fn(),
  listSeoKeywordCorpusRows: vi.fn(),
  upsertSeoKeywordCorpusRows: vi.fn(),
  markSeoKeywordCorpusCycleMisses: vi.fn(),
  insertSeoKeywordSerpSnapshotRows: vi.fn()
}));

vi.mock("@/lib/chatting-seo-analysis-input", () => ({
  buildChattingSeoBaseAnalysisInput: mocks.buildChattingSeoBaseAnalysisInput
}));

vi.mock("@/lib/chatting-seo-live-research", () => ({
  getChattingSeoLiveResearch: mocks.getChattingSeoLiveResearch
}));

vi.mock("@/lib/chatting-seo-keyword-corpus-refresh", () => ({
  buildChattingSeoKeywordCorpusRefresh: mocks.buildChattingSeoKeywordCorpusRefresh
}));

vi.mock("@/lib/postgres-advisory-lock", () => ({
  withPostgresAdvisoryLock: mocks.withPostgresAdvisoryLock
}));

vi.mock("@/lib/repositories/seo-keyword-research-runs-repository", () => ({
  listSeoKeywordResearchRunRows: mocks.listSeoKeywordResearchRunRows,
  insertSeoKeywordResearchRunRow: mocks.insertSeoKeywordResearchRunRow,
  updateSeoKeywordResearchRunStatus: mocks.updateSeoKeywordResearchRunStatus
}));

vi.mock("@/lib/repositories/seo-keyword-corpus-repository", () => ({
  listSeoKeywordCorpusRows: mocks.listSeoKeywordCorpusRows,
  upsertSeoKeywordCorpusRows: mocks.upsertSeoKeywordCorpusRows
}));

vi.mock("@/lib/repositories/seo-keyword-corpus-cycle-repository", () => ({
  markSeoKeywordCorpusCycleMisses: mocks.markSeoKeywordCorpusCycleMisses
}));

vi.mock("@/lib/repositories/seo-keyword-serp-snapshots-repository", () => ({
  insertSeoKeywordSerpSnapshotRows: mocks.insertSeoKeywordSerpSnapshotRows
}));

import { getChattingSeoStoredKeywordResearch } from "@/lib/chatting-seo-keyword-corpus";

function storedRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "keyword_1",
    owner_user_id: "owner_1",
    latest_run_id: "run_1",
    normalized_keyword: "chat widget for small teams",
    keyword: "chat widget for small teams",
    suggested_title: "Chat Widget For Small Teams",
    source_query: "chat widget",
    source_title: "Chat Widget For Small Teams",
    theme_slug: "small-teams",
    associated_competitor_slug: "",
    intent: "commercial",
    difficulty: "low",
    audience_label: "Founder-led SaaS teams",
    rationale: "Stored result",
    opportunity_score: 94,
    evidence_count: 3,
    appearance_count: 3,
    missing_cycle_count: 0,
    chatting_rank: null,
    competitor_hits: 2,
    persistence_score: 78,
    competitor_density_score: 44,
    chatting_gap_score: 84,
    small_team_relevance_score: 90,
    commercial_intent_score: 86,
    stability_score: 72,
    providers_json: ["searxng-json"],
    result_domains_json: ["example.com"],
    serp_results_json: [],
    metadata_json: {},
    first_seen_at: "2026-04-13T09:00:00.000Z",
    last_seen_at: "2026-04-13T09:00:00.000Z",
    stale_at: null,
    created_at: "2026-04-13T09:00:00.000Z",
    updated_at: "2026-04-13T09:00:00.000Z",
    ...overrides
  };
}

describe("chatting seo keyword corpus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.buildChattingSeoBaseAnalysisInput.mockReturnValue({
      candidates: [{
        keyword: "chat widget",
        title: "Chat widget",
        themeSlug: "product",
        intent: "commercial",
        audienceLabel: "Small teams",
        rationale: "Seed",
        priority: 80,
        source: "seed"
      }]
    });
  });

  it("returns fresh stored keyword research without refreshing", async () => {
    mocks.listSeoKeywordResearchRunRows.mockResolvedValueOnce([{
      id: "run_1",
      status: "ready",
      summary_json: { researchEngineVersion: "external-keyword-corpus-v2", summary: "Stored corpus.", providers: ["searxng-json"] },
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]);
    mocks.listSeoKeywordCorpusRows.mockResolvedValueOnce(Array.from({ length: 24 }, () => storedRow()));

    const result = await getChattingSeoStoredKeywordResearch({ ownerUserId: "owner_1" });

    expect(result.keywordCount).toBe(24);
    expect(result.candidates[0]?.source).toBe("research");
    expect(mocks.withPostgresAdvisoryLock).not.toHaveBeenCalled();
  });

  it("refreshes and upserts corpus rows when stored research is stale", async () => {
    mocks.listSeoKeywordResearchRunRows
      .mockResolvedValueOnce([{ id: "run_old", status: "ready", summary_json: {}, generated_at: "2026-04-10T09:00:00.000Z" }])
      .mockResolvedValueOnce([{ id: "run_new", status: "ready", summary_json: { researchEngineVersion: "external-keyword-corpus-v2", providers: ["searxng-json"] }, generated_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
    mocks.listSeoKeywordCorpusRows
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(Array.from({ length: 24 }, () => storedRow({ latest_run_id: "run_new" })));
    mocks.buildChattingSeoKeywordCorpusRefresh.mockResolvedValue({
      capturedAt: new Date().toISOString(),
      competitors: [],
      discoveryQueries: ["chat widget"],
      existingByKeyword: new Map(),
      items: [{
        ...storedRow(),
        normalizedKeyword: "chat widget for small teams",
        suggestedTitle: "Chat Widget For Small Teams",
        associatedCompetitorSlug: "",
        appearanceCount: 1,
        missingCycleCount: 0,
        persistenceScore: 78,
        competitorDensityScore: 44,
        chattingGapScore: 84,
        smallTeamRelevanceScore: 90,
        commercialIntentScore: 86,
        stabilityScore: 72,
        resultDomainsJson: ["example.com"],
        staleAt: null
      }],
      providers: ["searxng-json"],
      responseMap: new Map()
    });
    mocks.insertSeoKeywordResearchRunRow.mockResolvedValue({ id: "run_new" });
    mocks.updateSeoKeywordResearchRunStatus.mockResolvedValue({ id: "run_new", generated_at: new Date().toISOString(), updated_at: new Date().toISOString(), summary_json: { providers: ["searxng-json"] } });
    mocks.upsertSeoKeywordCorpusRows.mockResolvedValue([{ id: "keyword_1" }]);
    mocks.withPostgresAdvisoryLock.mockImplementation(async (_key, task) => ({ acquired: true, value: await task() }));

    const result = await getChattingSeoStoredKeywordResearch({ ownerUserId: "owner_1", actorUserId: "actor_1" });

    expect(mocks.insertSeoKeywordResearchRunRow).toHaveBeenCalled();
    expect(mocks.upsertSeoKeywordCorpusRows).toHaveBeenCalled();
    expect(mocks.markSeoKeywordCorpusCycleMisses).toHaveBeenCalled();
    expect(result.runId).toBe("run_new");
  });
});
