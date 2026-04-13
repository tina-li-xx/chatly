"use server";

import { revalidatePath } from "next/cache";
import { readDraftPayloadPost, toDraftPayloadPost } from "@/lib/chatting-seo-draft-shared";
import { getNextDashboardPublishingDate } from "@/lib/dashboard-publishing-cadence";
import { getDashboardPublishingQueuedPosts } from "@/lib/dashboard-publishing-posts";
import { formatBlogDate } from "@/lib/blog-utils";
import {
  type DashboardPublishingActionResult,
  publishingErrorResult,
  readPublishingRecord,
  requirePublishingUser,
  wrapDashboardPublishingAction
} from "./dashboard-publishing-action-shared";
import { updateSeoGeneratedDraftRow } from "@/lib/repositories/seo-generated-draft-edit-repository";
import { updateSeoPlanItemTargetPublishAt } from "@/lib/repositories/seo-plan-item-edit-repository";
import { findSeoGeneratedDraftRow } from "@/lib/repositories/seo-generated-drafts-repository";

function targetPublishAt(draft: Awaited<ReturnType<typeof findSeoGeneratedDraftRow>>) {
  const metadata = readPublishingRecord(draft?.metadata_json);
  const payloadPost = readDraftPayloadPost(draft?.draft_payload_json);
  const metadataValue = typeof metadata.targetPublishAt === "string" ? metadata.targetPublishAt : "";
  return metadataValue || payloadPost?.publishedAt || "";
}

async function loadPublishingDraft(draftId: string) {
  const user = await requirePublishingUser();
  const draft = await findSeoGeneratedDraftRow(user.workspaceOwnerId, draftId);
  return { draft, user };
}

async function updateDraftPublication(input: {
  draft: NonNullable<Awaited<ReturnType<typeof findSeoGeneratedDraftRow>>>;
  ownerUserId: string;
  workflowStatus: "approved" | "scheduled";
  publicationStatus: "draft" | "scheduled" | "published";
  approvedForScheduling: boolean;
  publishedAt: string;
}) {
  const payloadPost = readDraftPayloadPost(input.draft.draft_payload_json);
  if (!payloadPost) return publishingErrorResult("Draft payload missing.", "This draft is missing its article payload.");

  const metadata = readPublishingRecord(input.draft.metadata_json);
  const nextTargetPublishAt = input.publishedAt || (typeof metadata.targetPublishAt === "string" ? metadata.targetPublishAt : "");
  const updated = await updateSeoGeneratedDraftRow({
    id: input.draft.id,
    ownerUserId: input.ownerUserId,
    title: input.draft.title,
    slug: input.draft.slug,
    excerpt: input.draft.excerpt,
    subtitle: input.draft.subtitle,
    authorSlug: input.draft.author_slug,
    categorySlug: input.draft.category_slug,
    readingTime: input.draft.reading_time,
    heroImagePrompt: input.draft.hero_image_prompt,
    status: input.workflowStatus,
    publicationStatus: input.publicationStatus,
    draftPayloadJson: toDraftPayloadPost({
      ...payloadPost,
      publicationStatus: input.publicationStatus,
      publishedAt: input.publishedAt,
      updatedAt: new Date().toISOString()
    }),
    metadataJson: {
      ...metadata,
      approvedForScheduling: input.approvedForScheduling,
      targetPublishAt: nextTargetPublishAt
    }
  });

  if (!updated) return publishingErrorResult("Draft update failed.", "Please try again in a moment.");
  return updated;
}

async function syncPlanItemPublishDate(input: {
  draft: NonNullable<Awaited<ReturnType<typeof findSeoGeneratedDraftRow>>>;
  ownerUserId: string;
  targetPublishAt: string;
}) {
  if (!input.draft.plan_item_id) {
    return;
  }

  await updateSeoPlanItemTargetPublishAt({
    id: input.draft.plan_item_id,
    ownerUserId: input.ownerUserId,
    targetPublishAt: input.targetPublishAt
  });
}

