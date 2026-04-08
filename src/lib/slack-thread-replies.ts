import "server-only";

import { deliverConversationTeamReply } from "@/lib/conversation-team-reply-delivery";
import { findWorkspaceIntegrationRowByExternalAccountId } from "@/lib/repositories/integrations-repository";
import { findSlackThreadByThreadKey } from "@/lib/repositories/slack-thread-repository";
import { buildSlackIntegrationState } from "@/lib/slack-integration-state";

type SlackMessageEvent = {
  type?: string;
  subtype?: string;
  hidden?: boolean;
  channel?: string;
  channel_type?: string;
  text?: string;
  ts?: string;
  thread_ts?: string;
  user?: string;
  bot_id?: string;
};

type SlackEventEnvelope = {
  type?: string;
  team_id?: string;
  event?: SlackMessageEvent;
};

function isThreadReplyEvent(event: SlackMessageEvent | undefined) {
  return Boolean(
    event &&
      event.type === "message" &&
      !event.subtype &&
      !event.hidden &&
      !event.bot_id &&
      typeof event.user === "string" &&
      typeof event.channel === "string" &&
      typeof event.text === "string" &&
      typeof event.ts === "string" &&
      typeof event.thread_ts === "string" &&
      event.thread_ts !== event.ts &&
      (event.channel_type === "channel" || event.channel_type === "group")
  );
}

export async function handleSlackThreadReplyEvent(payload: SlackEventEnvelope) {
  if (payload.type !== "event_callback" || !isThreadReplyEvent(payload.event)) {
    return { ok: true as const, ignored: true as const };
  }

  const event = payload.event as SlackMessageEvent & {
    channel: string;
    text: string;
    thread_ts: string;
  };
  const teamId = payload.team_id?.trim();
  const text = event.text.trim();
  if (!teamId || !text) {
    return { ok: true as const, ignored: true as const };
  }

  const integration = await findWorkspaceIntegrationRowByExternalAccountId("slack", teamId);
  if (!integration) {
    return { ok: true as const, ignored: true as const };
  }

  const state = buildSlackIntegrationState(integration);
  if (state.status !== "connected" || !state.replyFromSlack) {
    return { ok: true as const, ignored: true as const };
  }

  const thread = await findSlackThreadByThreadKey({
    slackTeamId: teamId,
    slackChannelId: event.channel,
    slackThreadTs: event.thread_ts
  });
  if (!thread) {
    return { ok: true as const, ignored: true as const };
  }

  const result = await deliverConversationTeamReply({
    conversationId: thread.conversation_id,
    actorUserId: integration.owner_user_id,
    workspaceOwnerId: integration.owner_user_id,
    content: text,
    attachments: [],
    authorUserId: null,
    markReadUserId: integration.owner_user_id
  });

  return result
    ? { ok: true as const, conversationId: result.conversationId, messageId: result.message.id }
    : { ok: true as const, ignored: true as const };
}
