const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  canAccessDashboardPublishing: vi.fn(),
  generateDashboardPublishingDraft: vi.fn(),
  regenerateChattingSeoPlanItem: vi.fn(),
  getChattingSeoDraft: vi.fn(),
  findSeoPlanItemRow: vi.fn(),
  findSeoGeneratedDraftRowByPlanItemId: vi.fn(),
  listSeoPlanItemRows: vi.fn(),
  updateSeoPlanItemRow: vi.fn(),
  findSeoGeneratedDraftRow: vi.fn(),
  updateSeoGeneratedDraftRow: vi.fn()
}));

vi.mock("@/lib/auth", () => ({
  requireUser: mocks.requireUser
}));

vi.mock("@/lib/dashboard-publishing-access", () => ({
  canAccessDashboardPublishing: mocks.canAccessDashboardPublishing
}));

vi.mock("@/lib/dashboard-publishing-draft-generation", () => ({
  generateDashboardPublishingDraft: mocks.generateDashboardPublishingDraft
}));

vi.mock("@/lib/chatting-seo-plan-item-regeneration", () => ({
  regenerateChattingSeoPlanItem: mocks.regenerateChattingSeoPlanItem
}));

vi.mock("@/lib/chatting-seo-draft", () => ({
  getChattingSeoDraft: mocks.getChattingSeoDraft
}));

vi.mock("@/lib/repositories/seo-plan-item-edit-repository", () => ({
  findSeoPlanItemRow: mocks.findSeoPlanItemRow,
  updateSeoPlanItemRow: mocks.updateSeoPlanItemRow
}));

vi.mock("@/lib/repositories/seo-plan-items-repository", () => ({
  listSeoPlanItemRows: mocks.listSeoPlanItemRows
}));

vi.mock("@/lib/repositories/seo-generated-drafts-repository", () => ({
  findSeoGeneratedDraftRow: mocks.findSeoGeneratedDraftRow,
  findSeoGeneratedDraftRowByPlanItemId: mocks.findSeoGeneratedDraftRowByPlanItemId
}));

vi.mock("@/lib/repositories/seo-generated-draft-edit-repository", () => ({
  updateSeoGeneratedDraftRow: mocks.updateSeoGeneratedDraftRow
}));

vi.mock("@/lib/server-action-error-alerting", () => ({
  withServerActionErrorAlerting: (action: unknown) => action
}));

import {
  generatePublishingDraftFromPlanItemAction,
  regeneratePublishingDraftAction,
  regeneratePublishingPlanItemAction
} from "./dashboard-publishing-actions";

describe("dashboard publishing actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({ id: "user_1", email: "tina@usechatting.com", workspaceOwnerId: "owner_1" });
    mocks.canAccessDashboardPublishing.mockReturnValue(true);
  });

  it("warns when trying to regenerate a drafted plan item", async () => {
    mocks.findSeoPlanItemRow.mockResolvedValue({ id: "item_1", status: "drafted" });

    await expect(regeneratePublishingPlanItemAction("item_1")).resolves.toEqual({
      ok: false,
      tone: "warning",
      title: "Draft already exists.",
      message: "Regenerate the draft instead so the article stays in sync with this topic."
    });
  });

  it("generates one draft from a planned topic", async () => {
    mocks.findSeoPlanItemRow.mockResolvedValue({ id: "item_1", status: "planned" });
    mocks.generateDashboardPublishingDraft.mockResolvedValue({ created: true, draft: { slug: "shared-inbox" } });

    await expect(generatePublishingDraftFromPlanItemAction("item_1")).resolves.toEqual({
      ok: true,
      tone: "success",
      title: "Draft generated.",
      redirectPath: "/dashboard/publishing/shared-inbox"
    });
  });

  it("warns when a plan item already has a linked draft", async () => {
    mocks.findSeoPlanItemRow.mockResolvedValue({ id: "item_1", status: "drafted" });
    mocks.findSeoGeneratedDraftRowByPlanItemId.mockResolvedValue({ slug: "shared-inbox" });

    await expect(generatePublishingDraftFromPlanItemAction("item_1")).resolves.toEqual({
      ok: true,
      tone: "success",
      title: "Opening draft.",
      redirectPath: "/dashboard/publishing/shared-inbox"
    });
  });

  it("regenerates one planned topic in place", async () => {
    mocks.findSeoPlanItemRow.mockResolvedValue({ id: "item_1", run_id: "run_1", status: "planned", target_keyword: "old keyword" });
    mocks.listSeoPlanItemRows.mockResolvedValue([{ id: "item_1" }]);
    mocks.regenerateChattingSeoPlanItem.mockResolvedValue({
      title: "Shared inbox for website chat",
      targetKeyword: "shared inbox for website chat",
      keywordCluster: "shared inbox for website chat",
      searchIntent: "commercial",
      contentFormat: "article",
      personaSlug: "founders",
      themeSlug: "product",
      categorySlug: "product",
      ctaId: "see-pricing",
      priorityScore: 92,
      rationale: "Fresh topic",
      notes: "Updated",
      metadataJson: {}
    });
    mocks.updateSeoPlanItemRow.mockResolvedValue({ position: 7, target_keyword: "shared inbox for website chat" });

    await expect(regeneratePublishingPlanItemAction("item_1")).resolves.toEqual({
      ok: true,
      tone: "success",
      title: "Plan item regenerated.",
      message: "Day 7 now targets shared inbox for website chat."
    });
  });

  it("regenerates one draft in place while preserving the slug", async () => {
    mocks.findSeoGeneratedDraftRow.mockResolvedValue({
      id: "draft_1",
      slug: "shared-inbox",
      publication_status: "scheduled",
      plan_item_id: "item_1",
      draft_payload_json: { post: { publishedAt: "2026-04-20T09:00:00.000Z" } },
      metadata_json: {}
    });
    mocks.findSeoPlanItemRow.mockResolvedValue({ id: "item_1", target_publish_at: "2026-04-20T09:00:00.000Z", target_keyword: "shared inbox", title: "Shared inbox", cta_id: "see-pricing", category_slug: "product" });
    mocks.getChattingSeoDraft.mockResolvedValue({
      source: "ai",
      heroImagePrompt: "hero prompt",
      post: {
        title: "Shared inbox for website chat",
        slug: "new-slug",
        excerpt: "Excerpt",
        subtitle: "Subtitle",
        seoTitle: "SEO title",
        publicationStatus: "draft",
        publishedAt: "2026-04-20T09:00:00.000Z",
        updatedAt: "2026-04-13T10:00:00.000Z",
        readingTime: 8,
        authorSlug: "tina",
        categorySlug: "product",
        image: { src: "/blog/test.svg", alt: "Test" },
        relatedSlugs: [],
        sections: []
      }
    });
    mocks.updateSeoGeneratedDraftRow.mockResolvedValue({ slug: "shared-inbox" });

    await expect(regeneratePublishingDraftAction("draft_1")).resolves.toEqual({
      ok: true,
      tone: "success",
      title: "Draft regenerated.",
      message: "/shared-inbox was refreshed from the current plan item."
    });
    expect(mocks.updateSeoGeneratedDraftRow).toHaveBeenCalledWith(expect.objectContaining({ slug: "shared-inbox" }));
  });
});
