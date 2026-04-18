import { requireUser } from "@/lib/auth";
import { listVisitorPresenceSessions, listVisitorsPageConversationSummaries } from "@/lib/data";
import { DashboardVisitorsPage } from "../dashboard-visitors-page";

export default async function VisitorsPage() {
  const user = await requireUser();
  const [conversations, liveSessions] = await Promise.all([
    listVisitorsPageConversationSummaries(user.id),
    listVisitorPresenceSessions(user.id)
  ]);

  return <DashboardVisitorsPage initialConversations={conversations} initialLiveSessions={liveSessions} />;
}
