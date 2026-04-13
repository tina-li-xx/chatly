const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  canAccessDashboardPublishing: vi.fn(),
  getDashboardPublishingQueuedPosts: vi.fn(),
  findSeoGeneratedDraftRow: vi.fn(),
  updateSeoGeneratedDraftRow: vi.fn(),
  updateSeoPlanItemTargetPublishAt: vi.fn()
}));

vi.mock("@/lib/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/dashboard-publishing-access", () => ({ canAccessDashboardPublishing: mocks.canAccessDashboardPublishing }));
vi.mock("@/lib/dashboard-publishing-posts", () => ({ getDashboardPublishingQueuedPosts: mocks.getDashboardPublishingQueuedPosts }));
vi.mock("@/lib/repositories/seo-generated-drafts-repository", () => ({
  findSeoGeneratedDraftRow: mocks.findSeoGeneratedDraftRow
}));
vi.mock("@/lib/repositories/seo-generated-draft-edit-repository", () => ({
  updateSeoGeneratedDraftRow: mocks.updateSeoGeneratedDraftRow
}));
vi.mock("@/lib/repositories/seo-plan-item-edit-repository", () => ({
  updateSeoPlanItemTargetPublishAt: mocks.updateSeoPlanItemTargetPublishAt
}));
vi.mock("@/lib/server-action-error-alerting", () => ({
  withServerActionErrorAlerting: (action: unknown) => action
}));

import {
  approveAndSchedulePublishingDraftAction,
  approvePublishingDraftAction,
  publishPublishingDraftNowAction
} from "./dashboard-publishing-approval-actions";

const draftRow = {
  id: "draft_1",
  plan_item_id: "item_1",
  slug: "shared-inbox",
  title: "Shared inbox",
  excerpt: "Excerpt",
  subtitle: "Subtitle",
  author_slug: "tina",
  category_slug: "product",
  reading_time: 8,
  hero_image_prompt: "Hero",
  metadata_json: { targetPublishAt: "2026-04-20T09:00:00.000Z" },
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
};

describe("dashboard publishing approval actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-13T02:30:00.000Z"));
    mocks.requireUser.mockResolvedValue({ id: "user_1", email: "tina@usechatting.com", workspaceOwnerId: "owner_1" });
    mocks.canAccessDashboardPublishing.mockReturnValue(true);
    mocks.getDashboardPublishingQueuedPosts.mockResolvedValue([
      { publicationStatus: "scheduled", publishedAt: "2026-04-13T09:00:00.000Z" },
      { publicationStatus: "scheduled", publishedAt: "2026-04-14T09:00:00.000Z" },
      { publicationStatus: "scheduled", publishedAt: "2026-04-15T09:00:00.000Z" },
      { publicationStatus: "draft", publishedAt: "2026-04-14T09:00:00.000Z" }
    ]);
    mocks.findSeoGeneratedDraftRow.mockResolvedValue(draftRow);
    mocks.updateSeoGeneratedDraftRow.mockResolvedValue(draftRow);
    mocks.updateSeoPlanItemTargetPublishAt.mockResolvedValue({ id: "item_1" });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("approves a draft without scheduling it", async () => {
    await expect(approvePublishingDraftAction("draft_1")).resolves.toEqual({
      ok: true,
      tone: "success",
      title: "Draft approved.",
      message: "/shared-inbox is now approved and stays in draft state."
    });
    expect(mocks.updateSeoGeneratedDraftRow).toHaveBeenCalledWith(expect.objectContaining({
      metadataJson: expect.objectContaining({
        approvedForScheduling: false,
        targetPublishAt: "2026-04-20T09:00:00.000Z"
      }),
      draftPayloadJson: expect.objectContaining({
        post: expect.objectContaining({
          publicationStatus: "draft",
          publishedAt: "2026-04-20T09:00:00.000Z"
        })
      })
    }));
    expect(mocks.updateSeoGeneratedDraftRow).toHaveBeenCalledWith(expect.objectContaining({
      status: "approved",
      publicationStatus: "draft"
    }));
  });

  it("approves and schedules a draft for its target publish date", async () => {
    await expect(approveAndSchedulePublishingDraftAction("draft_1")).resolves.toEqual({
      ok: true,
      tone: "success",
      title: "Draft scheduled.",
      message: "/shared-inbox is approved and scheduled for 16 Apr 2026."
    });
    expect(mocks.updateSeoGeneratedDraftRow).toHaveBeenCalledWith(expect.objectContaining({
      metadataJson: expect.objectContaining({
        approvedForScheduling: true,
        targetPublishAt: "2026-04-16T09:00:00.000Z"
      }),
      draftPayloadJson: expect.objectContaining({
        post: expect.objectContaining({
          publicationStatus: "scheduled",
          publishedAt: "2026-04-16T09:00:00.000Z"
        })
      })
    }));
    expect(mocks.updateSeoGeneratedDraftRow).toHaveBeenCalledWith(expect.objectContaining({
      status: "scheduled",
      publicationStatus: "scheduled"
    }));
    expect(mocks.updateSeoPlanItemTargetPublishAt).toHaveBeenCalledWith({
      id: "item_1",
      ownerUserId: "owner_1",
      targetPublishAt: "2026-04-16T09:00:00.000Z"
    });
  });

  it("publishes a draft immediately", async () => {
    await expect(publishPublishingDraftNowAction("draft_1")).resolves.toMatchObject({
      ok: true,
      tone: "success",
      title: "Draft published."
    });
    expect(mocks.updateSeoGeneratedDraftRow).toHaveBeenCalledWith(expect.objectContaining({
      metadataJson: expect.objectContaining({
        approvedForScheduling: true,
        targetPublishAt: "2026-04-13T02:30:00.000Z"
      }),
      draftPayloadJson: expect.objectContaining({
        post: expect.objectContaining({
          publicationStatus: "published",
          publishedAt: "2026-04-13T02:30:00.000Z"
        })
      })
    }));
    expect(mocks.updateSeoGeneratedDraftRow).toHaveBeenCalledWith(expect.objectContaining({
      status: "approved",
      publicationStatus: "published"
    }));
  });

  it("still schedules drafts that do not have a saved target publish date", async () => {
    mocks.findSeoGeneratedDraftRow.mockResolvedValueOnce({
      ...draftRow,
      plan_item_id: null,
      metadata_json: {},
      draft_payload_json: { post: { ...draftRow.draft_payload_json.post, publishedAt: "" } }
    });

    await expect(approveAndSchedulePublishingDraftAction("draft_1")).resolves.toEqual({
      ok: true,
      tone: "success",
      title: "Draft scheduled.",
      message: "/shared-inbox is approved and scheduled for 16 Apr 2026."
    });
    expect(mocks.updateSeoGeneratedDraftRow).toHaveBeenCalledWith(expect.objectContaining({
      draftPayloadJson: expect.objectContaining({
        post: expect.objectContaining({ publishedAt: "2026-04-16T09:00:00.000Z" })
      })
    }));
    expect(mocks.updateSeoPlanItemTargetPublishAt).not.toHaveBeenCalled();
  });
});
