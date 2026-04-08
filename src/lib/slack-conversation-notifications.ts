import "server-only";

import { getPublicAppUrl } from "@/lib/env";
import { findWorkspaceIntegrationRow, upsertWorkspaceIntegrationRow } from "@/lib/repositories/integrations-repository";
import { upsertSlackThreadRow } from "@/lib/repositories/slack-thread-repository";
import { postSlackMessage, SlackApiError } from "@/lib/slack-api";
import {
  buildSlackIntegrationState,
  readSlackAccessToken,
  resolveSlackPostChannel,
  updateSlackStoredChannelId
} from "@/lib/slack-integration-state";

type SlackConversationNotificationInput = {
  ownerUserId?: string;
  userId: string;
  conversationId: string;
  preview: string;
  siteName: string;
  visitorLabel: string | null;
  pageUrl: string | null;
  location: string | null;
  attachmentsCount: number;
  isNewConversation: boolean;
  isNewVisitor: boolean;
  highIntent: boolean;
};

function summarizePage(pageUrl: string | null) {
  if (!pageUrl) {
    return "Unknown";
  }

  try {
    const url = new URL(pageUrl);
    return `${url.pathname || "/"}${url.search}`;
  } catch {
    return pageUrl;
  }
}

function buildNotificationBlocks(input: SlackConversationNotificationInput) {
  const visitor = input.visitorLabel || "Visitor";
  const location = input.location ? `\n*Location:*\n${input.location}` : "";
  const attachments = input.attachmentsCount ? `\n*Files:*\n${input.attachmentsCount}` : "";
  const badge = input.highIntent ? "High-intent" : input.isNewVisitor ? "New visitor" : "New conversation";
  const inboxUrl = `${getPublicAppUrl()}/dashboard/inbox?id=${encodeURIComponent(input.conversationId)}`;

  return [
    { type: "header", text: { type: "plain_text", text: "New conversation", emoji: true } },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*From:*\n${visitor}` },
        { type: "mrkdwn", text: `*Page:*\n${summarizePage(input.pageUrl)}` },
        { type: "mrkdwn", text: `*Site:*\n${input.siteName}` },
        { type: "mrkdwn", text: `*Context:*\n${badge}${location}${attachments}` }
      ]
    },
    { type: "section", text: { type: "mrkdwn", text: `>${input.preview}` } },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View in Chatting", emoji: true },
          url: inboxUrl
        }
      ]
    },
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: "Reply in this thread to send a message back to the visitor." }]
    }
  ];
}

function resolveSlackDeliveryState(error: unknown) {
  const code = error instanceof SlackApiError ? error.code : "SLACK_API_REQUEST_FAILED";
  const reconnectCodes = new Set(["account_inactive", "invalid_auth", "not_authed", "token_revoked"]);

  return {
    status: reconnectCodes.has(code) ? "reconnect" : "error",
    errorMessage: code.replaceAll("_", " ")
  } as const;
}

async function saveSlackStatus(input: {
  ownerUserId: string;
  row: NonNullable<Awaited<ReturnType<typeof findWorkspaceIntegrationRow>>>;
  status: "connected" | "reconnect" | "error";
  errorMessage: string | null;
  settingsJson?: string;
}) {
  await upsertWorkspaceIntegrationRow({
    ownerUserId: input.ownerUserId,
    provider: "slack",
    status: input.status,
    accountLabel: input.row.account_label,
    externalAccountId: input.row.external_account_id,
    settingsJson: input.settingsJson ?? input.row.settings_json,
    credentialsJson: input.row.credentials_json,
    errorMessage: input.errorMessage,
    connectedAt: input.row.connected_at,
    lastValidatedAt: input.status === "connected" ? new Date().toISOString() : input.row.last_validated_at
  });
}

export async function maybeSendSlackConversationNotification(
  input: SlackConversationNotificationInput
) {
  if (!input.isNewConversation) {
    return;
  }

  const ownerUserId = input.ownerUserId ?? input.userId;
  const row = await findWorkspaceIntegrationRow(ownerUserId, "slack");
  if (!row) {
    return;
  }

  const state = buildSlackIntegrationState(row);
  if (state.status !== "connected" || !state.notifications.newConversation) {
    return;
  }

  const accessToken = readSlackAccessToken(row);
  const channel = resolveSlackPostChannel(row, state);
  if (!accessToken || !channel) {
    return;
  }

  try {
    const posted = await postSlackMessage({
      accessToken,
      channel,
      text: `New conversation from ${input.visitorLabel || "Visitor"}: ${input.preview}`,
      blocks: buildNotificationBlocks(input)
    });

    if (row.external_account_id) {
      await upsertSlackThreadRow({
        conversationId: input.conversationId,
        ownerUserId,
        slackTeamId: row.external_account_id,
        slackChannelId: posted.channelId,
        slackChannelName: state.channelName,
        slackMessageTs: posted.ts,
        slackThreadTs: posted.threadTs
      });
    }

    await saveSlackStatus({
      ownerUserId,
      row,
      status: "connected",
      errorMessage: null,
      settingsJson: updateSlackStoredChannelId(row, posted.channelId)
    });
  } catch (error) {
    console.error("slack conversation notification failed", error);
    const failure = resolveSlackDeliveryState(error);
    await saveSlackStatus({
      ownerUserId,
      row,
      status: failure.status,
      errorMessage: failure.errorMessage
    });
  }
}
