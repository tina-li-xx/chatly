import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { mobileTheme } from "./mobile-theme";

export function SettingsScreen({
  title,
  onBack,
  actionLabel,
  actionDisabled,
  onAction,
  children
}: {
  title: string;
  onBack(): void;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?(): void;
  children: ReactNode;
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.iconButton}>
          <Ionicons color={mobileTheme.colors.slate600} name="chevron-back" size={22} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <Pressable
          disabled={!actionLabel || actionDisabled}
          onPress={onAction}
          style={styles.actionButton}
        >
          <Text style={[styles.actionText, actionDisabled && styles.actionDisabled]}>
            {actionLabel ?? ""}
          </Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        {children}
      </ScrollView>
    </View>
  );
}

export function SettingsSectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function SettingsCard({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function SettingsRow({
  icon,
  label,
  description,
  value,
  tone = "default",
  last,
  onPress
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  value?: string | ReactNode;
  tone?: "default" | "danger";
  last?: boolean;
  onPress?(): void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowCopy}>
        <View style={styles.rowTitle}>
          {icon ? <Ionicons color={mobileTheme.colors.slate500} name={icon} size={20} /> : null}
          <Text style={[styles.rowLabel, tone === "danger" && styles.rowDanger]}>{label}</Text>
        </View>
        {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
      </View>
      {typeof value === "string" ? <Text style={styles.rowValue}>{value}</Text> : value}
      {onPress ? <Ionicons color={mobileTheme.colors.slate400} name="chevron-forward" size={16} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: mobileTheme.colors.white },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: mobileTheme.spacing.lg,
    backgroundColor: mobileTheme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: mobileTheme.colors.slate200
  },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { ...mobileTheme.typography.heading, color: mobileTheme.colors.slate900 },
  actionButton: { minWidth: 44, alignItems: "flex-end" },
  actionText: { ...mobileTheme.typography.body, color: mobileTheme.colors.blue, fontWeight: "600" },
  actionDisabled: { color: mobileTheme.colors.slate400 },
  scroll: { flex: 1, backgroundColor: mobileTheme.colors.white },
  content: {
    flexGrow: 1,
    paddingVertical: mobileTheme.spacing.lg,
    paddingBottom: mobileTheme.spacing.xxxl,
    backgroundColor: mobileTheme.colors.white
  },
  sectionLabel: {
    ...mobileTheme.typography.tiny,
    color: mobileTheme.colors.slate400,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.55,
    paddingHorizontal: mobileTheme.spacing.lg,
    paddingTop: mobileTheme.spacing.lg,
    paddingBottom: mobileTheme.spacing.sm
  },
  card: {
    marginHorizontal: mobileTheme.spacing.lg,
    borderRadius: mobileTheme.radius.lg,
    borderWidth: 1,
    borderColor: mobileTheme.colors.slate200,
    backgroundColor: mobileTheme.colors.white,
    overflow: "hidden",
    ...mobileTheme.shadow.card
  },
  row: {
    minHeight: 52,
    paddingHorizontal: mobileTheme.spacing.lg,
    paddingVertical: mobileTheme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: mobileTheme.spacing.md
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: mobileTheme.colors.slate100 },
  rowCopy: { flex: 1 },
  rowTitle: { flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.md },
  rowLabel: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate900 },
  rowDescription: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500, marginTop: 2 },
  rowValue: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate500 },
  rowDanger: { color: mobileTheme.colors.red }
});
