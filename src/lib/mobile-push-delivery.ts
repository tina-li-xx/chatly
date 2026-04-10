import { listConversationMobilePushRegistrationsRow } from "@/lib/repositories/mobile-push-repository";
import { sendApnsPushNotifications } from "@/lib/apns-push";
import { sendExpoPushNotifications } from "@/lib/expo-push";

export async function sendConversationMobilePushNotifications(input: {
  ownerUserId: string;
  conversationId: string;
  content: string;
  attachmentsCount: number;
}) {
  const registrations = await listConversationMobilePushRegistrationsRow({
    ownerUserId: input.ownerUserId,
    conversationId: input.conversationId
  });
  if (!registrations.length) {
    return { sent: 0, disabled: 0 };
  }

  const expoTokens = registrations
    .filter((registration) => registration.provider === "expo")
    .map((registration) => registration.pushToken);
  const apnsRegistrations = registrations.flatMap((registration) => {
    if (
      registration.provider !== "apns" ||
      !registration.bundleId ||
      !registration.environment
    ) {
      return [];
    }

    return [{
      pushToken: registration.pushToken,
      bundleId: registration.bundleId,
      environment: registration.environment
    }];
  });

  const [expoResult, apnsResult] = await Promise.allSettled([
    sendExpoPushNotifications({
      pushTokens: expoTokens,
      conversationId: input.conversationId,
      content: input.content,
      attachmentsCount: input.attachmentsCount
    }),
    sendApnsPushNotifications({
      registrations: apnsRegistrations,
      conversationId: input.conversationId,
      content: input.content,
      attachmentsCount: input.attachmentsCount
    })
  ]);

  if (expoResult.status === "rejected") {
    console.error("expo push delivery failed", expoResult.reason);
  }
  if (apnsResult.status === "rejected") {
    console.error("apns push delivery failed", apnsResult.reason);
  }

  return {
    sent:
      (expoResult.status === "fulfilled" ? expoResult.value.sent : 0) +
      (apnsResult.status === "fulfilled" ? apnsResult.value.sent : 0),
    disabled:
      (expoResult.status === "fulfilled" ? expoResult.value.disabled : 0) +
      (apnsResult.status === "fulfilled" ? apnsResult.value.disabled : 0)
  };
}
