import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AuthButton } from "./auth-buttons";
import { AuthBanner } from "./auth-fields";
import { AuthShell } from "./auth-shell";
import { mobileTheme } from "./mobile-theme";

type AuthStatusScreenProps = {
  actionLabel: string;
  description: string;
  icon: "checkmark" | "mail";
  message?: string | null;
  messageTone?: "error" | "warning";
  secondaryLabel?: string;
  title: string;
  onAction(): void;
  onSecondaryAction?(): void;
};

export function AuthStatusScreen({
  actionLabel,
  description,
  icon,
  message,
  messageTone,
  secondaryLabel,
  title,
  onAction,
  onSecondaryAction
}: AuthStatusScreenProps) {
  const success = icon === "checkmark";

  return (
    <AuthShell description={description} title={title}>
      <View style={styles.content}>
        <View style={[styles.iconWrap, success ? styles.successWrap : styles.emailWrap]}>
          <Ionicons
            color={success ? mobileTheme.colors.green : mobileTheme.colors.blue}
            name={success ? "checkmark" : "mail-outline"}
            size={40}
          />
        </View>
        <AuthBanner message={message ?? null} tone={messageTone} />
        <AuthButton trailingIcon={success ? "arrow-forward" : undefined} onPress={onAction}>
          {actionLabel}
        </AuthButton>
        {secondaryLabel && onSecondaryAction ? (
          <Pressable onPress={onSecondaryAction}>
            <Text style={styles.secondaryLink}>{secondaryLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", gap: mobileTheme.spacing.xl, paddingTop: mobileTheme.spacing.md },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  emailWrap: { backgroundColor: mobileTheme.colors.blueLight },
  successWrap: { backgroundColor: "#D1FAE5", borderRadius: 9999 },
  secondaryLink: { ...mobileTheme.typography.small, color: mobileTheme.colors.blue, fontWeight: "500" }
});
