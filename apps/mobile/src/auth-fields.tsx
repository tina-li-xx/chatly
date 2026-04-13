import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode, RefObject } from "react";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { mobileTheme } from "./mobile-theme";

type AuthFieldProps = Omit<ComponentProps<typeof TextInput>, "style"> & {
  error?: string | null;
  inputRef?: RefObject<TextInput | null>;
  label: string;
  rightAccessory?: ReactNode;
};

export function AuthTextField({ error, inputRef, label, rightAccessory, ...props }: AuthFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.focused, error && styles.errored]}>
        <TextInput
          {...props}
          ref={inputRef}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          placeholderTextColor={mobileTheme.colors.slate400}
          style={styles.input}
        />
        {rightAccessory}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons color={mobileTheme.colors.red} name="alert-circle" size={14} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function AuthPasswordField({
  error,
  inputRef,
  label,
  ...props
}: Omit<AuthFieldProps, "rightAccessory">) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthTextField
      {...props}
      error={error}
      inputRef={inputRef}
      label={label}
      secureTextEntry={!visible}
      rightAccessory={(
        <Pressable onPress={() => setVisible((current) => !current)} style={styles.eyeButton}>
          <Ionicons
            color={mobileTheme.colors.slate400}
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={20}
          />
        </Pressable>
      )}
    />
  );
}

export function AuthBanner({
  message,
  tone = "error"
}: {
  message: string | null;
  tone?: "error" | "warning";
}) {
  if (!message) {
    return null;
  }

  return (
    <View style={[styles.banner, tone === "warning" ? styles.warningBanner : styles.errorBanner]}>
      <Ionicons
        color={tone === "warning" ? mobileTheme.colors.amber : mobileTheme.colors.red}
        name={tone === "warning" ? "wifi-outline" : "alert-circle"}
        size={20}
      />
      <Text style={[styles.bannerText, tone === "warning" ? styles.warningText : styles.errorBannerText]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  label: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate700, fontWeight: "500" },
  inputWrap: {
    height: 52,
    borderWidth: 1,
    borderColor: mobileTheme.colors.slate200,
    borderRadius: 10,
    backgroundColor: mobileTheme.colors.white,
    paddingLeft: mobileTheme.spacing.lg,
    flexDirection: "row",
    alignItems: "center"
  },
  focused: { borderColor: mobileTheme.colors.blue, backgroundColor: mobileTheme.colors.blue50 },
  errored: { borderColor: mobileTheme.colors.red, backgroundColor: "#FEF2F2" },
  input: { flex: 1, height: "100%", ...mobileTheme.typography.body, color: mobileTheme.colors.slate900 },
  eyeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: mobileTheme.spacing.xs
  },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  errorText: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.red },
  banner: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: mobileTheme.spacing.lg,
    paddingVertical: mobileTheme.spacing.md,
    flexDirection: "row",
    gap: mobileTheme.spacing.sm
  },
  errorBanner: { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" },
  warningBanner: { backgroundColor: "#FEF3C7", borderColor: "#FCD34D" },
  bannerText: { flex: 1, ...mobileTheme.typography.small },
  errorBannerText: { color: "#B91C1C" },
  warningText: { color: "#B45309" }
});
