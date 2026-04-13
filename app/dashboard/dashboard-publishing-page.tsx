import type { BlogPostWithDetails } from "@/lib/blog-types";
import type { DashboardPublishingSeoSnapshot } from "@/lib/data/dashboard-publishing-seo";
import { DashboardPublishingDraftsSection } from "./dashboard-publishing-drafts-section";
import { DashboardPublishingOverviewSection } from "./dashboard-publishing-overview-section";
import { DashboardPublishingPlanRunsSection } from "./dashboard-publishing-plan-runs-section";
import { DashboardPublishingQueueSection } from "./dashboard-publishing-queue-section";
import { DashboardPublishingScaffold } from "./dashboard-publishing-scaffold";
import { DashboardPublishingStrategySection } from "./dashboard-publishing-strategy-section";
import type { PublishingSection } from "./dashboard-publishing-types";

function renderSection(
  activeSection: PublishingSection,
  queuedPosts: BlogPostWithDetails[],
  seoSnapshot: DashboardPublishingSeoSnapshot
) {
  switch (activeSection) {
    case "strategy":
      return <DashboardPublishingStrategySection snapshot={seoSnapshot} />;
    case "plans":
      return <DashboardPublishingPlanRunsSection snapshot={seoSnapshot} />;
    case "drafts":
      return <DashboardPublishingDraftsSection snapshot={seoSnapshot} />;
    case "queue":
      return <DashboardPublishingQueueSection queuedPosts={queuedPosts} />;
    case "overview":
    default:
      return <DashboardPublishingOverviewSection snapshot={seoSnapshot} queuedPostCount={queuedPosts.length} />;
  }
}

export function DashboardPublishingPage({
  queuedPosts,
  seoSnapshot,
  activeSection = "overview"
}: {
  queuedPosts: BlogPostWithDetails[];
  seoSnapshot: DashboardPublishingSeoSnapshot;
  activeSection?: PublishingSection;
}) {
  return (
    <DashboardPublishingScaffold activeSection={activeSection}>
      {renderSection(activeSection, queuedPosts, seoSnapshot)}
    </DashboardPublishingScaffold>
  );
}
