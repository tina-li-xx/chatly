const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  canAccessDashboardPublishing: vi.fn(),
  findSeoGeneratedDraftRow: vi.fn(),
  updateSeoGeneratedDraftRow: vi.fn(),
  revalidatePath: vi.fn()
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/dashboard-publishing-access", () => ({ canAccessDashboardPublishing: mocks.canAccessDashboardPublishing }));
vi.mock("@/lib/dashboard-publishing-posts", () => ({ getDashboardPublishingQueuedPosts: vi.fn() }));
vi.mock("@/lib/repositories/seo-generated-drafts-repository", () => ({
  findSeoGeneratedDraftRow: mocks.findSeoGeneratedDraftRow
}));
vi.mock("@/lib/repositories/seo-generated-draft-edit-repository", () => ({
  updateSeoGeneratedDraftRow: mocks.updateSeoGeneratedDraftRow
}));
vi.mock("@/lib/repositories/seo-plan-item-edit-repository", () => ({
  updateSeoPlanItemTargetPublishAt: vi.fn()
}));
vi.mock("@/lib/server-action-error-alerting", () => ({
  withServerActionErrorAlerting: (action: unknown) => action
}));

import { publishPublishingDraftNowAction } from "./dashboard-publishing-approval-actions";

describe("dashboard publishing approval revalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-13T02:30:00.000Z"));
    mocks.requireUser.mockResolvedValue({ id: "user_1", email: "tina@usechatting.com", workspaceOwnerId: "owner_1" });
    mocks.canAccessDashboardPublishing.mockReturnValue(true);
    mocks.findSeoGeneratedDraftRow.mockResolvedValue({
      id: "draft_1",
      slug: "shared-inbox",
      title: "Shared inbox",
      excerpt: "Excerpt",
      subtitle: "Subtitle",
      author_slug: "tina",
      category_slug: "product",
      reading_time: 8,
      hero_image_prompt: "Hero",
      metadata_json: {},
      draft_payload_json: {
        post: {
          slug: "shared-inbox",
          title: "Shared inbox",
          excerpt: "Excerpt",
          subtitle: "Subtitle",
          publicationStatus: "draft",
          publishedAt: "2026-04-20T09:00:00.000Z",
          updatedAt: "2026-04-13T09:00:00.000Z",
          readingTime: 8,
          authorSlug: "tina",
          categorySlug: "product",
          image: { src: "/blog/test.svg", alt: "Test" },
          relatedSlugs: [],
          sections: []
        }
      }
    });
    mocks.updateSeoGeneratedDraftRow.mockResolvedValue({
      slug: "shared-inbox",
      author_slug: "tina"
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("revalidates public blog pages and sitemap when a draft is published now", async () => {
    await publishPublishingDraftNowAction("draft_1");

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/blog");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/blog/shared-inbox");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/blog/authors/tina");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
  });
});
