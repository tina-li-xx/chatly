import { disableMobilePushTokensRow } from "@/lib/repositories/mobile-push-repository";
import { previewIncomingMessage } from "@/lib/notification-utils";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export async function sendExpoPushNotifications(input: {
  pushTokens: string[];
  conversationId: string;
  content: string;
  attachmentsCount: number;
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
        sound: "default",
        title: "Support replied",
        body: previewIncomingMessage(input.content, input.attachmentsCount),
        data: {
          source: "chatting",
          type: "conversation.reply",
          conversationId: input.conversationId
        }
      }))
    )
  });

  if (!response.ok) {
    throw new Error(`EXPO_PUSH_FAILED_${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: Array<{ status?: string; details?: { error?: string } }>;
  };
  const invalidTokens = input.pushTokens.filter((pushToken, index) => {
    const details = payload.data?.[index]?.details;
    return payload.data?.[index]?.status === "error" && details?.error === "DeviceNotRegistered";
  });

  if (invalidTokens.length) {
    await disableMobilePushTokensRow(invalidTokens);
  }

  return {
    sent: input.pushTokens.length - invalidTokens.length,
    disabled: invalidTokens.length
  };
}
