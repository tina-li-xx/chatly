const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import { findSeoPlanItemRow, updateSeoPlanItemRow } from "@/lib/repositories/seo-plan-item-edit-repository";

describe("seo plan item edit repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("finds a plan item and updates one row in place", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ id: "item_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "item_1", title: "Shared inbox for website chat" }] });

    await expect(findSeoPlanItemRow("owner_1", "item_1")).resolves.toEqual({ id: "item_1" });
    await expect(updateSeoPlanItemRow({
      id: "item_1",
      ownerUserId: "owner_1",
      title: "Shared inbox for website chat",
      targetKeyword: "shared inbox for website chat",
      metadataJson: { source: "manual-regenerate" }
    })).resolves.toMatchObject({ title: "Shared inbox for website chat" });

    expect(String(mocks.query.mock.calls[0]?.[0] ?? "")).toContain("FROM seo_plan_items");
    expect(String(mocks.query.mock.calls[1]?.[0] ?? "")).toContain("UPDATE seo_plan_items");
  });
});
