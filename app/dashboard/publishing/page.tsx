import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDashboardPublishingQueuedPosts } from "@/lib/dashboard-publishing-posts";
import { ensureDashboardPublishingDraftAutopilot } from "@/lib/data/dashboard-publishing-drafts-bootstrap";
import { ensureDashboardPublishingSeoBootstrap } from "@/lib/data/dashboard-publishing-seo-bootstrap";
import { ensureDashboardPublishingStaticDraftMirror } from "@/lib/data/dashboard-publishing-static-drafts-bootstrap";
import { getDashboardPublishingSeoSnapshot } from "@/lib/data/dashboard-publishing-seo";
import { canAccessDashboardPublishing } from "@/lib/dashboard-publishing-access";
import { resolvePublishingSection } from "../dashboard-publishing-section";
import { DashboardPublishingPage } from "../dashboard-publishing-page";

type PublishingPageProps = {
  searchParams?: Promise<{
    section?: string | string[];
  }>;
};

export default async function PublishingPage({ searchParams }: PublishingPageProps = {}) {
  const params = (await searchParams) ?? {};
  const user = await requireUser();
  const requestedSection = Array.isArray(params.section) ? params.section[0] : params.section;
  const activeSection = resolvePublishingSection(requestedSection);
  const includeAnalysis = activeSection === "overview" || activeSection === "strategy";

  if (!canAccessDashboardPublishing(user.email)) {
    notFound();
  }

  await ensureDashboardPublishingSeoBootstrap({
    ownerUserId: user.workspaceOwnerId,
    actorUserId: user.id
  });
  await ensureDashboardPublishingStaticDraftMirror({
    ownerUserId: user.workspaceOwnerId,
    actorUserId: user.id
  });
  await ensureDashboardPublishingDraftAutopilot({
    ownerUserId: user.workspaceOwnerId,
    actorUserId: user.id
  });

  return (
    <DashboardPublishingPage
      key={activeSection}
      activeSection={activeSection}
      queuedPosts={await getDashboardPublishingQueuedPosts(user.workspaceOwnerId)}
      seoSnapshot={await getDashboardPublishingSeoSnapshot(user.workspaceOwnerId, { includeAnalysis })}
    />
  );
}
