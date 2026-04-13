const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  insertSeoKeywordResearchRunRow,
  listSeoKeywordResearchRunRows,
  updateSeoKeywordResearchRunStatus
} from "@/lib/repositories/seo-keyword-research-runs-repository";

describe("seo keyword research runs repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists runs and writes json payloads for insert/update", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ id: "run_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "run_2", status: "generating" }] })
      .mockResolvedValueOnce({ rows: [{ id: "run_2", status: "ready" }] });

    await expect(listSeoKeywordResearchRunRows("owner_1", 5)).resolves.toEqual([{ id: "run_1" }]);
    await expect(insertSeoKeywordResearchRunRow({
      id: "run_2",
      ownerUserId: "owner_1",
      providerChain: "searxng-json",
      seedQueriesJson: ["chat widget", "shared inbox"],
      summaryJson: { source: "external-keyword-corpus" }
    })).resolves.toMatchObject({ status: "generating" });
    await expect(updateSeoKeywordResearchRunStatus({
      id: "run_2",
      ownerUserId: "owner_1",
      status: "ready",
      harvestedKeywordCount: 24,
      summaryJson: { summary: "Stored keyword corpus refreshed." }
    })).resolves.toMatchObject({ status: "ready" });

    expect(String(mocks.query.mock.calls[0]?.[0] ?? "")).toContain("FROM seo_keyword_research_runs");
    expect(JSON.parse(String(mocks.query.mock.calls[1]?.[1]?.[6] ?? "[]"))).toEqual(["chat widget", "shared inbox"]);
    expect(JSON.parse(String(mocks.query.mock.calls[2]?.[1]?.[5] ?? "{}"))).toEqual({ summary: "Stored keyword corpus refreshed." });
  });
});
