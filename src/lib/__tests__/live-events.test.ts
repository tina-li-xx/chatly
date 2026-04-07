import {
  publishConversationLive,
  publishDashboardLive,
  subscribeConversationLive,
  subscribeDashboardLive
} from "@/lib/live-events";

describe("live events", () => {
  beforeEach(() => {
    delete global.__chattingLiveListeners;
    vi.restoreAllMocks();
  });

  it("publishes dashboard events to subscribers and unsubscribes cleanly", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeDashboardLive("user_1", listener);

    publishDashboardLive("user_1", {
      type: "conversation.read",
      conversationId: "conv_1",
      updatedAt: "2026-03-29T10:00:00.000Z"
    });
    unsubscribe();
    publishDashboardLive("user_1", {
      type: "conversation.read",
      conversationId: "conv_1",
      updatedAt: "2026-03-29T10:05:00.000Z"
    });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("keeps publishing when one listener throws", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const badListener = vi.fn(() => {
      throw new Error("boom");
    });
    const goodListener = vi.fn();
    subscribeConversationLive("conv_1", badListener);
    subscribeConversationLive("conv_1", goodListener);

    publishConversationLive("conv_1", {
      type: "typing.updated",
      conversationId: "conv_1",
      actor: "team",
      typing: true
    });

    expect(goodListener).toHaveBeenCalledWith(
      expect.objectContaining({ type: "typing.updated", typing: true })
    );
    expect(errorSpy).toHaveBeenCalledWith("live event listener failed", expect.any(Error));
  });
});
