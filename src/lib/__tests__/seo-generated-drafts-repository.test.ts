const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  findSeoGeneratedDraftRow,
  insertSeoGeneratedDraftRow,
  listSeoGeneratedDraftRows,
  updateSeoGeneratedDraftStatus
} from "@/lib/repositories/seo-generated-drafts-repository";

describe("seo generated drafts repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists and finds drafts by owner scope", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ id: "draft_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "draft_2" }] });

    await expect(listSeoGeneratedDraftRows("owner_1", 10)).resolves.toEqual([{ id: "draft_1" }]);
    await expect(findSeoGeneratedDraftRow("owner_1", "draft_2")).resolves.toEqual({ id: "draft_2" });

    expect(String(mocks.query.mock.calls[0]?.[0] ?? "")).toContain("FROM seo_generated_drafts");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual(["owner_1", 10]);
  });

  it("inserts and updates drafts with stored payload json", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ id: "draft_1", status: "draft" }] })
      .mockResolvedValueOnce({ rows: [{ id: "draft_1", status: "ready_for_review" }] });

    await expect(
      insertSeoGeneratedDraftRow({
        id: "draft_1",
        ownerUserId: "owner_1",
        planRunId: "run_1",
        planItemId: "item_1",
        title: "Best live chat for startups",
        slug: "best-live-chat-for-startups",
        draftPayloadJson: { sections: [] },
        metadataJson: { source: "plan" }
      })
    ).resolves.toMatchObject({ id: "draft_1" });

    await expect(
      updateSeoGeneratedDraftStatus({
        id: "draft_1",
        ownerUserId: "owner_1",
        status: "ready_for_review",
        metadataJson: { reviewed: false }
      })
    ).resolves.toMatchObject({ status: "ready_for_review" });

    expect(String(mocks.query.mock.calls[0]?.[0] ?? "")).toContain("INSERT INTO seo_generated_drafts");
    expect(mocks.query.mock.calls[0]?.[1]?.[15]).toBe("{\"sections\":[]}");
    expect(String(mocks.query.mock.calls[1]?.[0] ?? "")).toContain("UPDATE seo_generated_drafts");
  });
});
