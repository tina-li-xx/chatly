describe("live events redis bridge", () => {
  beforeEach(() => {
    delete global.__chattingLiveListeners;
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("publishes locally, relays through redis, and ignores same-instance echoes", async () => {
    const publishMock = vi.fn().mockResolvedValue(1);
    const psubscribeMock = vi.fn().mockResolvedValue(undefined);
    const redisInstances: Array<{
      handlers: Map<string, Array<(...args: string[]) => void>>;
    }> = [];

    class MockRedis {
      handlers = new Map<string, Array<(...args: string[]) => void>>();
      publish = publishMock;
      psubscribe = psubscribeMock;

      constructor() {
        redisInstances.push(this);
      }

      on(event: string, handler: (...args: string[]) => void) {
        const current = this.handlers.get(event) ?? [];
        current.push(handler);
        this.handlers.set(event, current);
        return this;
      }
    }

    vi.doMock("ioredis", () => ({ default: MockRedis }));
    vi.doMock("@/lib/env.server", () => ({ getRedisUrl: () => "redis://chatting.test:6379" }));

    const module = await import("@/lib/live-events");
    const listener = vi.fn();
    module.subscribeConversationLive("conv_1", listener);
    await Promise.resolve();
    await Promise.resolve();

    module.publishConversationLive("conv_1", {
      type: "message.created",
      conversationId: "conv_1",
      sender: "user",
      createdAt: "2026-04-09T10:00:00.000Z"
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(psubscribeMock).toHaveBeenCalledTimes(1);
    expect(publishMock).toHaveBeenCalledWith(
      "chatting:live:conversation:conv_1",
      expect.stringContaining('"conversationId":"conv_1"')
    );

    const subscriber = redisInstances.find((instance) => instance.handlers.has("pmessage"));
    const messageHandler = subscriber?.handlers.get("pmessage")?.[0];
    const selfEnvelope = JSON.parse(String(publishMock.mock.calls[0]?.[1])) as { originId: string };

    messageHandler?.(
      "chatting:live:conversation:*",
      "chatting:live:conversation:conv_1",
      JSON.stringify({
        originId: selfEnvelope.originId,
        event: {
          type: "conversation.updated",
          conversationId: "conv_1",
          status: "open",
          updatedAt: "2026-04-09T10:00:01.000Z"
        }
      })
    );
    messageHandler?.(
      "chatting:live:conversation:*",
      "chatting:live:conversation:conv_1",
      JSON.stringify({
        originId: "remote-instance",
        event: {
          type: "conversation.updated",
          conversationId: "conv_1",
          status: "open",
          updatedAt: "2026-04-09T10:00:02.000Z"
        }
      })
    );

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: "conversation.updated",
        conversationId: "conv_1"
      })
    );
  });

  it("deduplicates transient subscriber reset logs until redis is ready again", async () => {
    const psubscribeMock = vi.fn().mockResolvedValue(undefined);
    const redisInstances: Array<{
      handlers: Map<string, Array<(...args: unknown[]) => void>>;
    }> = [];
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    class MockRedis {
      handlers = new Map<string, Array<(...args: unknown[]) => void>>();
      psubscribe = psubscribeMock;

      constructor() {
        redisInstances.push(this);
      }

      on(event: string, handler: (...args: unknown[]) => void) {
        const current = this.handlers.get(event) ?? [];
        current.push(handler);
        this.handlers.set(event, current);
        return this;
      }
    }

    vi.doMock("ioredis", () => ({ default: MockRedis }));
    vi.doMock("@/lib/env.server", () => ({ getRedisUrl: () => "redis://chatting.test:6379" }));

    const module = await import("@/lib/live-events");
    module.subscribeConversationLive("conv_1", vi.fn());
    await Promise.resolve();
    await Promise.resolve();

    const subscriber = redisInstances[0];
    const errorHandler = subscriber?.handlers.get("error")?.[0];
    const readyHandler = subscriber?.handlers.get("ready")?.[0];
    const resetError = Object.assign(new Error("read ECONNRESET"), {
      code: "ECONNRESET"
    });

    errorHandler?.(resetError);
    errorHandler?.(resetError);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();

    readyHandler?.();
    errorHandler?.(resetError);
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});
