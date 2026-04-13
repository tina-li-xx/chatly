const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import { updateSeoGeneratedDraftRow } from "@/lib/repositories/seo-generated-draft-edit-repository";

describe("seo generated draft edit repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates one generated draft payload in place", async () => {
    mocks.query.mockResolvedValueOnce({ rows: [{ id: "draft_1", slug: "shared-inbox" }] });

    await expect(updateSeoGeneratedDraftRow({
      id: "draft_1",
      ownerUserId: "owner_1",
      title: "Shared inbox for website chat",
      slug: "shared-inbox",
      draftPayloadJson: { post: { slug: "shared-inbox" } },
      metadataJson: { regeneratedManually: true }
    })).resolves.toMatchObject({ slug: "shared-inbox" });

    expect(String(mocks.query.mock.calls[0]?.[0] ?? "")).toContain("UPDATE seo_generated_drafts");
    expect(JSON.parse(String(mocks.query.mock.calls[0]?.[1]?.[10] ?? "{}"))).toEqual({ post: { slug: "shared-inbox" } });
  });
});
