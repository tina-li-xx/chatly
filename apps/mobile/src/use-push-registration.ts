import { useCallback, useEffect, useState } from "react";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { AppState, Linking, Platform } from "react-native";
import { registerMobileDevice } from "./api";
import type { MobileNotificationPreferences } from "./types";
import { useStableCallback } from "./use-stable-callback";

type PermissionStatus = "denied" | "granted" | "unavailable" | "undetermined";

type ForegroundNotification = {
  body: string;
  conversationId: string;
  senderName: string;
  title: string;
};

export function usePushRegistration(input: {
  baseUrl: string | null;
  token: string | null;
  preferences: MobileNotificationPreferences;
  onOpenConversation(conversationId: string): void;
}) {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [status, setStatus] = useState("Notifications not set up");
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>("undetermined");
  const [foregroundNotification, setForegroundNotification] = useState<ForegroundNotification | null>(null);
  const openConversation = useStableCallback((conversationId: string) => input.onOpenConversation(conversationId));

  const refreshPermissionStatus = useCallback(async () => {
    const permission = await Notifications.getPermissionsAsync();
    const next = permission.granted ? "granted" : permission.canAskAgain ? "undetermined" : "denied";
    setPermissionStatus(next);
    return next;
  }, []);

  const registerCurrentDevice = useCallback(async () => {
    if (!input.baseUrl || !input.token) {
      setPushToken(null);
      setStatus("Notifications not set up");
      return;
    }
    if (!Device.isDevice) {
      setPushToken(null);
      setStatus("Push notifications require a physical device");
      return;
    }
    if (permissionStatus !== "granted") {
      setPushToken(null);
      setStatus("Notifications are off");
      return;
    }
    if (Platform.OS === "android") {
      await ensureAndroidNotificationChannel(input.preferences);
    }
    const devicePushToken = await Notifications.getDevicePushTokenAsync();
    const pushTokenValue = String(devicePushToken.data);

    if (devicePushToken.type === "ios") {
      const bundleId = Constants.expoConfig?.ios?.bundleIdentifier?.trim() || null;
      if (!bundleId) {
        setStatus("Notifications need an iOS bundle identifier");
        return;
      }
      await registerMobileDevice(input.baseUrl, input.token, {
        pushToken: pushTokenValue,
        provider: "apns",
        platform: "ios",
        appId: bundleId,
        bundleId,
        environment: __DEV__ ? "sandbox" : "production"
      });
    } else {
      const appId = Constants.expoConfig?.android?.package?.trim() || null;
      if (!appId) {
        setStatus("Notifications need an Android package name");
        return;
      }
      await registerMobileDevice(input.baseUrl, input.token, {
        pushToken: pushTokenValue,
        provider: "fcm",
        platform: "android",
        appId
      });
    }

    setPushToken(pushTokenValue);
    setStatus(input.preferences.pushEnabled ? "Notifications are on" : "Notifications are paused");
  }, [input.baseUrl, input.preferences, input.token, permissionStatus]);

  const requestPermission = useCallback(async () => {
    const permission = await Notifications.requestPermissionsAsync();
    const next = permission.granted ? "granted" : permission.canAskAgain ? "undetermined" : "denied";
    setPermissionStatus(next);
    if (next === "granted") {
      await registerCurrentDevice().catch(() => setStatus("Notifications need a native push build"));
    }
    return next;
  }, [registerCurrentDevice]);

  const openSystemSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: input.preferences.pushEnabled,
        shouldShowBanner: input.preferences.pushEnabled,
        shouldShowList: input.preferences.pushEnabled,
        shouldPlaySound: input.preferences.pushEnabled && input.preferences.soundName !== "none",
        shouldSetBadge: false
      })
    });
  }, [input.preferences.pushEnabled, input.preferences.soundName]);

  useEffect(() => {
    void refreshPermissionStatus();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refreshPermissionStatus();
      }
    });
    return () => subscription.remove();
  }, [refreshPermissionStatus]);

  useEffect(() => {
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((event) => {
      const conversationId = String(event.notification.request.content.data?.conversationId ?? "").trim();
      if (conversationId) {
        setForegroundNotification(null);
        openConversation(conversationId);
      }
    });
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      const content = notification.request.content;
      const conversationId = String(content.data?.conversationId ?? "").trim();
      if (!conversationId || !input.preferences.pushEnabled) {
        return;
      }
      setForegroundNotification({
        body: content.body ?? "",
        conversationId,
        senderName: String(content.data?.senderName ?? "Visitor"),
        title: content.title ?? "New message"
      });
    });
    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, [input.preferences.pushEnabled]);

  useEffect(() => {
    registerCurrentDevice().catch(() => {
      setPushToken(null);
      setStatus("Notifications need a native push build");
    });
  }, [registerCurrentDevice]);

  return {
    clearForegroundNotification: () => setForegroundNotification(null),
    foregroundNotification,
    openSystemSettings,
    permissionStatus,
    pushToken,
    refreshPermissionStatus,
    requestPermission,
    status
  };
}

async function ensureAndroidNotificationChannel(preferences: MobileNotificationPreferences) {
  await Notifications.setNotificationChannelAsync("chatting-messages", {
    name: "Messages",
    importance: Notifications.AndroidImportance.MAX,
    enableVibrate: preferences.vibrationEnabled,
    vibrationPattern: preferences.vibrationEnabled ? [0, 250, 150, 250] : [0],
    ...(preferences.soundName !== "none" ? { sound: "default" } : {})
  });
}
