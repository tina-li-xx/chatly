import type { BlogPostWithDetails } from "@/lib/blog-types";
import type { DashboardPublishingSeoSnapshot } from "@/lib/data/dashboard-publishing-seo";
import type { FounderSwitchboardData } from "@/lib/data/founder-switchboard";
import { DashboardPublishingSectionContent } from "./dashboard-publishing-section-content";
import { DashboardSwitchboardActivitySection } from "./dashboard-switchboard-activity-section";
import { DashboardSwitchboardAttentionSection } from "./dashboard-switchboard-attention-section";
import type { SwitchboardCustomerFilter } from "./dashboard-switchboard-customers-filter";
import { DashboardSwitchboardCustomersSection } from "./dashboard-switchboard-customers-section";
import { DashboardSwitchboardOverviewSection } from "./dashboard-switchboard-overview-section";
import { DashboardSwitchboardScaffold } from "./dashboard-switchboard-scaffold";
import {
  getPublishingSectionForSwitchboard,
  type SwitchboardSection
} from "./dashboard-switchboard-section";
import { getSwitchboardPageCopy } from "./dashboard-switchboard-shared";

export function DashboardSwitchboardPage({
  data,
  publishingData,
  activeSection,
  activeCustomerFilter
}: {
  data: FounderSwitchboardData | null;
  publishingData?: {
    queuedPosts: BlogPostWithDetails[];
    seoSnapshot: DashboardPublishingSeoSnapshot;
  } | null;
  activeSection: SwitchboardSection;
  activeCustomerFilter: SwitchboardCustomerFilter;
}) {
  const publishingSection = getPublishingSectionForSwitchboard(activeSection);
  const pageCopy = getSwitchboardPageCopy(activeSection);

  return (
    <DashboardSwitchboardScaffold activeSection={activeSection}>
      {publishingSection && publishingData ? (
        <DashboardPublishingSectionContent
          activeSection={publishingSection}
          queuedPosts={publishingData.queuedPosts}
          seoSnapshot={publishingData.seoSnapshot}
        />
      ) : null}

      {!publishingSection && data && activeSection === "overview" ? (
        <DashboardSwitchboardOverviewSection
          data={data}
          title={pageCopy.title}
          subtitle={pageCopy.subtitle}
        />
      ) : null}

      {!publishingSection && data && activeSection === "attention" ? (
        <DashboardSwitchboardAttentionSection
          items={data.attentionItems}
          title={pageCopy.title}
          subtitle={pageCopy.subtitle}
        />
      ) : null}

      {!publishingSection && data && activeSection === "activity" ? (
        <DashboardSwitchboardActivitySection
          items={data.recentActivity}
          title={pageCopy.title}
          subtitle={pageCopy.subtitle}
        />
      ) : null}

      {!publishingSection && data && activeSection === "customers" ? (
        <DashboardSwitchboardCustomersSection
          workspaces={data.workspaces}
          title={pageCopy.title}
          subtitle={pageCopy.subtitle}
          activeFilter={activeCustomerFilter}
        />
      ) : null}
    </DashboardSwitchboardScaffold>
  );
}
