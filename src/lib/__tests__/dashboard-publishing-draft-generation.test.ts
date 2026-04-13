const mocks = vi.hoisted(() => ({
  getChattingSeoDraft: vi.fn(),
  findSeoGeneratedDraftRowByPlanItemId: vi.fn(),
  findSeoGeneratedDraftRowBySlug: vi.fn(),
  insertSeoGeneratedDraftRow: vi.fn(),
  updateSeoPlanItemStatus: vi.fn()
}));

vi.mock("@/lib/chatting-seo-draft", () => ({
  getChattingSeoDraft: mocks.getChattingSeoDraft
}));
vi.mock("@/lib/repositories/seo-generated-drafts-repository", () => ({
  findSeoGeneratedDraftRowByPlanItemId: mocks.findSeoGeneratedDraftRowByPlanItemId,
  findSeoGeneratedDraftRowBySlug: mocks.findSeoGeneratedDraftRowBySlug,
  insertSeoGeneratedDraftRow: mocks.insertSeoGeneratedDraftRow
}));
vi.mock("@/lib/repositories/seo-plan-items-repository", () => ({
  updateSeoPlanItemStatus: mocks.updateSeoPlanItemStatus
}));

import { generateDashboardPublishingDraft } from "@/lib/dashboard-publishing-draft-generation";

describe("dashboard publishing draft generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findSeoGeneratedDraftRowByPlanItemId.mockResolvedValue(null);
    mocks.findSeoGeneratedDraftRowBySlug.mockResolvedValue(null);
    mocks.getChattingSeoDraft.mockResolvedValue({
      source: "ai",
      heroImagePrompt: "Hero prompt",
      post: {
        title: "Generated draft",
        slug: "generated-draft",
        excerpt: "Excerpt",
        subtitle: "Subtitle",
        authorSlug: "tina",
        categorySlug: "comparisons",
        readingTime: 8,
        publishedAt: "2026-04-20T09:00:00.000Z"
      }
    });
    mocks.insertSeoGeneratedDraftRow.mockResolvedValue({ id: "draft_1", slug: "generated-draft" });
  });

  it("creates a ready-for-review draft and marks the plan item as drafted", async () => {
    const result = await generateDashboardPublishingDraft({
      ownerUserId: "owner_1",
      actorUserId: "user_1",
      mode: "manual",
      planItem: {
        id: "item_1",
        run_id: "run_1",
        title: "Generated draft",
        target_keyword: "generated draft",
        target_publish_at: "2026-04-20T09:00:00.000Z"
      } as never
    });

    expect(result).toEqual({ created: true, draft: { id: "draft_1", slug: "generated-draft" } });
    expect(mocks.insertSeoGeneratedDraftRow).toHaveBeenCalledWith(expect.objectContaining({
      status: "ready_for_review",
      publicationStatus: "draft",
      planItemId: "item_1",
      slug: "generated-draft",
      metadataJson: expect.objectContaining({ manualGenerated: true, targetKeyword: "generated draft" })
    }));
    expect(mocks.updateSeoPlanItemStatus).toHaveBeenCalledWith(expect.objectContaining({ id: "item_1", status: "drafted" }));
  });

  it("adds a suffix when the generated slug is already taken", async () => {
    mocks.findSeoGeneratedDraftRowBySlug
      .mockResolvedValueOnce({ id: "draft_existing" })
      .mockResolvedValueOnce(null);

    await generateDashboardPublishingDraft({
      ownerUserId: "owner_1",
      actorUserId: "user_1",
      mode: "manual",
      planItem: {
        id: "item_1",
        run_id: "run_1",
        title: "Generated draft",
        target_keyword: "generated draft",
        target_publish_at: "2026-04-20T09:00:00.000Z"
      } as never
    });

    expect(mocks.insertSeoGeneratedDraftRow).toHaveBeenCalledWith(expect.objectContaining({
      slug: "generated-draft-chatting"
    }));
  });
});
