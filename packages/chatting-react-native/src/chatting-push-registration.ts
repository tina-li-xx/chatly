import { normalizeText } from "./chatting-utils";
import type {
  ChattingPushRegistrationInput,
  ChattingSessionState
} from "./chatting-types";
import type { ChattingTransport } from "./chatting-transport";

export async function registerChattingPushToken(input: {
  siteId: string;
  state: ChattingSessionState;
  transport: ChattingTransport;
  registration: ChattingPushRegistrationInput;
}) {
  const pushToken = requirePushToken(input.registration.pushToken);
  const nextState: ChattingSessionState = {
    ...input.state,
    pushToken,
    pushPlatform: normalizeText(input.registration.platform),
    pushAppId: normalizeText(input.registration.appId)
  };

  return syncChattingPushToken({
    siteId: input.siteId,
    state: nextState,
    transport: input.transport
  });
}

export async function unregisterChattingPushToken(input: {
  siteId: string;
  state: ChattingSessionState;
  transport: ChattingTransport;
  pushToken?: string | null;
}) {
  const pushToken = normalizeText(input.pushToken) ?? normalizeText(input.state.pushToken);
  if (!pushToken) {
    return clearedPushState(input.state);
  }

  await input.transport.delete("/api/public/mobile-device", {
    siteId: input.siteId,
    sessionId: input.state.sessionId,
    pushToken
  });
  return clearedPushState(input.state);
}

export async function syncChattingPushToken(input: {
  siteId: string;
  state: ChattingSessionState;
  transport: ChattingTransport;
}) {
  const pushToken = normalizeText(input.state.pushToken);
  if (!pushToken || !input.state.conversationId || input.state.pushTokenSyncedConversationId === input.state.conversationId) {
    return input.state;
  }

  await input.transport.post("/api/public/mobile-device", {
    siteId: input.siteId,
    sessionId: input.state.sessionId,
    conversationId: input.state.conversationId,
    pushToken,
    platform: input.state.pushPlatform ?? null,
    appId: input.state.pushAppId ?? null
  });

  return {
    ...input.state,
    pushToken,
    pushTokenSyncedConversationId: input.state.conversationId
  };
}

export function clearConversationPushState(state: ChattingSessionState): ChattingSessionState {
  return {
    ...state,
    conversationId: null,
    pushTokenSyncedConversationId: null
  };
}

function clearedPushState(state: ChattingSessionState): ChattingSessionState {
  return {
    ...state,
    pushToken: null,
    pushPlatform: null,
    pushAppId: null,
    pushTokenSyncedConversationId: null
  };
}

function requirePushToken(value: string | null | undefined) {
  const pushToken = normalizeText(value);
  if (!pushToken) {
    throw new Error("Push token is required.");
  }
  return pushToken;
}
