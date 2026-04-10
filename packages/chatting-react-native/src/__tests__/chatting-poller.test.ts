import { startConversationPolling } from "../chatting-poller";

describe("startConversationPolling", () => {
  it("emits the first conversation and skips unchanged snapshots", async () => {
    vi.useFakeTimers();
    const onConversation = vi.fn();
    const client = {
      fetchConversation: vi
        .fn()
        .mockResolvedValueOnce({ conversationId: "conv_1", messages: [], faqSuggestions: null })
        .mockResolvedValueOnce({ conversationId: "conv_1", messages: [], faqSuggestions: null })
        .mockResolvedValueOnce({
          conversationId: "conv_1",
          messages: [{ id: "msg_1", content: "Hi", createdAt: "2026-04-09T18:00:00.000Z", sender: "team", attachments: [] }],
          faqSuggestions: null
        })
    };

    const stop = startConversationPolling({ client, intervalMs: 10, onConversation });

    await vi.runOnlyPendingTimersAsync();
    await vi.runOnlyPendingTimersAsync();
    await vi.runOnlyPendingTimersAsync();
    stop();

    expect(onConversation).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
