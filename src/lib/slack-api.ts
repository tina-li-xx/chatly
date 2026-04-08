import "server-only";

export class SlackApiError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "SlackApiError";
  }
}

type SlackChatPostMessageResponse = {
  ok?: boolean;
  error?: string;
  channel?: string;
  ts?: string;
  message?: {
    thread_ts?: string;
  };
};

export async function postSlackMessage(input: {
  accessToken: string;
  channel: string;
  text: string;
  blocks?: unknown[];
  threadTs?: string;
}) {
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      authorization: `Bearer ${input.accessToken}`,
      "content-type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      channel: input.channel,
      text: input.text,
      blocks: input.blocks,
      thread_ts: input.threadTs
    })
  });

  if (!response.ok) {
    throw new SlackApiError("SLACK_API_REQUEST_FAILED");
  }

  const payload = (await response.json()) as SlackChatPostMessageResponse;
  if (!payload.ok || !payload.channel || !payload.ts) {
    throw new SlackApiError(payload.error || "SLACK_API_REQUEST_FAILED");
  }

  return {
    channelId: payload.channel,
    ts: payload.ts,
    threadTs: payload.message?.thread_ts ?? payload.ts
  };
}
