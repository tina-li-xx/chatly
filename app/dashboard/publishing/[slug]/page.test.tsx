const mocks = vi.hoisted(() => ({
  notFound: vi.fn(),
  requireUser: vi.fn(),
  getDashboardPublishingQueuedPostBySlug: vi.fn(),
  getDashboardPublishingRelatedPosts: vi.fn(),
  findSeoGeneratedDraftRowBySlug: vi.fn(),
  ensureDashboardPublishingStaticDraftMirror: vi.fn()
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/data/dashboard-publishing-static-drafts-bootstrap", () => ({
  ensureDashboardPublishingStaticDraftMirror: mocks.ensureDashboardPublishingStaticDraftMirror
}));
vi.mock("@/lib/dashboard-publishing-posts", () => ({
  getDashboardPublishingQueuedPostBySlug: mocks.getDashboardPublishingQueuedPostBySlug,
  getDashboardPublishingRelatedPosts: mocks.getDashboardPublishingRelatedPosts
}));
vi.mock("@/lib/repositories/seo-generated-drafts-repository", () => ({
  findSeoGeneratedDraftRowBySlug: mocks.findSeoGeneratedDraftRowBySlug
}));
vi.mock("@/lib/seo-generated-blog-posts", () => ({
  toGeneratedBlogPost: vi.fn((row) => ({
    slug: row.slug,
    publicationStatus: "draft",
    category: { slug: "product" },
    relatedSlugs: []
  })),
  resolveGeneratedDraftWorkflowStatus: vi.fn(() => "ready_for_review"),
  resolveGeneratedDraftPublicationStatus: vi.fn(() => "draft")
}));
vi.mock("../../dashboard-publishing-preview-page", () => ({
  DashboardPublishingPreviewPage: ({ post, draft }: { post: { slug: string }; draft?: { id: string } | null }) => <div>preview:{post.slug}:{draft?.id ?? "none"}</div>
}));

import { renderToStaticMarkup } from "react-dom/server";
import PublishingPreviewRoute from "./page";

describe("dashboard publishing preview route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
    mocks.requireUser.mockResolvedValue({ id: "user_123", email: "tina@usechatting.com", workspaceOwnerId: "owner_123" });
    mocks.getDashboardPublishingQueuedPostBySlug.mockResolvedValue({ slug: "traffic-low-conversion" });
    mocks.getDashboardPublishingRelatedPosts.mockResolvedValue([]);
    mocks.findSeoGeneratedDraftRowBySlug.mockResolvedValue(null);
    mocks.ensureDashboardPublishingStaticDraftMirror.mockResolvedValue([]);
  });

  it("renders the queued preview for the allowed viewer", async () => {
    const html = renderToStaticMarkup(
      await PublishingPreviewRoute({ params: Promise.resolve({ slug: "traffic-low-conversion" }) })
    );

    expect(html).toContain("preview:traffic-low-conversion:none");
    expect(mocks.ensureDashboardPublishingStaticDraftMirror).toHaveBeenCalledWith({
      ownerUserId: "owner_123",
      actorUserId: "user_123"
    });
  });

  it("renders generated drafts even when they are no longer queued posts", async () => {
    mocks.getDashboardPublishingQueuedPostBySlug.mockResolvedValueOnce(null);
    mocks.findSeoGeneratedDraftRowBySlug.mockResolvedValueOnce({ id: "draft_1", slug: "draft-only" });

    const html = renderToStaticMarkup(
      await PublishingPreviewRoute({ params: Promise.resolve({ slug: "draft-only" }) })
    );

    expect(html).toContain("preview:draft-only:draft_1");
  });

  it("blocks other signed-in users and missing posts", async () => {
    mocks.requireUser.mockResolvedValueOnce({ id: "user_123", email: "alex@example.com", workspaceOwnerId: "owner_123" });
    await expect(
      PublishingPreviewRoute({ params: Promise.resolve({ slug: "traffic-low-conversion" }) })
    ).rejects.toThrow("NOT_FOUND");

    mocks.getDashboardPublishingQueuedPostBySlug.mockResolvedValueOnce(null);
    await expect(
      PublishingPreviewRoute({ params: Promise.resolve({ slug: "missing-post" }) })
    ).rejects.toThrow("NOT_FOUND");
  });
});
