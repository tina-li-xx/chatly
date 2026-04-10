import { ChattingClient } from "../chatting-client";
import { createMemorySessionStore } from "../chatting-session-store";

describe("ChattingClient", () => {
  it("defaults to usechatting.com and loads site config", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ site: { id: "site_1", widgetTitle: "Support" } }), { status: 200 })
    );
    const client = new ChattingClient({ siteId: "site_1", fetchImpl: fetchMock as typeof fetch });

    const config = await client.fetchSiteConfig();

    expect(config.widgetTitle).toBe("Support");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("https://usechatting.com/api/public/site-config");
  });

  it("persists conversation state after sending the first message", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            conversationId: "conv_1",
            message: { id: "msg_1", content: "Hello", createdAt: "2026-04-09T18:00:00.000Z", sender: "user", attachments: [] },
            faqSuggestions: null
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ ok: true, conversationId: "conv_1", messages: [], faqSuggestions: null }),
          { status: 200 }
        )
      );

    const client = new ChattingClient({
      siteId: "site_1",
      fetchImpl: fetchMock as typeof fetch,
      sessionStore: createMemorySessionStore()
    });

    await client.sendMessage("Hello", { email: "person@example.com" });
    const state = await client.currentSessionState();
    await client.fetchConversation();

    expect(state.conversationId).toBe("conv_1");
    expect(state.email).toBe("person@example.com");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("conversationId=conv_1");
  });

  it("stores email locally before a conversation exists", async () => {
    const fetchMock = vi.fn();
    const client = new ChattingClient({
      siteId: "site_1",
      fetchImpl: fetchMock as typeof fetch,
      sessionStore: createMemorySessionStore()
    });

    await client.saveEmail("saved@example.com");
    const state = await client.currentSessionState();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(state.email).toBe("saved@example.com");
  });

  it("stores a push token locally and syncs it after the first conversation is created", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            conversationId: "conv_1",
            message: { id: "msg_1", content: "Hello", createdAt: "2026-04-09T18:00:00.000Z", sender: "user", attachments: [] },
            faqSuggestions: null
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const client = new ChattingClient({
      siteId: "site_1",
      fetchImpl: fetchMock as typeof fetch,
      sessionStore: createMemorySessionStore()
    });

    await client.registerPushToken({ pushToken: "ExponentPushToken[token]", platform: "ios", appId: "my.expo.app" });
    await client.sendMessage("Hello");

    const state = await client.currentSessionState();
    expect(state.pushTokenSyncedConversationId).toBe("conv_1");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/api/public/mobile-device");
  });

  it("unregisters the stored push token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const sessionStore = createMemorySessionStore();
    await sessionStore.save({
      sessionId: "session_1",
      pushToken: "ExponentPushToken[token]",
      pushTokenSyncedConversationId: "conv_1"
    });

    const client = new ChattingClient({ siteId: "site_1", fetchImpl: fetchMock as typeof fetch, sessionStore });
    await client.unregisterPushToken();

    const state = await client.currentSessionState();
    expect(state.pushToken).toBeNull();
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/api/public/mobile-device");
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("subscribes to the live conversation stream for the active session", async () => {
    const encoder = new TextEncoder();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode('data: {"type":"connected","conversationId":"conv_1"}\n\n'));
          }
        }),
        { status: 200 }
      )
    );

    const sessionStore = createMemorySessionStore();
    await sessionStore.save({ sessionId: "session_1", conversationId: "conv_1" });
    const client = new ChattingClient({ siteId: "site_1", fetchImpl: fetchMock as typeof fetch, sessionStore });
    const events: string[] = [];

    const stop = await client.subscribeLiveEvents({
      onEvent(event) {
        events.push(event.type);
      }
    });
    await Promise.resolve();
    stop();

    expect(events).toEqual(["connected"]);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/api/public/conversation-live?siteId=site_1");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("conversationId=conv_1");
  });
});
