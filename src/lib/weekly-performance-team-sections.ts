import { displayNameFromEmail, initialsFromLabel } from "@/lib/user-display";
import type {
  WeeklyPerformanceHandledConversationRow,
  WeeklyPerformanceTeamMemberRow
} from "@/lib/repositories/weekly-performance-team-repository";
import {
  average,
  formatDuration,
  formatSatisfaction,
  percent
} from "@/lib/weekly-performance-format";
import type {
  WeeklyPerformancePersonalPerformance,
  WeeklyPerformanceTeamPerformance
} from "@/lib/weekly-performance-types";

function memberName(member: WeeklyPerformanceTeamMemberRow) {
  const name = [member.first_name, member.last_name].filter(Boolean).join(" ").trim();
  return name || displayNameFromEmail(member.email);
}

function memberMetrics(rows: WeeklyPerformanceHandledConversationRow[]) {
  const conversationCount = rows.length;
  const responseSeconds = rows.map((row) =>
    row.first_response_seconds == null ? null : Number(row.first_response_seconds)
  );
  const ratings = rows.map((row) => row.rating);
  const resolvedRate = conversationCount
    ? (rows.filter((row) => row.status === "resolved").length / conversationCount) * 100
    : null;
  const avgResponse = average(responseSeconds);
  const avgSatisfaction = average(ratings);

  return {
    conversationCount,
    conversationsLabel: `${conversationCount} conversation${conversationCount === 1 ? "" : "s"}`,
    avgResponseLabel: `${formatDuration(avgResponse)} avg`,
    resolutionLabel: `${percent(resolvedRate)} resolved`,
    satisfactionLabel: avgSatisfaction == null ? null : `⭐ ${formatSatisfaction(avgSatisfaction).replace(" / 5", "")}`
  };
}

export function buildWeeklyPerformanceTeamSections(input: {
  teamMembers: WeeklyPerformanceTeamMemberRow[];
  handledConversations: WeeklyPerformanceHandledConversationRow[];
}) {
  if (input.teamMembers.length < 2) {
    return {
      teamPerformance: [] as WeeklyPerformanceTeamPerformance[],
      personalPerformanceByUserId: {} as Record<string, WeeklyPerformancePersonalPerformance>
    };
  }

  const teamAverage = memberMetrics(input.handledConversations);
  const teamAverageLabel = [
    teamAverage.avgResponseLabel,
    teamAverage.resolutionLabel,
    teamAverage.satisfactionLabel
  ]
    .filter(Boolean)
    .join(" · ");

  const teamPerformance = input.teamMembers
    .map((member) => {
      const name = memberName(member);
      const rows = input.handledConversations.filter(
        (row) =>
          row.handler_user_id === member.user_id &&
          new Date(row.handled_at).getTime() >= new Date(member.joined_at).getTime()
      );
      const metrics = memberMetrics(rows);
      return {
        userId: member.user_id,
        name,
        initials: initialsFromLabel(name),
        ...metrics
      } satisfies WeeklyPerformanceTeamPerformance;
    })
    .sort((left, right) => right.conversationCount - left.conversationCount || left.name.localeCompare(right.name))
    .slice(0, 5);

  const personalPerformanceByUserId = Object.fromEntries(
    teamPerformance.map((member) => [
      member.userId,
      {
        userId: member.userId,
        name: member.name,
        conversationsLabel: member.conversationsLabel,
        avgResponseLabel: member.avgResponseLabel,
        resolutionLabel: member.resolutionLabel,
        satisfactionLabel: member.satisfactionLabel,
        teamAverageLabel
      } satisfies WeeklyPerformancePersonalPerformance
    ])
  );

  return {
    teamPerformance,
    personalPerformanceByUserId
  };
}
