import type { ChattingLiveEvent } from "./chatting-types";

export class ChattingLiveStreamUnsupportedError extends Error {
  constructor() {
    super("This environment cannot open Chatting live events.");
    this.name = "ChattingLiveStreamUnsupportedError";
  }
}

export function connectChattingLiveStream(input: {
  url: string;
  fetchImpl?: typeof fetch;
  onEvent(event: ChattingLiveEvent): void;
  onDisconnect?(error?: unknown): void;
}) {
  if (typeof globalThis.XMLHttpRequest === "function") {
    return connectViaXHR(input);
  }

  const fetchImpl = input.fetchImpl ?? globalThis.fetch;
  if (!fetchImpl) {
    throw new ChattingLiveStreamUnsupportedError();
  }
  return connectViaFetch({ ...input, fetchImpl });
}

function connectViaXHR(input: {
  url: string;
  onEvent(event: ChattingLiveEvent): void;
  onDisconnect?(error?: unknown): void;
}) {
  return new Promise<() => void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let settled = false;
    let stopped = false;
    let index = 0;
    let buffer = "";

    const stop = () => {
      stopped = true;
      xhr.abort();
    };
    const settle = (handler: typeof resolve | typeof reject, value: (() => void) | Error) => {
      if (!settled) {
        settled = true;
        handler(value as never);
      }
    };
    const consume = () => {
      buffer = emitFrames(xhr.responseText.slice(index), buffer, input.onEvent);
      index = xhr.responseText.length;
    };

    xhr.open("GET", input.url, true);
    xhr.setRequestHeader("Accept", "text/event-stream");
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== xhr.HEADERS_RECEIVED) {
        return;
      }
      if (xhr.status >= 400) {
        settle(reject, new Error(xhr.responseText || `Chatting live stream failed with ${xhr.status}.`));
        stop();
        return;
      }
      settle(resolve, stop);
    };
    xhr.onprogress = consume;
    xhr.onerror = () => {
      settle(reject, new Error("Chatting live stream failed."));
      if (!stopped) {
        input.onDisconnect?.(new Error("Chatting live stream failed."));
      }
    };
    xhr.onload = () => {
      consume();
      if (!stopped) {
        input.onDisconnect?.();
      }
    };
    xhr.send();
  });
}

async function connectViaFetch(input: {
  url: string;
  fetchImpl: typeof fetch;
  onEvent(event: ChattingLiveEvent): void;
  onDisconnect?(error?: unknown): void;
}) {
  const controller = new AbortController();
  const response = await input.fetchImpl(input.url, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "text/event-stream" },
    signal: controller.signal
  });
  if (!response.ok) {
    controller.abort();
    throw new Error(await response.text() || `Chatting live stream failed with ${response.status}.`);
  }

  const reader = response.body?.getReader?.();
  if (!reader) {
    controller.abort();
    throw new ChattingLiveStreamUnsupportedError();
  }

  let stopped = false;
  let buffer = "";
  void (async () => {
    const decoder = new TextDecoder();
    let disconnectError: unknown;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer = emitFrames(decoder.decode(value, { stream: true }), buffer, input.onEvent);
      }
    } catch (error) {
      disconnectError = error;
    } finally {
      if (!stopped && !controller.signal.aborted) {
        input.onDisconnect?.(disconnectError);
      }
    }
  })();

  return () => {
    stopped = true;
    controller.abort();
    void reader.cancel().catch(() => undefined);
  };
}

function emitFrames(chunk: string, existing: string, onEvent: (event: ChattingLiveEvent) => void) {
  const frames = `${existing}${chunk}`.split(/\r?\n\r?\n/);
  const remainder = frames.pop() ?? "";

  for (const frame of frames) {
    const data = frame
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (!data) {
      continue;
    }

    try {
      const payload = JSON.parse(data) as ChattingLiveEvent;
      if (typeof payload.type === "string") {
        onEvent(payload);
      }
    } catch {
      continue;
    }
  }

  return remainder;
}
