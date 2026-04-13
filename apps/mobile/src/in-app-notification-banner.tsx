import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AvatarBadge } from "./avatar-badge";
import { mobileTheme } from "./mobile-theme";

export type ForegroundNotificationBanner = {
  body: string;
  conversationId: string;
  senderName: string;
  title: string;
};

export function InAppNotificationBanner({
  notification,
  onDismiss,
  onOpen
}: {
  notification: ForegroundNotificationBanner | null;
  onDismiss(): void;
  onOpen(conversationId: string): void;
}) {
  useEffect(() => {
    if (!notification) {
      return;
    }
    const timeout = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timeout);
  }, [notification, onDismiss]);

  if (!notification) {
    return null;
  }

  return (
    <Pressable style={styles.banner} onPress={() => onOpen(notification.conversationId)}>
      <AvatarBadge label={notification.senderName} size={40} />
      <View style={styles.copy}>
        <View style={styles.header}>
          <Text numberOfLines={1} style={styles.title}>{notification.title}</Text>
          <Text style={styles.time}>now</Text>
        </View>
        <Text numberOfLines={1} style={styles.body}>{notification.body}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 56,
    left: 8,
    right: 8,
    zIndex: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: mobileTheme.spacing.md,
    paddingHorizontal: mobileTheme.spacing.lg,
    paddingVertical: mobileTheme.spacing.md,
    borderRadius: mobileTheme.radius.lg,
    backgroundColor: mobileTheme.colors.white,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8
  },
  copy: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.sm },
  title: { flex: 1, ...mobileTheme.typography.small, color: mobileTheme.colors.slate900, fontWeight: "500" },
  time: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate400 },
  body: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500, marginTop: 2 }
});
