import type { DashboardBillingSummary } from "@/lib/data/billing";
import type { DashboardHomeGrowthData } from "@/lib/data/dashboard-growth-types";

const STARTER_CONVERSATION_LIMIT = 50;
const STARTER_UPGRADE_THRESHOLD = 40;

export function buildExpansion(billing: DashboardBillingSummary): DashboardHomeGrowthData["expansion"] {
  const prompts: DashboardHomeGrowthData["expansion"]["prompts"] = [];

  if (billing.planKey === "starter" && billing.usedSeats > 1) {
    prompts.push({
      id: "team" as const,
      tone: billing.seatLimit != null && billing.usedSeats >= billing.seatLimit ? "warning" : "neutral",
      title: billing.seatLimit != null && billing.usedSeats >= billing.seatLimit ? "Starter seats are full" : "Your inbox is becoming a team sport",
      description: "As more teammates join, upgrading keeps coverage, routing, and reporting from getting cramped.",
      action: { label: "Upgrade seats", href: "/dashboard/settings?section=billing" }
    });
  }

  if (billing.planKey === "starter" && billing.conversationCount >= STARTER_UPGRADE_THRESHOLD) {
    const remainingConversations = Math.max(STARTER_CONVERSATION_LIMIT - billing.conversationCount, 0);
    const limitReached = remainingConversations === 0;

    prompts.push({
      id: "conversations" as const,
      tone: limitReached ? "warning" : "neutral",
      title: limitReached ? "The monthly conversation cap is full" : "Your monthly conversation cap is getting close",
      description:
        remainingConversations === 1
          ? "Only one conversation remains on Starter this month."
          : remainingConversations === 0
            ? "Upgrade to keep new chats flowing without interruptions."
            : `${remainingConversations} conversations remain before Starter runs out this month.`,
      action: { label: "Upgrade now", href: "/dashboard/settings?section=billing" }
    });
  }

  if (billing.planKey !== "pro" && (billing.usedSeats > 1 || billing.conversationCount >= 10)) {
    prompts.push({
      id: "analytics" as const,
      tone: "neutral",
      title: "Unlock deeper analytics and API access",
      description: "Growing teams usually need more than basic reporting. Paid plans open up richer analytics and integration paths.",
      action: { label: "See plan benefits", href: "/dashboard/settings?section=billing" }
    });
  }

  return {
    title: "Expansion revenue",
    description:
      prompts.length > 0
        ? "Upgrade nudges appear when team usage, conversation volume, or reporting needs signal expansion potential."
        : billing.planKey === "pro"
          ? "You're already on Pro, so advanced reporting and API access are unlocked."
          : "No upgrade pressure yet. We'll surface expansion signals as the workspace grows.",
    prompts
  };
}
