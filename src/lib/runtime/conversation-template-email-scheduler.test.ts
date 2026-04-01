import {
  createCompletedWindowRunner,
  flushSchedulerAsyncWork,
  resetGlobalScheduler
} from "@/lib/runtime/scheduler-test-helpers";

describe("conversation template email scheduler", () => {
  it("starts once and runs retries on an interval", async () => {
    vi.useFakeTimers();
    resetGlobalScheduler("__chatlyConversationTemplateEmailScheduler__");

    const runScheduledConversationTemplateEmailRetries = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@/lib/conversation-template-email-runner", () => ({
      runScheduledConversationTemplateEmailRetries
    }));
    vi.doMock("@/lib/runtime/scheduler-window-runner", () => ({
      runWindowedSchedulerTask: createCompletedWindowRunner()
    }));
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

    const { conversationTemplateEmailScheduler } = await import(
      "@/lib/runtime/conversation-template-email-scheduler"
    );

    conversationTemplateEmailScheduler.start();
    await flushSchedulerAsyncWork();
    const afterStart = runScheduledConversationTemplateEmailRetries.mock.calls.length;

    conversationTemplateEmailScheduler.start();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60 * 1000);
    await flushSchedulerAsyncWork();

    expect(runScheduledConversationTemplateEmailRetries.mock.calls.length).toBeGreaterThan(afterStart);

    conversationTemplateEmailScheduler.stop();
    setIntervalSpy.mockRestore();
    vi.useRealTimers();
  });
});
