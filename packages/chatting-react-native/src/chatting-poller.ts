import type { ChattingConversationState } from "./chatting-types";

type PollingClient = {
  fetchConversation(): Promise<ChattingConversationState>;
};

export function startConversationPolling(input: {
  client: PollingClient;
  intervalMs?: number;
  onConversation(conversation: ChattingConversationState): void;
  onError?(error: unknown): void;
}) {
  let lastKey = "";
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  const tick = async () => {
    try {
      const conversation = await input.client.fetchConversation();
      const nextKey = snapshotKey(conversation);
      if (nextKey !== lastKey) {
        lastKey = nextKey;
        input.onConversation(conversation);
      }
    } catch (error) {
      input.onError?.(error);
    } finally {
      if (!stopped) {
        timeout = setTimeout(() => void tick(), input.intervalMs ?? 3000);
      }
    }
  };

  void tick();

  return () => {
    stopped = true;
    if (timeout) {
      clearTimeout(timeout);
    }
  };
}

function snapshotKey(conversation: ChattingConversationState) {
  const lastMessage = conversation.messages.at(-1);
  return JSON.stringify({
    conversationId: conversation.conversationId,
    count: conversation.messages.length,
    lastMessageId: lastMessage?.id ?? null,
    lastMessageAt: lastMessage?.createdAt ?? null,
    faqCount: conversation.faqSuggestions?.items.length ?? 0,
    fallback: conversation.faqSuggestions?.fallbackMessage ?? null
  });
}
