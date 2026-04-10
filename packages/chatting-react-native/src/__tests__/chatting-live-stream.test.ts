import { ChattingLiveStreamUnsupportedError, connectChattingLiveStream } from "../chatting-live-stream";

describe("connectChattingLiveStream", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses XMLHttpRequest streaming in React Native style runtimes", async () => {
    const events: Array<{ type: string; actor?: string; typing?: boolean }> = [];
    vi.stubGlobal("XMLHttpRequest", createXHRMock());

    const stop = await connectChattingLiveStream({
      url: "https://usechatting.com/api/public/conversation-live?conversationId=conv_1",
      onEvent(event) {
        events.push(event);
      }
    });
    stop();

    expect(events).toEqual([
      { type: "connected", conversationId: "conv_1" },
      { type: "typing.updated", conversationId: "conv_1", actor: "team", typing: true }
    ]);
  });

  it("falls back to fetch streaming when XMLHttpRequest is unavailable", async () => {
    const events: Array<{ type: string }> = [];
    vi.stubGlobal("XMLHttpRequest", undefined);

    await connectChattingLiveStream({
      url: "https://usechatting.com/api/public/conversation-live?conversationId=conv_1",
      fetchImpl: vi.fn().mockResolvedValue(
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode('data: {"type":"connected","conversationId":"conv_1"}\n\n'));
              controller.close();
            }
          }),
          { status: 200 }
        )
      ) as typeof fetch,
      onEvent(event) {
        events.push(event);
      }
    });
    await Promise.resolve();

    expect(events).toEqual([{ type: "connected", conversationId: "conv_1" }]);
  });

  it("throws when neither XHR nor fetch streaming is available", async () => {
    vi.stubGlobal("XMLHttpRequest", undefined);
    vi.stubGlobal("fetch", undefined);

    expect(() => connectChattingLiveStream({ url: "https://usechatting.com/live", onEvent: vi.fn() })).toThrow(
      ChattingLiveStreamUnsupportedError
    );
  });
});

function createXHRMock() {
  return class MockXMLHttpRequest {
    readyState = 0;
    status = 200;
    responseText = "";
    HEADERS_RECEIVED = 2;
    onreadystatechange: null | (() => void) = null;
    onprogress: null | (() => void) = null;
    onerror: null | (() => void) = null;
    onload: null | (() => void) = null;

    open() {}
    setRequestHeader() {}
    abort() {}
    send() {
      this.readyState = this.HEADERS_RECEIVED;
      this.onreadystatechange?.();
      this.responseText =
        'data: {"type":"connected","conversationId":"conv_1"}\n\n' +
        'data: {"type":"typing.updated","conversationId":"conv_1","actor":"team","typing":true}\n\n';
      this.onprogress?.();
      this.onload?.();
    }
  };
}
