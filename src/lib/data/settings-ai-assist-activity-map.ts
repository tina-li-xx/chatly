import type { WorkspaceAiAssistActivityRow } from "@/lib/repositories/ai-assist-activity-shared";
import type { DashboardAiAssistUsageActivity } from "@/lib/data/settings-ai-assist-usage";
import { displayNameFromEmail } from "@/lib/user-display";

export function dashboardAiAssistActorLabel(email: string | null) {
  return email ? displayNameFromEmail(email) : "Unknown teammate";
}

export function mapWorkspaceAiAssistActivityRow(
  row: WorkspaceAiAssistActivityRow
): DashboardAiAssistUsageActivity {
  const editLevel =
    row.metadata_json?.editLevel === "light" || row.metadata_json?.editLevel === "heavy"
      ? row.metadata_json.editLevel
      : null;

  return {
    id: row.id,
    actorEmail: row.actor_email,
    actorLabel: dashboardAiAssistActorLabel(row.actor_email),
    actorUserId: row.actor_user_id,
    feature: row.feature,
    action: row.action,
    conversationId: row.conversation_id,
    conversationPreview: row.conversation_preview,
    createdAt: row.created_at,
    tone:
      typeof row.metadata_json?.tone === "string"
        ? row.metadata_json.tone
        : null,
    tag:
      typeof row.metadata_json?.tag === "string"
        ? row.metadata_json.tag
        : null,
    edited: editLevel != null || row.metadata_json?.edited === true,
    editLevel
  };
}
