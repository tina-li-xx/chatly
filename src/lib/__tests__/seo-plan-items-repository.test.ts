const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  listSeoPlanItemRows,
  replaceSeoPlanItemRows,
  updateSeoPlanItemStatus
} from "@/lib/repositories/seo-plan-items-repository";

describe("seo plan items repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists plan items for a run", async () => {
    mocks.query.mockResolvedValueOnce({ rows: [{ id: "item_1" }] });

    await expect(listSeoPlanItemRows("owner_1", "run_1")).resolves.toEqual([{ id: "item_1" }]);

    expect(String(mocks.query.mock.calls[0]?.[0] ?? "")).toContain("FROM seo_plan_items");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual(["owner_1", "run_1"]);
  });

  it("replaces plan items using snake_case json payloads and updates status", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: "item_1", status: "planned" }] })
      .mockResolvedValueOnce({ rows: [{ id: "item_1", status: "drafted" }] });

    await expect(
      replaceSeoPlanItemRows({
        ownerUserId: "owner_1",
        runId: "run_1",
        items: [
          {
            id: "item_1",
            position: 1,
            title: "Best live chat for startups",
            targetKeyword: "best live chat for startups",
            targetPublishAt: "2026-04-15T09:00:00.000Z",
            metadataJson: { score: 92 }
          }
        ]
      })
    ).resolves.toHaveLength(1);

    await expect(
      updateSeoPlanItemStatus({
        id: "item_1",
        ownerUserId: "owner_1",
        status: "drafted",
        notes: "Draft created"
      })
    ).resolves.toMatchObject({ status: "drafted" });

    expect(String(mocks.query.mock.calls[1]?.[0] ?? "")).toContain("jsonb_to_recordset");
    expect(JSON.parse(String(mocks.query.mock.calls[1]?.[1]?.[2] ?? "[]"))).toEqual([
      expect.objectContaining({
        target_publish_at: "2026-04-15T09:00:00.000Z",
        target_keyword: "best live chat for startups",
        metadata_json: { score: 92 }
      })
    ]);
    expect(String(mocks.query.mock.calls[2]?.[0] ?? "")).toContain("UPDATE seo_plan_items");
  });
});
