import { getApplePushBearerToken } from "@/lib/apns-push-auth";
import { disableTeamMobilePushTokens } from "@/lib/repositories/team-mobile-device-repository";

const APNS_HOSTS = {
  production: "https://api.push.apple.com",
  sandbox: "https://api.sandbox.push.apple.com"
} as const;

const INVALID_TOKEN_REASONS = new Set([
  "BadDeviceToken",
  "DeviceTokenNotForTopic",
  "Unregistered"
]);

export async function sendTeamApnsPushNotifications(input: {
  notificationType: string;
  registrations: Array<{
    pushToken: string;
    bundleId: string;
    environment: "sandbox" | "production";
  }>;
  conversationId: string;
  senderName: string | null;
  title: string;
  body: string;
  soundName: string | null;
}) {
  if (!input.registrations.length) {
    return { sent: 0, disabled: 0 };
  }

  const bearerToken = getApplePushBearerToken();
  const invalidTokens: string[] = [];
  let sent = 0;

  await Promise.all(
    input.registrations.map(async (registration) => {
      const response = await fetch(
        `${APNS_HOSTS[registration.environment]}/3/device/${registration.pushToken}`,
        {
          method: "POST",
          headers: {
            authorization: `bearer ${bearerToken}`,
            "apns-priority": "10",
            "apns-push-type": "alert",
            "apns-topic": registration.bundleId,
            "content-type": "application/json"
          },
          body: JSON.stringify({
            aps: {
              alert: {
                title: input.title,
                body: input.body
              },
              ...(input.soundName ? { sound: input.soundName } : {}),
              "content-available": 1
            },
            source: "chatting",
            type: input.notificationType,
            conversationId: input.conversationId,
            senderName: input.senderName ?? ""
          })
        }
      );

      if (response.ok) {
        sent += 1;
        return;
      }

      const payload = (await response.json().catch(() => null)) as { reason?: string } | null;
      if (
        (response.status === 400 || response.status === 410) &&
        payload?.reason &&
        INVALID_TOKEN_REASONS.has(payload.reason)
      ) {
        invalidTokens.push(registration.pushToken);
        return;
      }

      throw new Error(`TEAM_APNS_PUSH_FAILED_${response.status}_${payload?.reason ?? "UNKNOWN"}`);
    })
  );

  if (invalidTokens.length) {
    await disableTeamMobilePushTokens(invalidTokens);
  }

  return { sent, disabled: invalidTokens.length };
}