function revalidatePublishedBlogPaths(slug: string, authorSlug?: string | null) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");

  if (authorSlug) {
    revalidatePath(`/blog/authors/${authorSlug}`);
  }
}

async function handleApproveDraftAction(draftId: string): Promise<DashboardPublishingActionResult> {
  const { draft: existingDraft, user } = await loadPublishingDraft(draftId);
  if (!existingDraft) return publishingErrorResult("Draft not found.", "That draft may have been removed already.");
  const updated = await updateDraftPublication({
    draft: existingDraft,
    ownerUserId: user.workspaceOwnerId,
    workflowStatus: "approved",
    publicationStatus: "draft",
    approvedForScheduling: false,
    publishedAt: targetPublishAt(existingDraft)
  });
  return "ok" in updated ? updated : { ok: true, tone: "success", title: "Draft approved.", message: `/${updated.slug} is now approved and stays in draft state.` };
}

async function handleApproveAndScheduleDraftAction(draftId: string): Promise<DashboardPublishingActionResult> {
  const { draft, user } = await loadPublishingDraft(draftId);
  if (!draft) return publishingErrorResult("Draft not found.", "That draft may have been removed already.");
  const publishAt = getNextDashboardPublishingDate(await getDashboardPublishingQueuedPosts(user.workspaceOwnerId));

  const updated = await updateDraftPublication({
    draft,
    ownerUserId: user.workspaceOwnerId,
    workflowStatus: "scheduled",
    publicationStatus: "scheduled",
    approvedForScheduling: true,
    publishedAt: publishAt
  });
  if ("ok" in updated) {
    return updated;
  }

  await syncPlanItemPublishDate({
    draft,
    ownerUserId: user.workspaceOwnerId,
    targetPublishAt: publishAt
  });
  return {
    ok: true,
    tone: "success",
    title: "Draft scheduled.",
    message: `/${updated.slug} is approved and scheduled for ${formatBlogDate(publishAt)}.`
  };
}

async function handlePublishDraftNowAction(draftId: string): Promise<DashboardPublishingActionResult> {
  const { draft, user } = await loadPublishingDraft(draftId);
  if (!draft) return publishingErrorResult("Draft not found.", "That draft may have been removed already.");
  const updated = await updateDraftPublication({
    draft,
    ownerUserId: user.workspaceOwnerId,
    workflowStatus: "approved",
    publicationStatus: "published",
    approvedForScheduling: true,
    publishedAt: new Date().toISOString()
  });
  if (!("ok" in updated)) {
    revalidatePublishedBlogPaths(updated.slug, updated.author_slug);
  }
  return "ok" in updated ? updated : { ok: true, tone: "success", title: "Draft published.", message: `/${updated.slug} is now live.` };
}

export const approvePublishingDraftAction = wrapDashboardPublishingAction(
  handleApproveDraftAction,
  {
    actionId: "app/dashboard/dashboard-publishing-approval-actions.ts:approvePublishingDraftAction",
    fallbackTitle: "Couldn't approve that draft.",
    fallbackMessage: "Please try again in a moment."
  }
);

export const approveAndSchedulePublishingDraftAction = wrapDashboardPublishingAction(
  handleApproveAndScheduleDraftAction,
  {
    actionId: "app/dashboard/dashboard-publishing-approval-actions.ts:approveAndSchedulePublishingDraftAction",
    fallbackTitle: "Couldn't schedule that draft.",
    fallbackMessage: "Please try again in a moment."
  }
);

export const publishPublishingDraftNowAction = wrapDashboardPublishingAction(
  handlePublishDraftNowAction,
  {
    actionId: "app/dashboard/dashboard-publishing-approval-actions.ts:publishPublishingDraftNowAction",
    fallbackTitle: "Couldn't publish that draft.",
    fallbackMessage: "Please try again in a moment."
  }
);
