import { bindMobilePushRegistrationsToConversationRow, disableMobilePushRegistrationRow, upsertMobilePushRegistrationRow } from "@/lib/repositories/mobile-push-repository";
import { optionalText } from "@/lib/utils";
import { getPublicConversationState } from "./conversations";

export async function registerPublicMobilePushDevice(input: {
  siteId: string;
  sessionId: string;
  conversationId: string | null;
  pushToken: string;
  provider?: "expo" | "apns" | null;
  platform?: string | null;
  appId?: string | null;
  bundleId?: string | null;
  environment?: "sandbox" | "production" | null;
}) {
  const pushToken = optionalText(input.pushToken);
  if (!pushToken) {
    throw new Error("PUSH_TOKEN_REQUIRED");
  }
  const provider = input.provider === "apns" ? "apns" : "expo";
  const bundleId = optionalText(input.bundleId);
  const environment = input.environment ?? null;

  if (provider === "apns" && (!bundleId || !environment)) {
    throw new Error("APNS_DEVICE_METADATA_REQUIRED");
  }

  if (input.conversationId) {
    const conversation = await getPublicConversationState({
      siteId: input.siteId,
      sessionId: input.sessionId,
      conversationId: input.conversationId
    });

    if (!conversation) {
      return { ok: false as const, error: "CONVERSATION_NOT_FOUND" as const };
    }
  }

  await upsertMobilePushRegistrationRow({
    id: createMobilePushRegistrationId(),
    siteId: input.siteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    provider,
    platform: optionalText(input.platform),
    appId: optionalText(input.appId),
    bundleId,
    environment,
    pushToken
  });

  return { ok: true as const };
}

export async function unregisterPublicMobilePushDevice(input: {
  siteId: string;
  sessionId: string;
  pushToken: string;
}) {
  const pushToken = optionalText(input.pushToken);
  if (!pushToken) {
    throw new Error("PUSH_TOKEN_REQUIRED");
  }

  await disableMobilePushRegistrationRow({
    siteId: input.siteId,
    sessionId: input.sessionId,
    pushToken
  });
}

export async function bindSessionMobilePushDevicesToConversation(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
}) {
  await bindMobilePushRegistrationsToConversationRow(input);
}

function createMobilePushRegistrationId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `push_${globalThis.crypto.randomUUID()}`;
  }

  return `push_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
