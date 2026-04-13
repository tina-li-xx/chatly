import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { mobileTheme } from "./mobile-theme";

type AuthShellProps = {
  backLabel?: string;
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  title: string;
  withBrand?: boolean;
  onBack?(): void;
};

export function AuthShell({
  backLabel,
  children,
  description,
  footer,
  title,
  withBrand,
  onBack
}: AuthShellProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      style={styles.screen}
    >
      <Pressable onPress={Keyboard.dismiss} style={styles.screen}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {onBack && backLabel ? (
            <Pressable onPress={onBack} style={styles.backRow}>
              <Ionicons color={mobileTheme.colors.slate600} name="chevron-back" size={20} />
              <Text style={styles.backLabel}>{backLabel}</Text>
            </Pressable>
          ) : null}
          {withBrand ? (
            <View style={styles.brandBlock}>
              <View style={styles.brandIcon}>
                <Ionicons color={mobileTheme.colors.white} name="chatbubble-ellipses" size={28} />
              </View>
              <Text style={styles.brandName}>Chatting</Text>
            </View>
          ) : null}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
          </View>
          <View style={styles.body}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: mobileTheme.colors.white },
  content: {
    flexGrow: 1,
    paddingHorizontal: mobileTheme.spacing.xl,
    paddingTop: mobileTheme.spacing.xl,
    paddingBottom: mobileTheme.spacing.xxl,
    justifyContent: "center"
  },
  backRow: { flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.sm, marginBottom: mobileTheme.spacing.xl },
  backLabel: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate600 },
  brandBlock: { alignItems: "center", marginBottom: mobileTheme.spacing.xl },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: mobileTheme.colors.blue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: mobileTheme.spacing.md
  },
  brandName: { ...mobileTheme.typography.title, color: mobileTheme.colors.slate900 },
  header: { alignItems: "center", gap: mobileTheme.spacing.sm, marginBottom: mobileTheme.spacing.xl },
  title: { ...mobileTheme.typography.title, color: mobileTheme.colors.slate900, textAlign: "center" },
  description: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate500, textAlign: "center" },
  body: { gap: mobileTheme.spacing.lg },
  footer: { marginTop: mobileTheme.spacing.xxl, alignItems: "center" }
});
