import { requireUser } from "@/lib/auth";
import { getDashboardTeamPageData } from "@/lib/data";
import { DashboardTeamPage } from "../dashboard-team-page";

export default async function TeamPage() {
  const user = await requireUser();
  const team = await getDashboardTeamPageData(user.id);

  return (
    <DashboardTeamPage
      canManageTeam={user.workspaceRole !== "member"}
      initialMembers={team.teamMembers}
      initialInvites={team.teamInvites}
    />
  );
}
