import { requireUser } from "@/lib/auth";
import { DashboardHome } from "./dashboard-home";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <DashboardHome
      userId={user.id}
      workspaceOwnerId={user.workspaceOwnerId}
      canManageTeam={user.workspaceRole !== "member"}
    />
  );
}
