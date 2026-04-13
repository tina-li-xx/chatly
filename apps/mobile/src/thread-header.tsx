import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AvatarBadge } from "./avatar-badge";
import { mobileTheme } from "./mobile-theme";

type ThreadHeaderProps = {
  assigneeAvatarUrl: string | null;
  assigneeLabel: string;
  assigneeName: string | null;
  hasAssignee: boolean;
  busy: boolean;
  isResolved: boolean;
  subtitle: string;
  title: string;
  onBack(): void;
  onOpenAssignment(): void;
  onOpenInfo(): void;
  onOpenActions(): void;
};

export function ThreadHeader({
  assigneeAvatarUrl,
  assigneeLabel,
  assigneeName,
  hasAssignee,
  busy,
  isResolved,
  subtitle,
  title,
  onBack,
  onOpenAssignment,
  onOpenInfo,
  onOpenActions,
}: ThreadHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <Pressable style={styles.iconButton} onPress={onBack}>
          <Ionicons color={mobileTheme.colors.slate600} name="chevron-back" size={24} />
        </Pressable>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.title}>{title}</Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
            {isResolved ? " • Resolved" : ""}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton} onPress={onOpenInfo}>
            <Ionicons color={mobileTheme.colors.slate600} name="information-circle-outline" size={20} />
          </Pressable>
          <Pressable style={styles.iconButton} disabled={busy} onPress={onOpenActions}>
            <Ionicons color={mobileTheme.colors.slate600} name="ellipsis-horizontal" size={20} />
          </Pressable>
        </View>
      </View>
      <Pressable onPress={onOpenAssignment} style={styles.assignmentRow}>
        {hasAssignee ? (
          <AvatarBadge imageUrl={assigneeAvatarUrl} label={assigneeName || assigneeLabel} size={24} />
        ) : (
          <Ionicons color={mobileTheme.colors.blue} name="add" size={16} />
        )}
        <Text style={[styles.assignmentText, !hasAssignee && styles.assignmentTextActive]}>
          {hasAssignee ? assigneeLabel : "Assign"}
        </Text>
        <Ionicons color={mobileTheme.colors.slate400} name="chevron-down" size={12} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: mobileTheme.spacing.sm, paddingHorizontal: mobileTheme.spacing.lg, paddingBottom: mobileTheme.spacing.sm, backgroundColor: mobileTheme.colors.white, borderBottomWidth: 1, borderBottomColor: mobileTheme.colors.slate200 },
  topRow: { height: 56, flexDirection: "row", alignItems: "center" },
  copy: { flex: 1, alignItems: "center", paddingHorizontal: mobileTheme.spacing.sm },
  title: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate900, fontWeight: "500" },
  subtitle: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate500 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: mobileTheme.radius.md },
  assignmentRow: {
    alignSelf: "center",
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: mobileTheme.spacing.sm,
    paddingHorizontal: mobileTheme.spacing.md,
    borderRadius: mobileTheme.radius.full,
    backgroundColor: mobileTheme.colors.slate50
  },
  assignmentText: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate500, fontWeight: "500" },
  assignmentTextActive: { color: mobileTheme.colors.blue }
});
