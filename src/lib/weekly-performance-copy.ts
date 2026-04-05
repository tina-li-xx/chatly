import type { WeeklyPerformanceTip } from "@/lib/weekly-performance-types";

type InsightInput = {
  totalConversations: number;
  previousConversations: number;
  avgResponseSeconds: number | null;
  previousAvgResponseSeconds: number | null;
  resolutionRate: number | null;
  previousResolutionRate: number | null;
  satisfactionScore: number | null;
  previousSatisfactionScore: number | null;
};

const WEEKLY_TIPS: WeeklyPerformanceTip[] = [
  {
    text: "Save a few quick replies for common questions to keep first-response time down.",
    href: "/dashboard/settings?section=savedReplies",
    label: "Create saved replies"
  },
  {
    text: "Review your widget welcome message on the pages that started the most chats this week.",
    href: "/dashboard/widget",
    label: "Open widget settings"
  },
  {
    text: "Use teammate mentions in notes when a follow-up needs the right person quickly.",
    href: "/dashboard/settings?section=reports",
    label: "Review team settings"
  },
  {
    text: "Check your analytics after the report lands so you can compare this week against the trend line.",
    href: "/dashboard/analytics?range=last_week",
    label: "View analytics"
  }
];

export function getWeeklyPerformanceTip(weekStart: string) {
  const seed = Number(weekStart.replaceAll("-", "")) || 0;
  return WEEKLY_TIPS[seed % WEEKLY_TIPS.length] ?? WEEKLY_TIPS[0];
}

export function getWeeklyPerformanceInsight(input: InsightInput) {
  if (input.totalConversations <= 0) {
    return "Quiet week. Use it to tune your widget copy and saved replies before traffic picks up again.";
  }

  if (!input.previousConversations) {
    return `Your first full weekly report is in. ${input.totalConversations} conversations gives you a solid baseline to build from.`;
  }

  if (
    input.avgResponseSeconds != null &&
    input.previousAvgResponseSeconds != null &&
    input.previousAvgResponseSeconds > input.avgResponseSeconds
  ) {
    const improvement = Math.round(
      ((input.previousAvgResponseSeconds - input.avgResponseSeconds) / input.previousAvgResponseSeconds) * 100
    );
    if (improvement >= 10) {
      return `Response time improved ${improvement}% week over week, which usually shows up fastest in visitor confidence.`;
    }
  }

  if (
    input.satisfactionScore != null &&
    input.previousSatisfactionScore != null &&
    input.satisfactionScore >= 4.8 &&
    input.satisfactionScore > input.previousSatisfactionScore
  ) {
    return "Visitor satisfaction climbed again this week, so the team’s responses are landing well.";
  }

  if (
    input.resolutionRate != null &&
    input.previousResolutionRate != null &&
    input.resolutionRate >= input.previousResolutionRate + 8
  ) {
    return "Resolution rate jumped this week, which suggests the team closed loops faster instead of letting chats linger.";
  }

  if (input.totalConversations > input.previousConversations) {
    const lift = Math.round(((input.totalConversations - input.previousConversations) / input.previousConversations) * 100);
    return `Conversation volume was up ${lift}% from last week, so this is a good moment to check which pages or hours drove the increase.`;
  }

  return "The weekly report is stable this cycle, which makes it a good checkpoint for where the inbox is holding steady and where it is drifting.";
}
