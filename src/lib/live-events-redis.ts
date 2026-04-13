import "server-only";

import Redis from "ioredis";
import { getRedisUrl } from "@/lib/env.server";
import type {
  DashboardLiveEvent,
  PublicConversationLiveEvent
} from "@/lib/live-events.types";

type RedisLiveDispatchers = {
  dashboard: (userId: string, event: DashboardLiveEvent) => void;
  conversation: (conversationId: string, event: PublicConversationLiveEvent) => void;
};

type RedisLiveEnvelope<T> = {
  originId: string;
  event: T;
};

const DASHBOARD_CHANNEL_PREFIX = "chatting:live:dashboard:";
const CONVERSATION_CHANNEL_PREFIX = "chatting:live:conversation:";
const CHANNEL_PATTERNS = [`${DASHBOARD_CHANNEL_PREFIX}*`, `${CONVERSATION_CHANNEL_PREFIX}*`] as const;
const RETRYABLE_REDIS_CONNECTION_CODES = ["ECONNRESET", "EPIPE", "ETIMEDOUT"] as const;
const instanceId = crypto.randomUUID();
const NOOP_DISPATCHERS: RedisLiveDispatchers = {
  dashboard: () => undefined,
  conversation: () => undefined
};

let publisher: Redis | null = null;
let subscriber: Redis | null = null;
let bridgeReadyPromise: Promise<boolean> | null = null;
let redisDispatchers = NOOP_DISPATCHERS;
let subscriberHandlerAttached = false;

function readRedisUrl() {
  return getRedisUrl().trim();
}

function isRetryableRedisConnectionError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const { code } = error as { code?: unknown };
  if (
    typeof code === "string" &&
    RETRYABLE_REDIS_CONNECTION_CODES.includes(
      code as (typeof RETRYABLE_REDIS_CONNECTION_CODES)[number]
    )
  ) {
    return true;
  }

  return error.message.includes("ECONNRESET");
}

function createRedisClient(redisUrl: string, label: "publisher" | "subscriber") {
  const client = new Redis(redisUrl);
  let reportedTransientDisconnect = false;

  client.on("ready", () => {
    reportedTransientDisconnect = false;
  });
  client.on("error", (error) => {
    if (isRetryableRedisConnectionError(error)) {
      if (reportedTransientDisconnect) {
        return;
      }

      reportedTransientDisconnect = true;
      console.warn(`redis live ${label} reconnecting after transient connection reset`, error);
      return;
    }

    console.error(`redis live ${label} failed`, error);
  });
  return client;
}

function ensurePublisher(redisUrl: string) {
  publisher ??= createRedisClient(redisUrl, "publisher");
  return publisher;
}

function ensureSubscriber(redisUrl: string) {
  subscriber ??= createRedisClient(redisUrl, "subscriber");
  return subscriber;
}

function handleRedisMessage(channel: string, rawMessage: string) {
  const envelope = JSON.parse(rawMessage) as RedisLiveEnvelope<
    DashboardLiveEvent | PublicConversationLiveEvent
  >;
  if (envelope.originId === instanceId) {
    return;
  }

  if (channel.startsWith(DASHBOARD_CHANNEL_PREFIX)) {
    redisDispatchers.dashboard(
      channel.slice(DASHBOARD_CHANNEL_PREFIX.length),
      envelope.event as DashboardLiveEvent
    );
    return;
  }

  if (channel.startsWith(CONVERSATION_CHANNEL_PREFIX)) {
    redisDispatchers.conversation(
      channel.slice(CONVERSATION_CHANNEL_PREFIX.length),
      envelope.event as PublicConversationLiveEvent
    );
  }
}

function attachSubscriberHandler(redisUrl: string) {
  const liveSubscriber = ensureSubscriber(redisUrl);
  if (subscriberHandlerAttached) {
    return liveSubscriber;
  }

  liveSubscriber.on("pmessage", (_pattern, channel, rawMessage) => {
    try {
      handleRedisMessage(channel, rawMessage);
    } catch (error) {
      console.error("redis live message failed", error);
    }
  });
  subscriberHandlerAttached = true;
  return liveSubscriber;
}

async function publishRedisEvent<T>(channel: string, event: T) {
  const redisUrl = readRedisUrl();
  await ensurePublisher(redisUrl).publish(
    channel,
    JSON.stringify({
      originId: instanceId,
      event
    } satisfies RedisLiveEnvelope<T>)
  );
}

export function ensureRedisLiveBridge(nextDispatchers: RedisLiveDispatchers) {
  redisDispatchers = nextDispatchers;

  const redisUrl = readRedisUrl();
  if (bridgeReadyPromise) {
    return bridgeReadyPromise;
  }

  bridgeReadyPromise = attachSubscriberHandler(redisUrl)
    .psubscribe(...CHANNEL_PATTERNS)
    .then(() => true)
    .catch((error) => {
      bridgeReadyPromise = null;
      throw error;
    });

  return bridgeReadyPromise;
}

export function publishRedisDashboardLive(userId: string, event: DashboardLiveEvent) {
  return publishRedisEvent(`${DASHBOARD_CHANNEL_PREFIX}${userId}`, event);
}

export function publishRedisConversationLive(
  conversationId: string,
  event: PublicConversationLiveEvent
) {
  return publishRedisEvent(`${CONVERSATION_CHANNEL_PREFIX}${conversationId}`, event);
}
