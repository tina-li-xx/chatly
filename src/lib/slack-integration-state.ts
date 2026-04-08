import type {
  SlackChannelId,
  SlackIntegrationState
} from "@/lib/dashboard-integrations";
import {
  DEFAULT_INTEGRATIONS_STATE,
  SLACK_CHANNEL_OPTIONS
} from "@/lib/dashboard-integrations";
import {
  readIntegrationSettings,
  serializeIntegrationSettings
} from "@/lib/integration-settings";
import {
  hasStoredEncryptedIntegrationCredentials,
  readStoredIntegrationCredentials,
  serializeStoredIntegrationCredentials
} from "@/lib/integration-state-credentials";
import type { WorkspaceIntegrationRow } from "@/lib/repositories/integrations-repository";

type StoredSlackSettings = {
  channelId?: SlackChannelId;
  channelName?: string;
  channelSlackId?: string;
  notifications?: Partial<SlackIntegrationState["notifications"]>;
  replyFromSlack?: boolean;
};

type StoredSlackCredentials = {
  accessToken?: string | null;
  tokenType?: string | null;
  scopes?: string[];
  appId?: string | null;
  botUserId?: string | null;
  teamId?: string | null;
  teamName?: string | null;
  refreshToken?: string | null;
  expiresIn?: number | null;
  authedUserId?: string | null;
};

const SLACK_CHANNEL_IDS = new Set(
  SLACK_CHANNEL_OPTIONS.map((option) => option.value)
);

export function readSlackStoredSettings(
  row: WorkspaceIntegrationRow | null
) {
  return readIntegrationSettings<StoredSlackSettings>(row) ?? {};
}

function resolveSlackChannelName(channelId: SlackChannelId, fallback?: string) {
  return (
    SLACK_CHANNEL_OPTIONS.find((option) => option.value === channelId)?.label ||
    fallback ||
    DEFAULT_INTEGRATIONS_STATE.slack.channelName
  );
}

export function buildSlackIntegrationState(
  row: WorkspaceIntegrationRow | null
): SlackIntegrationState {
  if (!row) {
    return DEFAULT_INTEGRATIONS_STATE.slack;
  }

  const settings = readSlackStoredSettings(row);
  const channelId = SLACK_CHANNEL_IDS.has(settings.channelId as SlackChannelId)
    ? (settings.channelId as SlackChannelId)
    : DEFAULT_INTEGRATIONS_STATE.slack.channelId;

  return {
    ...DEFAULT_INTEGRATIONS_STATE.slack,
    status: row.status,
    workspaceName:
      row.account_label || DEFAULT_INTEGRATIONS_STATE.slack.workspaceName,
    channelId,
    channelName: resolveSlackChannelName(channelId, settings.channelName),
    errorMessage: row.error_message ?? null,
    lastValidatedAt: row.last_validated_at,
    notifications: {
      ...DEFAULT_INTEGRATIONS_STATE.slack.notifications,
      ...settings.notifications
    },
    replyFromSlack:
      typeof settings.replyFromSlack === "boolean"
        ? settings.replyFromSlack
        : DEFAULT_INTEGRATIONS_STATE.slack.replyFromSlack
  };
}

export function serializeSlackIntegrationSettings(state: SlackIntegrationState) {
  return serializeIntegrationSettings({
    channelId: state.channelId,
    channelName: resolveSlackChannelName(state.channelId, state.channelName),
    notifications: state.notifications,
    replyFromSlack: state.replyFromSlack
  } satisfies StoredSlackSettings);
}

export function resolveSlackPostChannel(
  row: WorkspaceIntegrationRow | null,
  state: SlackIntegrationState
) {
  const settings = readSlackStoredSettings(row);
  return settings.channelSlackId || settings.channelName || state.channelName;
}

export function updateSlackStoredChannelId(
  row: WorkspaceIntegrationRow | null,
  channelSlackId: string
) {
  return serializeIntegrationSettings({
    ...readSlackStoredSettings(row),
    channelSlackId
  } satisfies StoredSlackSettings);
}

export function serializeSlackIntegrationCredentials(
  value: StoredSlackCredentials
) {
  return serializeStoredIntegrationCredentials(value);
}

export function readSlackCredentials(row: WorkspaceIntegrationRow | null) {
  return readStoredIntegrationCredentials<StoredSlackCredentials>(row);
}

export function hasEncryptedSlackCredentials(row: WorkspaceIntegrationRow | null) {
  return hasStoredEncryptedIntegrationCredentials(row);
}

export function readSlackAccessToken(row: WorkspaceIntegrationRow | null) {
  return readSlackCredentials(row)?.accessToken ?? null;
}
