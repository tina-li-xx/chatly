import { requireUser } from "@/lib/auth";
import { listConversationSummaries } from "@/lib/data";
import { DashboardVisitorsPage } from "../dashboard-visitors-page";

export default async function VisitorsPage() {
  const user = await requireUser();
  const conversations = await listConversationSummaries(user.id);

  return <DashboardVisitorsPage initialConversations={conversations} />;
}
