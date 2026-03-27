import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDashboardNotificationSettings, getUserOnboardingStep, listConversationSummaries } from "@/lib/data";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const onboardingStep = await getUserOnboardingStep(user.id);

  if (onboardingStep !== "done") {
    redirect(`/onboarding?step=${onboardingStep}`);
  }

  const [conversations, notificationSettings] = await Promise.all([
    listConversationSummaries(user.id),
    getDashboardNotificationSettings(user.id)
  ]);
  const unreadCount = conversations.reduce((count, conversation) => count + conversation.unreadCount, 0);

  return (
    <DashboardShell userEmail={user.email} unreadCount={unreadCount} notificationSettings={notificationSettings}>
      {children}
    </DashboardShell>
  );
}
