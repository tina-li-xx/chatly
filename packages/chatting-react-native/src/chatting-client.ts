import { createMemorySessionStore } from "./chatting-session-store";
import {
  buildChattingSiteQuery,
  DEFAULT_CHATTING_BASE_URL,
  requireChattingText
} from "./chatting-client-shared";
import {
  clearConversationPushState,
  registerChattingPushToken,
  syncChattingPushToken,
  unregisterChattingPushToken
} from "./chatting-push-registration";
import { ChattingTransport } from "./chatting-transport";
import type {
  ChattingClientOptions,
  ChattingConversationState,
  ChattingLiveEvent,
  ChattingPushRegistrationInput,
  ChattingSendMessageResult,
  ChattingSessionState,
  ChattingSiteConfig,
  ChattingSiteStatus,
  ChattingVisitorContext,
  ChattingVisitorProfile
} from "./chatting-types";
import { createSessionId, normalizeText, resolveContext } from "./chatting-utils";

export class ChattingClient {
  readonly siteId: string;
  private readonly sessionStore;
  private readonly transport;

  constructor(options: ChattingClientOptions) {
    this.siteId = options.siteId;
    this.sessionStore = options.sessionStore ?? createMemorySessionStore();
    this.transport = new ChattingTransport(options.baseURL ?? DEFAULT_CHATTING_BASE_URL, options.fetchImpl ?? fetch);
  }

  async currentSessionState() {
    const stored = await this.sessionStore.load();
    if (stored) {
      return stored;
    }

    const nextState: ChattingSessionState = { sessionId: createSessionId() };
    await this.sessionStore.save(nextState);
    return nextState;
  }

  async clearConversation() {
    const state = await this.currentSessionState();
    await this.sessionStore.save(clearConversationPushState(state));
  }

  async saveEmail(email: string) {
    const nextEmail = requireChattingText(email, "Email is required.");
    const state = await this.currentSessionState();
    if (!state.conversationId) {
      await this.sessionStore.save({ ...state, email: nextEmail });
      return;
    }

    await this.transport.post("/api/public/conversation-email", {
      siteId: this.siteId,
      sessionId: state.sessionId,
      conversationId: state.conversationId,
      email: nextEmail
    });
    await this.sessionStore.save({ ...state, email: nextEmail });
  }

  async fetchSiteConfig(context: ChattingVisitorContext = {}) {
    const state = await this.currentSessionState();
    const response = await this.transport.get<{ site: ChattingSiteConfig }>("/api/public/site-config", {
      ...buildChattingSiteQuery(this.siteId, state, resolveContext(context)),
      conversationId: state.conversationId ?? null
    });
    return response.site;
  }

  async fetchSiteStatus(context: ChattingVisitorContext = {}) {
    const state = await this.currentSessionState();
    const response = await this.transport.get<ChattingSiteStatus>("/api/public/site-status", {
      ...buildChattingSiteQuery(this.siteId, state, resolveContext(context)),
      conversationId: state.conversationId ?? null
    });
    return response;
  }

  async fetchConversationIfAvailable() {
    const state = await this.currentSessionState();
    return state.conversationId ? this.fetchConversation() : null;
  }

  async fetchConversation() {
    const state = await this.currentSessionState();
    const conversationId = requireChattingText(state.conversationId, "No active Chatting conversation exists yet.");
    return this.transport.get<ChattingConversationState>("/api/public/conversation", {
      siteId: this.siteId,
      sessionId: state.sessionId,
      conversationId
    });
  }

  async sendMessage(content: string, options: { context?: ChattingVisitorContext; email?: string | null } = {}) {
    const nextContent = requireChattingText(content, "Message content cannot be empty.");
    const state = await this.currentSessionState();
    const email = normalizeText(options.email) ?? state.email ?? null;
    const result = await this.transport.post<ChattingSendMessageResult>("/api/public/messages", {
      siteId: this.siteId,
      sessionId: state.sessionId,
      conversationId: state.conversationId ?? null,
      content: nextContent,
      email,
      ...resolveContext(options.context)
    });

    await this.sessionStore.save(
      await syncChattingPushToken({
        siteId: this.siteId,
        transport: this.transport,
        state: { ...state, conversationId: result.conversationId, email }
      })
    );
    return result;
  }

  async identify(profile: ChattingVisitorProfile, context: ChattingVisitorContext = {}) {
    const state = await this.currentSessionState();
    await this.transport.post("/api/public/identify", {
      siteId: this.siteId,
      sessionId: state.sessionId,
      conversationId: state.conversationId ?? null,
      ...resolveContext(context),
      ...profile
    });
    await this.sessionStore.save({ ...state, email: profile.email });
  }

  async updateTyping(isTyping: boolean) {
    const state = await this.currentSessionState();
    const conversationId = requireChattingText(state.conversationId, "No active Chatting conversation exists yet.");
    await this.transport.post("/api/public/typing", {
      siteId: this.siteId,
      sessionId: state.sessionId,
      conversationId,
      typing: isTyping
    });
  }

  async registerPushToken(registration: ChattingPushRegistrationInput) {
    const state = await this.currentSessionState();
    await this.sessionStore.save(
      await registerChattingPushToken({
        siteId: this.siteId,
        state,
        transport: this.transport,
        registration
      })
    );
  }

  async unregisterPushToken(pushToken?: string | null) {
    const state = await this.currentSessionState();
    await this.sessionStore.save(
      await unregisterChattingPushToken({
        siteId: this.siteId,
        state,
        transport: this.transport,
        pushToken
      })
    );
  }

  async syncPushToken() {
    const state = await this.currentSessionState();
    await this.sessionStore.save(
      await syncChattingPushToken({
        siteId: this.siteId,
        state,
        transport: this.transport
      })
    );
  }

  async subscribeLiveEvents(input: {
    onEvent(event: ChattingLiveEvent): void;
    onDisconnect?(error?: unknown): void;
  }) {
    const state = await this.currentSessionState();
    const conversationId = requireChattingText(state.conversationId, "No active Chatting conversation exists yet.");
    return this.transport.connectLive("/api/public/conversation-live", {
      siteId: this.siteId,
      sessionId: state.sessionId,
      conversationId
    }, input);
  }
}
