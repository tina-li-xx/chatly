"use server";

import { revalidatePath } from "next/cache";
import { updateSeoPlanItemStatus } from "@/lib/repositories/seo-plan-items-repository";
import {
  deleteSeoGeneratedDraftRow,
  findSeoGeneratedDraftRow
} from "@/lib/repositories/seo-generated-drafts-repository";
import {
  publishingErrorResult,
  requirePublishingUser,
  type DashboardPublishingActionResult,
  wrapDashboardPublishingAction
} from "./dashboard-publishing-action-shared";
import { buildPublishingSectionHref } from "./dashboard-publishing-section";

async function handleDeletePublishingDraftAction(draftId: string): Promise<DashboardPublishingActionResult> {
  const user = await requirePublishingUser();
  const draft = await findSeoGeneratedDraftRow(user.workspaceOwnerId, draftId);
  if (!draft) return publishingErrorResult("Draft not found.", "That draft may have been removed already.");
  if (draft.publication_status !== "draft") {
    return {
      ok: false,
      tone: "warning",
      title: "This post can't be deleted here.",
      message: "Only drafts that have not been scheduled or published can be deleted from preview."
    };
  }

  const deleted = await deleteSeoGeneratedDraftRow(user.workspaceOwnerId, draft.id);
  if (!deleted) return publishingErrorResult("Draft not deleted.", "Please try again in a moment.");
  if (deleted.plan_item_id) {
    await updateSeoPlanItemStatus({
      id: deleted.plan_item_id,
      ownerUserId: user.workspaceOwnerId,
      status: "planned"
    });
  }

  revalidatePath("/dashboard/publishing");
  revalidatePath("/dashboard/switchboard");
  revalidatePath(`/dashboard/publishing/${deleted.slug}`);

  return {
    ok: true,
    tone: "success",
    title: "Draft deleted.",
    message: deleted.plan_item_id
      ? `/${deleted.slug} was removed and the topic returned to Plans.`
      : `/${deleted.slug} was removed.`,
    redirectPath: buildPublishingSectionHref("drafts")
  };
}

export const deletePublishingDraftAction = wrapDashboardPublishingAction(
  handleDeletePublishingDraftAction,
  {
    actionId: "app/dashboard/dashboard-publishing-delete-draft-action.ts:deletePublishingDraftAction",
    fallbackTitle: "Couldn't delete that draft.",
    fallbackMessage: "Please try again in a moment."
  }
);
