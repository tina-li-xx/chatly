import { getMobileNotificationPreferences } from "@/lib/data/mobile-preferences";
import { listActiveTeamMobilePushRegistrations } from "@/lib/repositories/team-mobile-device-repository";
import { sendTeamApnsPushNotifications } from "@/lib/team-mobile-apns-push";
import { sendTeamExpoPushNotifications } from "@/lib/team-mobile-expo-push";
import { sendTeamFcmPushNotifications } from "@/lib/team-mobile-fcm-push";
import {
  mobilePushSoundName,
  shouldSendTeamMobileNotification,
  type TeamMobileNotificationType
} from "@/lib/team-mobile-push-preferences";

export async function sendTeamMobilePushNotifications(input: {
  body: string;
  userId: string;
  conversationId: string;
  notificationType: TeamMobileNotificationType;
  senderName: string | null;
  title: string;
}) {
  const [registrations, preferences] = await Promise.all([
    listActiveTeamMobilePushRegistrations(input.userId),
    getMobileNotificationPreferences(input.userId)
  ]);
  if (!registrations.length || !shouldSendTeamMobileNotification(preferences, input.notificationType)) {
    return { sent: 0, disabled: 0 };
  }
  const soundName = mobilePushSoundName(preferences.soundName);
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
  const fcmTokens = registrations
    .filter((registration) => registration.provider === "fcm")
    .map((registration) => registration.pushToken);

  const [expoResult, apnsResult, fcmResult] = await Promise.allSettled([
    sendTeamExpoPushNotifications({
      notificationType: input.notificationType,
      pushTokens: expoTokens,
      conversationId: input.conversationId,
      senderName: input.senderName,
      title: input.title,
      body: input.body,
      soundName
    }),
    sendTeamApnsPushNotifications({
      notificationType: input.notificationType,
      registrations: apnsRegistrations,
      conversationId: input.conversationId,
      senderName: input.senderName,
      title: input.title,
      body: input.body,
      soundName
    }),
    sendTeamFcmPushNotifications({
      notificationType: input.notificationType,
      pushTokens: fcmTokens,
      conversationId: input.conversationId,
      senderName: input.senderName,
      title: input.title,
      body: input.body,
      soundName
    })
  ]);

  if (expoResult.status === "rejected") {
    console.error("team expo push delivery failed", expoResult.reason);
  }
  if (apnsResult.status === "rejected") {
    console.error("team apns push delivery failed", apnsResult.reason);
  }
  if (fcmResult.status === "rejected") {
    console.error("team fcm push delivery failed", fcmResult.reason);
  }

  return {
    sent:
      (expoResult.status === "fulfilled" ? expoResult.value.sent : 0) +
      (apnsResult.status === "fulfilled" ? apnsResult.value.sent : 0) +
      (fcmResult.status === "fulfilled" ? fcmResult.value.sent : 0),
    disabled:
      (expoResult.status === "fulfilled" ? expoResult.value.disabled : 0) +
      (apnsResult.status === "fulfilled" ? apnsResult.value.disabled : 0) +
      (fcmResult.status === "fulfilled" ? fcmResult.value.disabled : 0)
  };
}
