import {
  resolveAiAssistActivityFiltersFromSearchParams,
  resolveAiAssistActivityQuery
} from "@/lib/data/analytics-ai-assist-activity-query";
import {
  normalizeDashboardAiAssistConversationSubject
} from "@/lib/data/settings-ai-assist-activity-copy";
import { dashboardAiAssistActorLabel } from "@/lib/data/settings-ai-assist-activity-map";
import { requireJsonRouteUser } from "@/lib/route-helpers";
import { listWorkspaceAiAssistFilteredActivityRows } from "@/lib/repositories/ai-assist-activity-page-repository";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

function toCsvValue(value: string | null) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function formatCsvDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

function formatCsvTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date(value));
}

function csvTypeLabel(value: "summary" | "reply" | "rewrite" | "tags") {
  if (value === "reply") return "reply_suggestion";
  if (value === "tags") return "tag_suggestion";
  return value;
}

function csvOutcomeLabel(value: "requested" | "shown" | "used" | "dismissed" | "applied") {
  return value === "shown" ? "generated" : value;
}

function csvEditedValue(metadata: Record<string, unknown> | null) {
  return metadata?.editLevel === "light" || metadata?.editLevel === "heavy"
    ? metadata.editLevel
    : metadata?.edited === true
      ? "true"
      : "false";
}

function exportFileName(range: { start: string; end: string }) {
  const start = new Date(range.start);
  const end = new Date(new Date(range.end).getTime() - 24 * 60 * 60 * 1000);
  const month = new Intl.DateTimeFormat("en-GB", { month: "short" });
  const startLabel = `${month.format(start).toLowerCase()}-${start.getDate()}`;
  const endLabel = `${month.format(end).toLowerCase()}-${end.getDate()}-${end.getFullYear()}`;
  return `ai-assist-activity-${startLabel}-to-${endLabel}.csv`;
}

async function handleGET(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const filters = resolveAiAssistActivityFiltersFromSearchParams(searchParams);
  const activityQuery = resolveAiAssistActivityQuery({
    viewerUserId: auth.user.id,
    viewerRole: auth.user.workspaceRole,
    filters
  });
  const rows = await listWorkspaceAiAssistFilteredActivityRows({
    ownerUserId: auth.user.workspaceOwnerId,
    actorUserId: activityQuery.actorUserId,
    feature: activityQuery.feature,
    rangeStart: activityQuery.rangeStart,
    rangeEnd: activityQuery.rangeEnd
  });
  const csv = [
    ["Date", "Time", "User", "User Name", "Type", "Outcome", "Edited", "Conversation ID", "Conversation Subject"],
    ...rows.map((row) => [
      formatCsvDate(row.created_at),
      formatCsvTime(row.created_at),
      row.actor_email,
      dashboardAiAssistActorLabel(row.actor_email),
      csvTypeLabel(row.feature),
      csvOutcomeLabel(row.action),
      csvEditedValue(row.metadata_json),
      row.conversation_id,
      normalizeDashboardAiAssistConversationSubject(row.conversation_preview)
    ])
  ]
    .map((line) => line.map(toCsvValue).join(","))
    .join("\n");

  return new Response(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="${exportFileName({
        start: activityQuery.rangeStart,
        end: activityQuery.rangeEnd
      })}"`,
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}

export const GET = withRouteErrorAlerting(handleGET, "app/dashboard/analytics/activity-export/route.ts:GET");
