"use server";

import { generateDashboardPublishingDraft } from "@/lib/dashboard-publishing-draft-generation";
import { getChattingSeoDraft } from "@/lib/chatting-seo-draft";
import { regenerateChattingSeoPlanItem } from "@/lib/chatting-seo-plan-item-regeneration";
import { readDraftPayloadPost, toDraftPayloadPost } from "@/lib/chatting-seo-draft-shared";
import {
  publishingErrorResult,
  readPublishingRecord,
  requirePublishingUser,
  type DashboardPublishingActionResult,
  wrapDashboardPublishingAction
} from "./dashboard-publishing-action-shared";
import { updateSeoGeneratedDraftRow } from "@/lib/repositories/seo-generated-draft-edit-repository";
import { findSeoGeneratedDraftRow, findSeoGeneratedDraftRowByPlanItemId } from "@/lib/repositories/seo-generated-drafts-repository";
import { findSeoPlanItemRow, updateSeoPlanItemRow } from "@/lib/repositories/seo-plan-item-edit-repository";
import { listSeoPlanItemRows } from "@/lib/repositories/seo-plan-items-repository";

function draftRedirectPath(slug: string) {
  return `/dashboard/publishing/${slug}`;
}

async function handleRegeneratePlanItemAction(itemId: string): Promise<DashboardPublishingActionResult> {
  const user = await requirePublishingUser();
  const item = await findSeoPlanItemRow(user.workspaceOwnerId, itemId);
  if (!item) return publishingErrorResult("Plan item not found.", "That topic may have been removed already.");
  if (item.status !== "planned") {
    return item.status === "drafted"
      ? { ok: false, tone: "warning", title: "Draft already exists.", message: "Regenerate the draft instead so the article stays in sync with this topic." }
      : { ok: false, tone: "warning", title: "This topic is locked.", message: "Only plan items that are still waiting for a draft can be regenerated here." };
  }

  const runItems = await listSeoPlanItemRows(user.workspaceOwnerId, item.run_id);
  const regenerated = await regenerateChattingSeoPlanItem({
    ownerUserId: user.workspaceOwnerId,
    actorUserId: user.id,
    item,
    runItems
  });
  const updated = await updateSeoPlanItemRow({
    id: item.id,
    ownerUserId: user.workspaceOwnerId,
    title: regenerated.title,
    targetKeyword: regenerated.targetKeyword,
    keywordCluster: regenerated.keywordCluster,
    searchIntent: regenerated.searchIntent,
    contentFormat: regenerated.contentFormat,
    personaSlug: regenerated.personaSlug,
    themeSlug: regenerated.themeSlug,
    categorySlug: regenerated.categorySlug,
    ctaId: regenerated.ctaId,
    priorityScore: regenerated.priorityScore,
    rationale: regenerated.rationale,
    notes: regenerated.notes,
    metadataJson: regenerated.metadataJson
  });

  if (!updated) return publishingErrorResult("Couldn't regenerate that topic.", "Please try again in a moment.");
  return { ok: true, tone: "success", title: "Plan item regenerated.", message: `Day ${updated.position} now targets ${updated.target_keyword}.` };
}

