# @usechatting/react-native

Expo-friendly React Native chat package for Chatting.

## What it includes

- JavaScript client for Chatting public chat APIs
- pluggable async session storage
- React hook for conversation state
- simple React Native chat screen
- live conversation sync with automatic polling fallback

## Install

```bash
npm install @usechatting/react-native
```

If you want session persistence across app restarts, also install an async storage adapter in your app, for example React Native Async Storage.

For Expo push notifications in your host app, also install:

```bash
npx expo install expo-notifications
```

## Required config

- `baseURL`: use `https://usechatting.com`
- `siteId`: your site/workspace ID inside Chatting

## Exact Expo integration snippet

```tsx
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { AppState, Platform } from "react-native";
import {
  ChattingClient,
  ChattingConversationScreen,
  createKeyValueSessionStore
} from "@usechatting/react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

const client = new ChattingClient({
  baseURL: "https://usechatting.com",
  siteId: "your-site-id",
  sessionStore: createKeyValueSessionStore(AsyncStorage, "your-site-id")
});

export function SupportScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const context = useMemo(() => ({ pageUrl: "myapp://support" }), []);

  useEffect(() => {
    let mounted = true;
    const refreshChat = async () => {
      await client.syncPushToken();
      if (mounted) {
        setRefreshKey((current) => current + 1);
      }
    };

    const registerPush = async () => {
      const permission = await Notifications.requestPermissionsAsync();
      if (!mounted || permission.status !== "granted") {
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: "your-expo-project-id"
      });

      await client.registerPushToken({
        pushToken: token.data,
        platform: Platform.OS
      });
    };

    void registerPush();

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshChat();
      }
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(() => {
      void refreshChat();
    });

    return () => {
      mounted = false;
      appStateSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <ChattingConversationScreen
      key={refreshKey}
      client={client}
      context={context}
      draftVisitorEmail="customer@example.com"
    />
  );
}
```

## Realtime behavior

This package uses a dedicated React Native live transport for Chatting's SSE conversation stream, so new team messages and team typing updates show up immediately while the app is open. If that live connection drops, the hook falls back to foreground polling so the conversation stays usable while reconnecting.

Expo push delivery is now supported for background and suspended apps once the host app registers an Expo push token through `client.registerPushToken(...)`. When the app becomes active again or a notification is tapped, call `client.syncPushToken()` and remount or refresh your chat screen so the conversation refetches cleanly.
