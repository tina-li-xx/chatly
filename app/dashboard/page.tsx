import { requireUser } from "@/lib/auth";
import { DashboardHome } from "./dashboard-home";

export default async function DashboardPage() {
  const user = await requireUser();

  return <DashboardHome userEmail={user.email} userId={user.id} />;
}
