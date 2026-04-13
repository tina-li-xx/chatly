import type { MobileNotificationPreferences, MobileNotificationSound } from "@/lib/data/mobile-preferences";

export type TeamMobileNotificationType =
  | "assigned"
  | "new_conversation"
  | "new_message";

export function mobilePushSoundName(soundName: MobileNotificationSound) {
  return soundName === "none" ? null : "default";
}

export function shouldSendTeamMobileNotification(
  preferences: MobileNotificationPreferences,
  notificationType: TeamMobileNotificationType
) {
  if (!preferences.pushEnabled) {
    return false;
  }

  if (notificationType === "assigned") {
    return preferences.assignedEnabled;
  }

  if (notificationType === "new_message") {
    return preferences.allMessagesEnabled;
  }

  return preferences.newConversationEnabled || preferences.allMessagesEnabled;
}
