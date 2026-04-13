import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { mobileTheme } from "./mobile-theme";

type AuthButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  leading?: ReactNode;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  variant?: "primary" | "secondary" | "link";
  onPress(): void;
};

export function AuthButton({
  children,
  disabled,
  loading,
  leading,
  trailingIcon,
  variant = "primary",
  onPress
}: AuthButtonProps) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" ? styles.primaryButton : styles.secondaryButton,
        variant === "link" && styles.linkButton,
        pressed && variant === "primary" && styles.primaryPressed,
        pressed && variant === "secondary" && styles.secondaryPressed,
        (disabled || loading) && styles.disabledButton
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? mobileTheme.colors.white : mobileTheme.colors.blue} />
      ) : (
        <>
          {leading ? <View style={styles.leading}>{leading}</View> : null}
          <Text style={[styles.buttonLabel, variant === "primary" ? styles.primaryLabel : styles.secondaryLabel, variant === "link" && styles.linkLabel]}>
            {children}
          </Text>
          {trailingIcon ? (
            <Ionicons
              color={variant === "primary" ? mobileTheme.colors.white : mobileTheme.colors.blue}
              name={trailingIcon}
              size={18}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

export function AuthCheckbox({
  checked,
  label,
  onPress
}: {
  checked: boolean;
  label: string;
  onPress(): void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.checkboxRow}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Ionicons color={mobileTheme.colors.white} name="checkmark" size={14} /> : null}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: mobileTheme.spacing.sm,
    paddingHorizontal: mobileTheme.spacing.xl
  },
  primaryButton: { backgroundColor: mobileTheme.colors.blue },
  secondaryButton: {
    backgroundColor: mobileTheme.colors.white,
    borderWidth: 1,
    borderColor: mobileTheme.colors.slate200
  },
  linkButton: { height: 24, paddingHorizontal: 0, justifyContent: "flex-start" },
  primaryPressed: { backgroundColor: mobileTheme.colors.blueDark },
  secondaryPressed: { backgroundColor: mobileTheme.colors.slate50 },
  disabledButton: { opacity: 0.5 },
  buttonLabel: { ...mobileTheme.typography.body, fontWeight: "600" },
  primaryLabel: { color: mobileTheme.colors.white },
  secondaryLabel: { color: mobileTheme.colors.slate700 },
  linkLabel: { color: mobileTheme.colors.blue, fontWeight: "500" },
  leading: { width: 20, alignItems: "center", justifyContent: "center" },
  checkboxRow: { flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.sm },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: mobileTheme.colors.slate200,
    alignItems: "center",
    justifyContent: "center"
  },
  checkboxChecked: {
    backgroundColor: mobileTheme.colors.blue,
    borderColor: mobileTheme.colors.blue
  },
  checkboxLabel: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate600 }
});
