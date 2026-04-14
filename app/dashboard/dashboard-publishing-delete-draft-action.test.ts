const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  canAccessDashboardPublishing: vi.fn(),
  findSeoGeneratedDraftRow: vi.fn(),
  deleteSeoGeneratedDraftRow: vi.fn(),
  updateSeoPlanItemStatus: vi.fn(),
  revalidatePath: vi.fn()
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/dashboard-publishing-access", () => ({ canAccessDashboardPublishing: mocks.canAccessDashboardPublishing }));
vi.mock("@/lib/repositories/seo-generated-drafts-repository", () => ({
  findSeoGeneratedDraftRow: mocks.findSeoGeneratedDraftRow,
  deleteSeoGeneratedDraftRow: mocks.deleteSeoGeneratedDraftRow
}));
vi.mock("@/lib/repositories/seo-plan-items-repository", () => ({
  updateSeoPlanItemStatus: mocks.updateSeoPlanItemStatus
}));
vi.mock("@/lib/server-action-error-alerting", () => ({
  withServerActionErrorAlerting: (action: unknown) => action
}));

import { deletePublishingDraftAction } from "./dashboard-publishing-delete-draft-action";

describe("dashboard publishing delete draft action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({ id: "user_1", email: "tina@usechatting.com", workspaceOwnerId: "owner_1" });
    mocks.canAccessDashboardPublishing.mockReturnValue(true);
  });

  it("deletes a draft preview row and restores its plan item", async () => {
    mocks.findSeoGeneratedDraftRow.mockResolvedValue({ id: "draft_1", slug: "shared-inbox", plan_item_id: "item_1", publication_status: "draft" });
    mocks.deleteSeoGeneratedDraftRow.mockResolvedValue({ id: "draft_1", slug: "shared-inbox", plan_item_id: "item_1" });

    await expect(deletePublishingDraftAction("draft_1")).resolves.toEqual({
      ok: true,
      tone: "success",
      title: "Draft deleted.",
      message: "/shared-inbox was removed and the topic returned to Plans.",
      redirectPath: "/dashboard/switchboard?section=publishing-drafts"
    });
    expect(mocks.updateSeoPlanItemStatus).toHaveBeenCalledWith({
      id: "item_1",
      ownerUserId: "owner_1",
      status: "planned"
    });
  });

  it("refuses to delete scheduled or published posts from preview", async () => {
    mocks.findSeoGeneratedDraftRow.mockResolvedValue({ id: "draft_1", publication_status: "scheduled" });

    await expect(deletePublishingDraftAction("draft_1")).resolves.toEqual({
      ok: false,
      tone: "warning",
      title: "This post can't be deleted here.",
      message: "Only drafts that have not been scheduled or published can be deleted from preview."
    });
    expect(mocks.deleteSeoGeneratedDraftRow).not.toHaveBeenCalled();
  });
});
