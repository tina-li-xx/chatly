import AsyncStorage from "@react-native-async-storage/async-storage";

type NotificationPermissionState = {
  nudgeDismissedUntil: string | null;
  onboardingSeenAt: string | null;
};

const DEFAULT_STATE: NotificationPermissionState = {
  nudgeDismissedUntil: null,
  onboardingSeenAt: null
};

function storageKey(userId: string) {
  return `@chatting/mobile-notification-permission/${userId}`;
}

export async function loadNotificationPermissionState(userId: string) {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  if (!raw) {
    return DEFAULT_STATE;
  }

  try {
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<NotificationPermissionState>) };
  } catch {
    await AsyncStorage.removeItem(storageKey(userId));
    return DEFAULT_STATE;
  }
}

export function saveNotificationPermissionState(
  userId: string,
  state: NotificationPermissionState
) {
  return AsyncStorage.setItem(storageKey(userId), JSON.stringify(state));
}
