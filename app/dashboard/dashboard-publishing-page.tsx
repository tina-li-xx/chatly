import type { BlogPostWithDetails } from "@/lib/blog-types";
import type { DashboardPublishingSeoSnapshot } from "@/lib/data/dashboard-publishing-seo";
import { DashboardPublishingSectionContent } from "./dashboard-publishing-section-content";
import { DashboardPublishingScaffold } from "./dashboard-publishing-scaffold";
import type { PublishingSection } from "./dashboard-publishing-types";

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
      <DashboardPublishingSectionContent
        activeSection={activeSection}
        queuedPosts={queuedPosts}
        seoSnapshot={seoSnapshot}
      />
    </DashboardPublishingScaffold>
  );
}
