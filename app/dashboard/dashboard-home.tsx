import { getDashboardHomeData } from "@/lib/data/dashboard-home";
import type { DashboardHomeRangeDays } from "@/lib/data/dashboard-home-chart";
import { displayNameFromEmail, firstNameFromDisplayName, initialsFromLabel } from "@/lib/user-display";
import { DashboardHomeMetrics } from "./dashboard-home-metrics";
import { DashboardHomeRecentConversations } from "./dashboard-home-recent-conversations";
import { DashboardHomeSidebar } from "./dashboard-home-sidebar";

export async function DashboardHome({
  userEmail,
  userId,
  rangeDays
}: {
  userEmail: string;
  userId: string;
  rangeDays: DashboardHomeRangeDays;
}) {
  const data = await getDashboardHomeData(userId, rangeDays);
  const profileName = displayNameFromEmail(userEmail);
  const firstName = firstNameFromDisplayName(profileName);
  const teamRows = [
    {
      name: firstName,
      initials: initialsFromLabel(profileName),
      status: "Online",
      tone: "bg-green-500",
      activeCount: Math.max(data.openConversations, 0)
    },
    {
      name: "Add teammate",
      initials: "+",
      status: "Invite",
      tone: "bg-slate-400",
      activeCount: null
    }
  ];

  return (
    <div className="space-y-6">
      <DashboardHomeMetrics data={data} />
      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <DashboardHomeRecentConversations conversations={data.recentConversations} />
        <DashboardHomeSidebar data={data} teamRows={teamRows} />
      </section>
    </div>
  );
}
