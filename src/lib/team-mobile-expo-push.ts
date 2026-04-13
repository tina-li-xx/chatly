import { disableTeamMobilePushTokens } from "@/lib/repositories/team-mobile-device-repository";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export async function sendTeamExpoPushNotifications(input: {
  notificationType: string;
  pushTokens: string[];
  conversationId: string;
  senderName: string | null;
  title: string;
  body: string;
  soundName: string | null;
}) {
  if (!input.pushTokens.length) {
    return { sent: 0, disabled: 0 };
  }

  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(
      input.pushTokens.map((pushToken) => ({
        to: pushToken,
        ...(input.soundName ? { sound: input.soundName } : {}),
        title: input.title,
        body: input.body,
        data: {
          source: "chatting",
          type: input.notificationType,
          conversationId: input.conversationId,
          senderName: input.senderName ?? ""
        }
      }))
    )
  });
  if (!response.ok) {
    throw new Error(`TEAM_EXPO_PUSH_FAILED_${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: Array<{ status?: string; details?: { error?: string } }>;
  };
  const invalidTokens = input.pushTokens.filter((pushToken, index) => {
    const item = payload.data?.[index];
    return item?.status === "error" && item.details?.error === "DeviceNotRegistered";
  });

  if (invalidTokens.length) {
    await disableTeamMobilePushTokens(invalidTokens);
  }

  return {
    sent: input.pushTokens.length - invalidTokens.length,
    disabled: invalidTokens.length
  };
}
