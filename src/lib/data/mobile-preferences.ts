import {
  findMobileNotificationPreferencesRow,
  upsertMobileNotificationPreferencesRow
} from "@/lib/repositories/mobile-notification-preferences-repository";
import {
  findUserLastSeenAt,
  markUserOffline,
  upsertUserPresence
} from "@/lib/repositories/presence-repository";

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export type MobileAvailability = "online" | "offline";
export type MobileNotificationSound =
  | "none"
  | "chime"
  | "ding"
  | "pop"
  | "swoosh"
  | "default";

export type MobileNotificationPreferences = {
  allMessagesEnabled: boolean;
  assignedEnabled: boolean;
  newConversationEnabled: boolean;
  pushEnabled: boolean;
  soundName: MobileNotificationSound;
  vibrationEnabled: boolean;
};

const MOBILE_NOTIFICATION_SOUNDS: MobileNotificationSound[] = [
  "none",
  "chime",
  "ding",
  "pop",
  "swoosh",
  "default"
];

function normalizeMobileNotificationSound(value: string | null | undefined): MobileNotificationSound {
  return MOBILE_NOTIFICATION_SOUNDS.includes(value as MobileNotificationSound)
    ? value as MobileNotificationSound
    : "chime";
}

export async function getMobileAvailability(userId: string): Promise<MobileAvailability> {
  const lastSeenAt = await findUserLastSeenAt(userId);
  if (!lastSeenAt) {
    return "online";
  }

  return Date.now() - new Date(lastSeenAt).getTime() <= ONLINE_WINDOW_MS
    ? "online"
    : "offline";
}

export async function updateMobileAvailability(
  userId: string,
  availability: MobileAvailability
) {
  if (availability === "online") {
    await upsertUserPresence(userId);
    return "online";
  }

  await markUserOffline(userId);
  return "offline";
}

export async function getMobileNotificationPreferences(
  userId: string
): Promise<MobileNotificationPreferences> {
  const row = await findMobileNotificationPreferencesRow(userId);

  return {
    allMessagesEnabled: row?.mobile_push_all_message_alerts ?? false,
    assignedEnabled: row?.mobile_push_assignment_alerts ?? true,
    newConversationEnabled: row?.mobile_push_new_conversation_alerts ?? true,
    pushEnabled: row?.mobile_push_enabled ?? true,
    soundName: normalizeMobileNotificationSound(row?.mobile_push_sound),
    vibrationEnabled: row?.mobile_push_vibration_alerts ?? true
  };
}

export async function updateMobileNotificationPreferences(
  userId: string,
  input: MobileNotificationPreferences
) {
  await upsertMobileNotificationPreferencesRow({
    allMessagesEnabled: input.allMessagesEnabled,
    assignedEnabled: input.assignedEnabled,
    newConversationEnabled: input.newConversationEnabled,
    pushEnabled: input.pushEnabled,
    soundName: input.soundName,
    userId,
    vibrationEnabled: input.vibrationEnabled
  });

  return getMobileNotificationPreferences(userId);
}
