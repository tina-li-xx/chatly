import type { SlackIntegrationState } from "@/lib/dashboard-integrations";
import { SLACK_CHANNEL_OPTIONS } from "@/lib/dashboard-integrations";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import {
  deleteWorkspaceIntegrationRow,
  findWorkspaceIntegrationRow,
  upsertWorkspaceIntegrationRow
} from "@/lib/services/integrations";
import {
  buildSlackIntegrationState,
  hasEncryptedSlackCredentials,
  readSlackAccessToken,
  readSlackCredentials,
  serializeSlackIntegrationCredentials,
  serializeSlackIntegrationSettings
} from "@/lib/slack-integration-state";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

const SLACK_CHANNEL_IDS = new Set(
  SLACK_CHANNEL_OPTIONS.map((option) => option.value)
);

function parseSlackSettingsPayload(
  payload: unknown,
  current: SlackIntegrationState
): SlackIntegrationState | null {
  if (typeof payload !== "object" || !payload) {
    return null;
  }

  const value = payload as Partial<SlackIntegrationState>;
  if (!value.channelId || !SLACK_CHANNEL_IDS.has(value.channelId)) {
    return null;
  }

  const notifications = value.notifications;
  if (
    !notifications ||
    typeof notifications.newConversation !== "boolean" ||
    typeof notifications.assignedToMe !== "boolean" ||
    typeof notifications.resolved !== "boolean" ||
    typeof notifications.allMessages !== "boolean" ||
    typeof value.replyFromSlack !== "boolean"
  ) {
    return null;
  }

  return {
    ...current,
    status: "connected",
    channelId: value.channelId,
    channelName:
      SLACK_CHANNEL_OPTIONS.find((option) => option.value === value.channelId)
        ?.label ?? current.channelName,
    notifications,
    replyFromSlack: value.replyFromSlack,
    errorMessage: null
  };
}

async function requireSlackManager() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth;
  }
  if (auth.user.workspaceRole === "member") {
    return { response: jsonError("forbidden", 403) };
  }
  return auth;
}

async function handleGET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const row = await findWorkspaceIntegrationRow(auth.user.workspaceOwnerId, "slack");
  if (!row || hasEncryptedSlackCredentials(row)) {
    return jsonOk({ slack: buildSlackIntegrationState(row) });
  }

  const credentials = readSlackCredentials(row);
  if (!credentials) {
    return jsonOk({ slack: buildSlackIntegrationState(row) });
  }

  const upgraded = await upsertWorkspaceIntegrationRow({
    ownerUserId: auth.user.workspaceOwnerId,
    provider: "slack",
    status: row.status,
    accountLabel: row.account_label,
    externalAccountId: row.external_account_id,
    settingsJson: row.settings_json,
    credentialsJson: serializeSlackIntegrationCredentials(credentials),
    errorMessage: row.error_message,
    connectedAt: row.connected_at,
    lastValidatedAt: row.last_validated_at
  });

  return jsonOk({ slack: buildSlackIntegrationState(upgraded) });
}

async function handlePOST(request: Request) {
  const auth = await requireSlackManager();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const currentRow = await findWorkspaceIntegrationRow(auth.user.workspaceOwnerId, "slack");
    if (!readSlackAccessToken(currentRow)) {
      return jsonError("slack-not-connected", 409);
    }

    const nextState = parseSlackSettingsPayload(
      await request.json(),
      buildSlackIntegrationState(currentRow)
    );
    if (!nextState || !currentRow) {
      return jsonError("invalid-slack-settings", 400);
    }

    const timestamp = new Date().toISOString();
    const credentials = readSlackCredentials(currentRow);
    const updated = await upsertWorkspaceIntegrationRow({
      ownerUserId: auth.user.workspaceOwnerId,
      provider: "slack",
      status: "connected",
      accountLabel: currentRow.account_label ?? nextState.workspaceName,
      externalAccountId: currentRow.external_account_id,
      settingsJson: serializeSlackIntegrationSettings({
        ...nextState,
        lastValidatedAt: timestamp
      }),
      credentialsJson: serializeSlackIntegrationCredentials(credentials ?? {}),
      errorMessage: null,
      connectedAt: currentRow.connected_at ?? timestamp,
      lastValidatedAt: timestamp
    });

    return jsonOk({ slack: buildSlackIntegrationState(updated) });
  } catch {
    return jsonError("slack-settings-save-failed", 500);
  }
}

async function handleDELETE() {
  const auth = await requireSlackManager();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    await deleteWorkspaceIntegrationRow(auth.user.workspaceOwnerId, "slack");
    return jsonOk({ slack: buildSlackIntegrationState(null) });
  } catch {
    return jsonError("slack-disconnect-failed", 500);
  }
}

export const GET = withRouteErrorAlerting(handleGET, "app/dashboard/settings/integrations/slack/route.ts:GET");
export const POST = withRouteErrorAlerting(handlePOST, "app/dashboard/settings/integrations/slack/route.ts:POST");
export const DELETE = withRouteErrorAlerting(handleDELETE, "app/dashboard/settings/integrations/slack/route.ts:DELETE");
