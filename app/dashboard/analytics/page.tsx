import { requireUser } from "@/lib/auth";
import {
  getAnalyticsAiAssistActivityPageDataset,
  getAnalyticsAiAssistSectionDataset,
  getAnalyticsDataset
} from "@/lib/data/analytics";
import { resolveAnalyticsSection } from "../dashboard-analytics-section";
import { DashboardAnalyticsPage } from "../dashboard-analytics-page";

type AnalyticsPageProps = {
  searchParams?: Promise<{
    section?: string;
    activity?: string;
    type?: string;
    member?: string;
    date?: string;
    start?: string;
    end?: string;
  }>;
};

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps = {}) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : {};
  const activeSection = resolveAnalyticsSection(params.section);
  const showAllAiActivity = params.activity === "all";
  const dataset = showAllAiActivity
    ? await getAnalyticsAiAssistActivityPageDataset(user.id, {
        type: params.type,
        member: params.member,
        date: params.date,
        start: params.start,
        end: params.end
      }, {
        ownerUserId: user.workspaceOwnerId,
        viewerRole: user.workspaceRole
      })
    : activeSection === "aiAssist"
      ? await getAnalyticsAiAssistSectionDataset(user.id, {
          aiAssistRecentLimit: 30,
          ownerUserId: user.workspaceOwnerId,
          viewerRole: user.workspaceRole
        })
    : await getAnalyticsDataset(user.id, {
        aiAssistRecentLimit: 30,
        ownerUserId: user.workspaceOwnerId,
        viewerRole: user.workspaceRole
      });

  return (
    <DashboardAnalyticsPage
      initialDataset={dataset}
      userEmail={user.email}
      activeSection={activeSection}
      showAllAiActivity={showAllAiActivity}
    />
  );
}
