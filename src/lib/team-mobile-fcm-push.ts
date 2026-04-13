import { getFcmPushBearerToken } from "@/lib/fcm-push-auth";
import { disableTeamMobilePushTokens } from "@/lib/repositories/team-mobile-device-repository";

const INVALID_TOKEN_ERRORS = new Set(["UNREGISTERED"]);

export async function sendTeamFcmPushNotifications(input: {
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

  const { projectId, accessToken } = await getFcmPushBearerToken();
  const invalidTokens: string[] = [];
  let sent = 0;

  await Promise.all(
    input.pushTokens.map(async (pushToken) => {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: {
              token: pushToken,
              notification: {
                title: input.title,
                body: input.body
              },
              data: {
                source: "chatting",
                type: input.notificationType,
                conversationId: input.conversationId,
                senderName: input.senderName ?? ""
              },
              android: {
                priority: "high",
                notification: {
                  channelId: "chatting-messages",
                  ...(input.soundName ? { sound: input.soundName } : {})
                }
              }
            }
          })
        }
      );

      if (response.ok) {
        sent += 1;
        return;
      }

      const payload = (await response.json().catch(() => null)) as {
        error?: {
          details?: Array<{ errorCode?: string }>;
          status?: string;
        };
      } | null;
      const errorCode = payload?.error?.details?.find((detail) => detail.errorCode)?.errorCode
        ?? payload?.error?.status
        ?? null;

      if (errorCode && INVALID_TOKEN_ERRORS.has(errorCode)) {
        invalidTokens.push(pushToken);
        return;
      }

      throw new Error(`TEAM_FCM_PUSH_FAILED_${response.status}_${errorCode ?? "UNKNOWN"}`);
    })
  );

  if (invalidTokens.length) {
    await disableTeamMobilePushTokens(invalidTokens);
  }

  return { sent, disabled: invalidTokens.length };
}
