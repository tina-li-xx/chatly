import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AuthButton } from "./auth-buttons";
import { mobileTheme } from "./mobile-theme";

type NotificationPermissionScreenProps = {
  mode: "prompt" | "success";
  onContinue(): void;
  onEnable(): void;
  onSkip(): void;
};

export function NotificationPermissionScreen({
  mode,
  onContinue,
  onEnable,
  onSkip
}: NotificationPermissionScreenProps) {
  useEffect(() => {
    if (mode !== "success") {
      return;
    }
    const timeout = setTimeout(onContinue, 2000);
    return () => clearTimeout(timeout);
  }, [mode, onContinue]);

  return (
    <View style={styles.screen}>
      {mode === "prompt" ? (
        <>
          <View style={styles.promptIconWrap}>
            <Ionicons color={mobileTheme.colors.blue} name="notifications" size={40} />
          </View>
          <Text style={styles.title}>Never miss a message</Text>
          <Text style={styles.description}>
            Get notified instantly when visitors start a conversation. Reply from anywhere, even while grabbing coffee.
          </Text>
          <View style={styles.previewCard}>
            <View style={styles.previewRow}>
              <View style={styles.previewDot} />
              <Text style={styles.previewTitle}>New message from James</Text>
              <Text style={styles.previewTime}>now</Text>
            </View>
            <Text numberOfLines={1} style={styles.previewBody}>Quick question about…</Text>
          </View>
          <AuthButton onPress={onEnable}>Enable notifications</AuthButton>
          <Pressable onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Maybe later</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.successIconWrap}>
            <Ionicons color={mobileTheme.colors.green} name="checkmark" size={32} />
          </View>
          <Text style={styles.title}>You&apos;re all set!</Text>
          <Text style={styles.description}>We&apos;ll notify you when visitors need your help.</Text>
          <AuthButton trailingIcon="arrow-forward" onPress={onContinue}>Go to inbox</AuthButton>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: mobileTheme.spacing.xl,
    backgroundColor: mobileTheme.colors.white
  },
  promptIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: mobileTheme.colors.blueLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: mobileTheme.spacing.xl
  },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: mobileTheme.spacing.xl
  },
  title: { ...mobileTheme.typography.title, color: mobileTheme.colors.slate900, textAlign: "center", marginBottom: mobileTheme.spacing.md },
  description: {
    ...mobileTheme.typography.body,
    color: mobileTheme.colors.slate500,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: mobileTheme.spacing.xl
  },
  previewCard: {
    width: 280,
    paddingHorizontal: mobileTheme.spacing.lg,
    paddingVertical: mobileTheme.spacing.md,
    borderRadius: mobileTheme.radius.lg,
    borderWidth: 1,
    borderColor: mobileTheme.colors.slate200,
    backgroundColor: mobileTheme.colors.slate50,
    marginBottom: 40
  },
  previewRow: { flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.sm },
  previewDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: mobileTheme.colors.blue },
  previewTitle: { flex: 1, ...mobileTheme.typography.small, color: mobileTheme.colors.slate900, fontWeight: "500" },
  previewTime: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate400 },
  previewBody: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500, marginTop: 6 },
  skipButton: { minHeight: 44, marginTop: mobileTheme.spacing.lg, alignItems: "center", justifyContent: "center" },
  skipText: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate500, fontWeight: "500" }
});
