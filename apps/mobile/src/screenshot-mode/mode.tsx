import { useEffect, useState } from "react";
import { Linking, StatusBar, StyleSheet, View } from "react-native";
import { ScreenshotChatScene } from "./chat-scene";
import { ScreenshotInboxScene } from "./inbox-scene";
import { screenshotConversations, screenshotProfile, screenshotTeamMembers } from "./mock-data";
import { ScreenshotNotificationScene } from "./notification-scene";
import { ScreenshotSettingsScene } from "./settings-scene";

export type ScreenshotScene = "assign" | "chat" | "inbox" | "notification" | "settings";

function parseScene(url: string | null | undefined): ScreenshotScene | null {
  if (!url) return null;
  const match = url.match(/screenshot\/(assign|chat|inbox|notification|settings)/);
  if (match?.[1]) {
    return match[1] as ScreenshotScene;
  }
  return null;
}

function sceneFromEnv(): ScreenshotScene {
  const next = process.env.EXPO_PUBLIC_SCREENSHOT_SCENE;
  return next === "assign" || next === "chat" || next === "notification" || next === "settings" ? next : "inbox";
}

export function MobileScreenshotMode() {
  const [scene, setScene] = useState<ScreenshotScene>(sceneFromEnv());

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      const next = parseScene(url);
      if (next) setScene(next);
    }).catch(() => {});

    const subscription = Linking.addEventListener("url", ({ url }) => {
      const next = parseScene(url);
      if (next) setScene(next);
    });

    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar
        animated
        hidden={scene === "notification"}
        barStyle={scene === "notification" ? "light-content" : "dark-content"}
      />
      {scene === "inbox" ? (
        <ScreenshotInboxScene conversations={screenshotConversations} profile={screenshotProfile} />
      ) : null}
      {scene === "chat" ? <ScreenshotChatScene showAssignment={false} teamMembers={screenshotTeamMembers} /> : null}
      {scene === "assign" ? <ScreenshotChatScene showAssignment teamMembers={screenshotTeamMembers} /> : null}
      {scene === "notification" ? <ScreenshotNotificationScene /> : null}
      {scene === "settings" ? <ScreenshotSettingsScene /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }
});
