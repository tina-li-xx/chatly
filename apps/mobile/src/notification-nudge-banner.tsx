import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { mobileTheme } from "./mobile-theme";

export function NotificationNudgeBanner({
  onDismiss,
  onEnable
}: {
  onDismiss(): void;
  onEnable(): void;
}) {
  return (
    <View style={styles.banner}>
      <View style={styles.copy}>
        <Ionicons color="#B45309" name="notifications-outline" size={18} />
        <Text style={styles.text}>Turn on notifications to catch messages when you&apos;re away.</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onEnable}>
          <Text style={styles.enable}>Enable</Text>
        </Pressable>
        <Pressable onPress={onDismiss} style={styles.dismiss}>
          <Ionicons color="#D97706" name="close" size={16} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: mobileTheme.spacing.lg,
    paddingVertical: mobileTheme.spacing.md,
    backgroundColor: "#FEF3C7",
    borderBottomWidth: 1,
    borderBottomColor: "#FCD34D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: mobileTheme.spacing.md
  },
  copy: { flex: 1, flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.sm },
  text: { flex: 1, ...mobileTheme.typography.small, color: "#92400E" },
  actions: { flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.sm },
  enable: { ...mobileTheme.typography.small, color: "#B45309", fontWeight: "600" },
  dismiss: { width: 28, height: 28, alignItems: "center", justifyContent: "center" }
});
