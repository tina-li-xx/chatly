const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import { listSeoKeywordCorpusRows, upsertSeoKeywordCorpusRows } from "@/lib/repositories/seo-keyword-corpus-repository";

describe("seo keyword corpus repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists stored keywords and upserts snake_case corpus payloads", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ id: "keyword_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "keyword_1", keyword: "chat widget for small teams" }] });

    await expect(listSeoKeywordCorpusRows("owner_1", 10)).resolves.toEqual([{ id: "keyword_1" }]);
    await expect(upsertSeoKeywordCorpusRows({
      ownerUserId: "owner_1",
      items: [{
        id: "keyword_1",
        latestRunId: "run_1",
        keyword: "chat widget for small teams",
        normalizedKeyword: "chat widget for small teams",
        suggestedTitle: "Chat Widget For Small Teams",
        sourceQuery: "chat widget",
        providersJson: ["searxng-json"],
        serpResultsJson: [{ rank: 1 }],
        metadataJson: { sourceKind: "query" }
      }]
    })).resolves.toHaveLength(1);

    expect(String(mocks.query.mock.calls[0]?.[0] ?? "")).toContain("FROM seo_keyword_corpus");
    expect(String(mocks.query.mock.calls[1]?.[0] ?? "")).toContain("ON CONFLICT (owner_user_id, normalized_keyword)");
    expect(JSON.parse(String(mocks.query.mock.calls[1]?.[1]?.[1] ?? "[]"))).toEqual([
      expect.objectContaining({
        latest_run_id: "run_1",
        normalized_keyword: "chat widget for small teams",
        providers_json: ["searxng-json"],
        metadata_json: { sourceKind: "query" }
      })
    ]);
  });
});
