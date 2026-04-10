import { connectChattingLiveStream } from "./chatting-live-stream";
import { normalizeBaseURL, toErrorMessage } from "./chatting-utils";

export class ChattingTransport {
  private readonly baseURL: string;
  private readonly fetchImpl: typeof fetch;

  constructor(baseURL: string, fetchImpl: typeof fetch) {
    this.baseURL = normalizeBaseURL(baseURL);
    this.fetchImpl = fetchImpl;
  }

  async get<Response>(path: string, query: Record<string, string | null | undefined>) {
    return this.request<Response>(path, { method: "GET", query });
  }

  async post<Response>(path: string, body: Record<string, unknown>) {
    return this.request<Response>(path, { method: "POST", body });
  }

  async delete<Response>(path: string, body: Record<string, unknown>) {
    return this.request<Response>(path, { method: "DELETE", body });
  }

  connectLive(
    path: string,
    query: Record<string, string | null | undefined>,
    input: { onEvent(event: unknown): void; onDisconnect?(error?: unknown): void }
  ) {
    return connectChattingLiveStream({
      url: buildURL(this.baseURL, path, query),
      fetchImpl: this.fetchImpl,
      onEvent: input.onEvent,
      onDisconnect: input.onDisconnect
    });
  }

  private async request<Response>(
    path: string,
    init: { method: "GET" | "POST" | "DELETE"; query?: Record<string, string | null | undefined>; body?: Record<string, unknown> }
  ) {
    const response = await this.fetchImpl(buildURL(this.baseURL, path, init.query), {
      method: init.method,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {})
      },
      body: init.body ? JSON.stringify(init.body) : undefined
    });

    const payload = await readPayload(response);
    if (!response.ok) {
      throw new Error(payload?.error ?? `Chatting request failed with ${response.status}.`);
    }

    return payload as Response;
  }
}

function buildURL(baseURL: string, path: string, query?: Record<string, string | null | undefined>) {
  const url = new URL(path, `${baseURL}/`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

async function readPayload(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as Record<string, string>;
  } catch (error) {
    throw new Error(toErrorMessage(error));
  }
}
