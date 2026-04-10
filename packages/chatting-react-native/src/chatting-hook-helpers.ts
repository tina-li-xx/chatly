import type { MutableRefObject } from "react";
import { ChattingClient } from "./chatting-client";
import { ChattingLiveStreamUnsupportedError } from "./chatting-live-stream";
import { startConversationPolling } from "./chatting-poller";
import type {
  ChattingConversationState,
  ChattingFAQSuggestions,
  ChattingLiveEvent,
  ChattingMessage
} from "./chatting-types";
import { normalizeText, toErrorMessage } from "./chatting-utils";

export function applyConversation(
  conversation: ChattingConversationState,
  setMessages: (messages: ChattingMessage[]) => void,
  setFaqSuggestions: (suggestions: ChattingFAQSuggestions | null) => void
) {
  setMessages(conversation.messages);
  setFaqSuggestions(conversation.faqSuggestions ?? null);
}

export async function startConversationSync(input: {
  client: ChattingClient;
  pollIntervalMs?: number;
  stopSyncRef: MutableRefObject<null | (() => void)>;
  activeConversationIdRef: MutableRefObject<string | null>;
  setMessages(messages: ChattingMessage[]): void;
  setFaqSuggestions(suggestions: ChattingFAQSuggestions | null): void;
  setTeamTyping(value: boolean): void;
  setErrorMessage(message: string | null): void;
  refreshConversation(): Promise<ChattingConversationState>;
}) {
  const session = await input.client.currentSessionState();
  if (!session.conversationId) {
    return;
  }
  if (input.activeConversationIdRef.current === session.conversationId && input.stopSyncRef.current) {
    return;
  }

  input.stopSyncRef.current?.();
  input.activeConversationIdRef.current = session.conversationId;
  input.setTeamTyping(false);
  const fallbackToPolling = () => {
    input.stopSyncRef.current?.();
    input.stopSyncRef.current = startConversationPolling({
      client: input.client,
      intervalMs: input.pollIntervalMs,
      onConversation(conversation) {
        applyConversation(conversation, input.setMessages, input.setFaqSuggestions);
        input.setErrorMessage(null);
      },
      onError(error) {
        input.setErrorMessage(toErrorMessage(error));
      }
    });
  };

  try {
    input.stopSyncRef.current = await input.client.subscribeLiveEvents({
      onEvent(event) {
        void handleLiveEvent(event, input).catch((error) => {
          input.setErrorMessage(toErrorMessage(error));
        });
      },
      onDisconnect() {
        fallbackToPolling();
      }
    });
  } catch (error) {
    if (!(error instanceof ChattingLiveStreamUnsupportedError)) {
      input.setErrorMessage(toErrorMessage(error));
    }
    fallbackToPolling();
  }
}

async function handleLiveEvent(
  event: ChattingLiveEvent,
  input: {
    setMessages(messages: ChattingMessage[]): void;
    setFaqSuggestions(suggestions: ChattingFAQSuggestions | null): void;
    setTeamTyping(value: boolean): void;
    setErrorMessage(message: string | null): void;
    refreshConversation(): Promise<ChattingConversationState>;
  }
) {
  if (event.type === "typing.updated" && event.actor === "team") {
    input.setTeamTyping(Boolean(event.typing));
    input.setErrorMessage(null);
    return;
  }
  if (event.type !== "message.created" && event.type !== "conversation.updated") {
    return;
  }

  input.setTeamTyping(false);
  const conversation = await input.refreshConversation();
  applyConversation(conversation, input.setMessages, input.setFaqSuggestions);
  input.setErrorMessage(null);
}

export async function syncTyping(input: {
  client: ChattingClient;
  value: string;
  typingTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
}) {
  if (input.typingTimeoutRef.current) {
    clearTimeout(input.typingTimeoutRef.current);
  }

  const isTyping = Boolean(normalizeText(input.value));
  try {
    await input.client.updateTyping(isTyping);
  } catch {
    return;
  }
  if (!isTyping) {
    return;
  }

  input.typingTimeoutRef.current = setTimeout(() => {
    void input.client.updateTyping(false).catch(() => undefined);
  }, 1500);
}