async function handleRegenerateDraftAction(draftId: string): Promise<DashboardPublishingActionResult> {
  const user = await requirePublishingUser();
  const draft = await findSeoGeneratedDraftRow(user.workspaceOwnerId, draftId);
  if (!draft) return publishingErrorResult("Draft not found.", "That draft may have been removed already.");
  if (!draft.plan_item_id) return publishingErrorResult("Draft can't be regenerated.", "This draft is no longer linked to a plan item.");

  const planItem = await findSeoPlanItemRow(user.workspaceOwnerId, draft.plan_item_id);
  if (!planItem) return publishingErrorResult("Plan item not found.", "The source topic for this draft is missing.");

  const regenerated = await getChattingSeoDraft(planItem);
  const previousPost = readDraftPayloadPost(draft.draft_payload_json);
  const nextPost = {
    ...regenerated.post,
    slug: draft.slug,
    publicationStatus: draft.publication_status,
    publishedAt: previousPost?.publishedAt || planItem.target_publish_at || regenerated.post.publishedAt,
    updatedAt: new Date().toISOString()
  };
  const updated = await updateSeoGeneratedDraftRow({
    id: draft.id,
    ownerUserId: user.workspaceOwnerId,
    title: nextPost.title,
    slug: draft.slug,
    excerpt: nextPost.excerpt,
    subtitle: nextPost.subtitle,
    authorSlug: nextPost.authorSlug,
    categorySlug: nextPost.categorySlug,
    readingTime: nextPost.readingTime,
    heroImagePrompt: regenerated.heroImagePrompt,
    draftPayloadJson: toDraftPayloadPost(nextPost),
    metadataJson: {
      ...readPublishingRecord(draft.metadata_json),
      source: regenerated.source,
      regeneratedManually: true,
      targetKeyword: planItem.target_keyword
    }
  });

  if (!updated) return publishingErrorResult("Couldn't regenerate that draft.", "Please try again in a moment.");
  return { ok: true, tone: "success", title: "Draft regenerated.", message: `/${updated.slug} was refreshed from the current plan item.` };
}

async function handleGenerateDraftFromPlanItemAction(itemId: string): Promise<DashboardPublishingActionResult> {
  const user = await requirePublishingUser();
  const item = await findSeoPlanItemRow(user.workspaceOwnerId, itemId);
  if (!item) return publishingErrorResult("Plan item not found.", "That topic may have been removed already.");
  if (item.status !== "planned") {
    const existing = await findSeoGeneratedDraftRowByPlanItemId(user.workspaceOwnerId, item.id);
    if (existing) {
      return {
        ok: true,
        tone: "success",
        title: "Opening draft.",
        redirectPath: draftRedirectPath(existing.slug)
      };
    }
    return { ok: false, tone: "warning", title: "This topic is locked.", message: "Only planned topics can generate a new draft from the Plans view." };
  }

  const result = await generateDashboardPublishingDraft({
    ownerUserId: user.workspaceOwnerId,
    actorUserId: user.id,
    planItem: item,
    mode: "manual"
  });
  if (!result.draft) return publishingErrorResult("Couldn't generate that draft.", "Please try again in a moment.");
  if (!result.created) {
    return {
      ok: true,
      tone: "success",
      title: "Opening draft.",
      redirectPath: draftRedirectPath(result.draft.slug)
    };
  }

  return {
    ok: true,
    tone: "success",
    title: "Draft generated.",
    redirectPath: draftRedirectPath(result.draft.slug)
  };
}

export const regeneratePublishingPlanItemAction = wrapDashboardPublishingAction(
  handleRegeneratePlanItemAction,
  {
    actionId: "app/dashboard/dashboard-publishing-actions.ts:regeneratePublishingPlanItemAction",
    fallbackTitle: "Couldn't regenerate that topic.",
    fallbackMessage: "Please try again in a moment."
  }
);

export const regeneratePublishingDraftAction = wrapDashboardPublishingAction(
  handleRegenerateDraftAction,
  {
    actionId: "app/dashboard/dashboard-publishing-actions.ts:regeneratePublishingDraftAction",
    fallbackTitle: "Couldn't regenerate that draft.",
    fallbackMessage: "Please try again in a moment."
  }
);

export const generatePublishingDraftFromPlanItemAction = wrapDashboardPublishingAction(
  handleGenerateDraftFromPlanItemAction,
  {
    actionId: "app/dashboard/dashboard-publishing-actions.ts:generatePublishingDraftFromPlanItemAction",
    fallbackTitle: "Couldn't generate that draft.",
    fallbackMessage: "Please try again in a moment."
  }
);
