import { requireUser } from "@/lib/auth";
import {
  getConversationById,
  getDashboardStats,
  listConversationSummaries,
  listSitesForUser
} from "@/lib/data";
import { DashboardClient } from "../dashboard-client";

type DashboardInboxPageProps = {
  searchParams: Promise<{
    id?: string;
  }>;
};

export default async function DashboardInboxPage({ searchParams }: DashboardInboxPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const [conversations, stats, sites] = await Promise.all([
    listConversationSummaries(user.id),
    getDashboardStats(user.id),
    listSitesForUser(user.id)
  ]);

  const activeId = params.id || null;
  const activeConversation = activeId ? await getConversationById(activeId, user.id) : null;

  return (
    <DashboardClient
      userEmail={user.email}
      initialStats={stats}
      initialSites={sites}
      initialConversations={conversations}
      initialActiveConversation={activeConversation}
    />
  );
}
