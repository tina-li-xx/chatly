import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ensureDashboardPublishingStaticDraftMirror } from "@/lib/data/dashboard-publishing-static-drafts-bootstrap";
import { canAccessDashboardPublishing } from "@/lib/dashboard-publishing-access";
import { getDashboardPublishingQueuedPostBySlug, getDashboardPublishingRelatedPosts } from "@/lib/dashboard-publishing-posts";
import { findSeoGeneratedDraftRowBySlug } from "@/lib/repositories/seo-generated-drafts-repository";
import {
  resolveGeneratedDraftPublicationStatus,
  resolveGeneratedDraftWorkflowStatus,
  toGeneratedBlogPost
} from "@/lib/seo-generated-blog-posts";
import { DashboardPublishingPreviewPage } from "../../dashboard-publishing-preview-page";

type PublishingPreviewRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublishingPreviewRoute({ params }: PublishingPreviewRouteProps) {
  const user = await requireUser();

  if (!canAccessDashboardPublishing(user.email)) {
    notFound();
  }

  await ensureDashboardPublishingStaticDraftMirror({
    ownerUserId: user.workspaceOwnerId,
    actorUserId: user.id
  });

  const { slug } = await params;
  const draft = await findSeoGeneratedDraftRowBySlug(user.workspaceOwnerId, slug);
  const post = draft
    ? toGeneratedBlogPost(draft) ?? await getDashboardPublishingQueuedPostBySlug(user.workspaceOwnerId, slug)
    : await getDashboardPublishingQueuedPostBySlug(user.workspaceOwnerId, slug);

  if (!post) {
    notFound();
  }

  return (
    <DashboardPublishingPreviewPage
      post={post}
      relatedPosts={await getDashboardPublishingRelatedPosts(user.workspaceOwnerId, post)}
      draft={draft ? {
        id: draft.id,
        workflowStatus: resolveGeneratedDraftWorkflowStatus(draft),
        publicationStatus: resolveGeneratedDraftPublicationStatus(draft) || draft.publication_status
      } : null}
    />
  );
}
