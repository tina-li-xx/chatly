import "server-only";

import { randomUUID } from "node:crypto";
import { getChattingSeoDraft } from "@/lib/chatting-seo-draft";
import { toDraftPayloadPost } from "@/lib/chatting-seo-draft-shared";
import {
  findSeoGeneratedDraftRowBySlug,
  findSeoGeneratedDraftRowByPlanItemId,
  insertSeoGeneratedDraftRow
} from "@/lib/repositories/seo-generated-drafts-repository";
import type {
  SeoGeneratedDraftRow,
  SeoPlanItemRow
} from "@/lib/repositories/seo-pipeline-repository-shared";
import { updateSeoPlanItemStatus } from "@/lib/repositories/seo-plan-items-repository";

type DashboardPublishingDraftGenerationMode = "autopilot" | "manual";

function draftNotes(mode: DashboardPublishingDraftGenerationMode, source: "ai" | "fallback") {
  return mode === "autopilot"
    ? `Draft generated automatically from the publishing autopilot (${source}) using the stored keyword research plan.`
    : `Draft generated manually from the plans view (${source}) using the stored keyword research plan.`;
}

function nextSlugAttempt(slug: string, attempt: number) {
  return attempt === 0 ? slug : `${slug}-chatting${attempt === 1 ? "" : `-${attempt}`}`;
}

async function resolveUniqueGeneratedDraftSlug(ownerUserId: string, preferredSlug: string) {
  let attempt = 0;
  let candidate = preferredSlug;

  while (await findSeoGeneratedDraftRowBySlug(ownerUserId, candidate)) {
    attempt += 1;
    candidate = nextSlugAttempt(preferredSlug, attempt);
  }

  return candidate;
}

export async function generateDashboardPublishingDraft(input: {
  ownerUserId: string;
  actorUserId?: string | null;
  planItem: SeoPlanItemRow;
  mode: DashboardPublishingDraftGenerationMode;
}): Promise<{ created: boolean; draft: SeoGeneratedDraftRow | null }> {
  const existing = await findSeoGeneratedDraftRowByPlanItemId(input.ownerUserId, input.planItem.id);
  if (existing) {
    return { created: false, draft: existing };
  }

  const generated = await getChattingSeoDraft(input.planItem);
  const slug = await resolveUniqueGeneratedDraftSlug(input.ownerUserId, generated.post.slug);
  const inserted = await insertSeoGeneratedDraftRow({
    id: `seo_draft_${randomUUID()}`,
    ownerUserId: input.ownerUserId,
    actorUserId: input.actorUserId ?? null,
    planRunId: input.planItem.run_id,
    planItemId: input.planItem.id,
    status: "ready_for_review",
    title: generated.post.title,
    slug,
    excerpt: generated.post.excerpt,
    subtitle: generated.post.subtitle,
    authorSlug: generated.post.authorSlug,
    categorySlug: generated.post.categorySlug,
    publicationStatus: "draft",
    readingTime: generated.post.readingTime,
    heroImagePrompt: generated.heroImagePrompt,
    draftPayloadJson: toDraftPayloadPost({
      ...generated.post,
      slug,
      publicationStatus: "draft",
      publishedAt: input.planItem.target_publish_at || generated.post.publishedAt
    }),
    metadataJson: {
      source: generated.source,
      targetKeyword: input.planItem.target_keyword,
      targetPublishAt: input.planItem.target_publish_at,
      ...(input.mode === "autopilot" ? { autopilotGenerated: true } : { manualGenerated: true })
    }
  });

  if (!inserted) {
    return { created: false, draft: null };
  }

  await updateSeoPlanItemStatus({
    id: input.planItem.id,
    ownerUserId: input.ownerUserId,
    status: "drafted",
    notes: draftNotes(input.mode, generated.source)
  });

  return { created: true, draft: inserted };
}
