import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { mobileTheme } from "./mobile-theme";

export function ThreadActionToast({
  message,
  onDismiss
}: {
  message: string | null;
  onDismiss(): void;
}) {
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(onDismiss, 2000);
    return () => clearTimeout(timeout);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <View style={styles.toast}>
      <Ionicons color="#86EFAC" name="checkmark" size={18} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: mobileTheme.spacing.lg,
    right: mobileTheme.spacing.lg,
    bottom: mobileTheme.spacing.xl,
    borderRadius: 10,
    backgroundColor: mobileTheme.colors.slate900,
    paddingHorizontal: mobileTheme.spacing.lg,
    paddingVertical: mobileTheme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: mobileTheme.spacing.sm,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10
  },
  text: { flex: 1, ...mobileTheme.typography.small, color: mobileTheme.colors.white, fontWeight: "500" }
});
