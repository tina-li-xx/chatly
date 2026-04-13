import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDashboardPublishingQueuedPosts } from "@/lib/dashboard-publishing-posts";
import { ensureDashboardPublishingDraftAutopilot } from "@/lib/data/dashboard-publishing-drafts-bootstrap";
import { ensureDashboardPublishingSeoBootstrap } from "@/lib/data/dashboard-publishing-seo-bootstrap";
import { ensureDashboardPublishingStaticDraftMirror } from "@/lib/data/dashboard-publishing-static-drafts-bootstrap";
import { getDashboardPublishingSeoSnapshot } from "@/lib/data/dashboard-publishing-seo";
import { getFounderSwitchboardData } from "@/lib/data/founder-switchboard";
import { canAccessFounderSwitchboard } from "@/lib/founder-switchboard-access";
import { DashboardSwitchboardPage } from "../dashboard-switchboard-page";
import { resolveSwitchboardCustomerFilter } from "../dashboard-switchboard-customers-filter";
import {
  getPublishingSectionForSwitchboard,
  resolveSwitchboardSection
} from "../dashboard-switchboard-section";

type SwitchboardPageProps = {
  searchParams?: Promise<{
    section?: string | string[];
    customerFilter?: string | string[];
  }>;
};

export default async function SwitchboardPage({ searchParams }: SwitchboardPageProps = {}) {
  const params = (await searchParams) ?? {};
  const user = await requireUser();
  const requestedSection = Array.isArray(params.section) ? params.section[0] : params.section;
  const requestedCustomerFilter = Array.isArray(params.customerFilter) ? params.customerFilter[0] : params.customerFilter;
  const activeSection = resolveSwitchboardSection(requestedSection);
  const activeCustomerFilter = resolveSwitchboardCustomerFilter(requestedCustomerFilter);

  if (!canAccessFounderSwitchboard(user.email)) {
    notFound();
  }

  const publishingSection = getPublishingSectionForSwitchboard(activeSection);

  if (publishingSection) {
    const includeAnalysis = publishingSection === "overview" || publishingSection === "strategy";

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
      <DashboardSwitchboardPage
        data={null}
        publishingData={{
          queuedPosts: await getDashboardPublishingQueuedPosts(user.workspaceOwnerId),
          seoSnapshot: await getDashboardPublishingSeoSnapshot(user.workspaceOwnerId, { includeAnalysis })
        }}
        activeSection={activeSection}
        activeCustomerFilter={activeCustomerFilter}
      />
    );
  }

  return (
    <DashboardSwitchboardPage
      data={await getFounderSwitchboardData()}
      publishingData={null}
      activeSection={activeSection}
      activeCustomerFilter={activeCustomerFilter}
    />
  );
}
