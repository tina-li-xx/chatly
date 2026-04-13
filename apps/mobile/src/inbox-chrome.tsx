import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AvatarBadge } from "./avatar-badge";
import { mobileTheme, presenceColor } from "./mobile-theme";
import type { MobileAvailability, SessionUser } from "./types";

export type InboxFilter = "all" | "open" | "mine" | "resolved";

type InboxChromeProps = {
  availability: MobileAvailability;
  availabilityBusy?: boolean;
  filter: InboxFilter;
  profileAvatarUrl?: string | null;
  profileLabel: string;
  workspaceRole: SessionUser["workspaceRole"];
  unreadCount: number;
  onChangeFilter(next: InboxFilter): void;
  onOpenAccount(): void;
  onToggleAvailability(): void;
};

function tabsForRole(role: SessionUser["workspaceRole"]) {
  if (role === "member") {
    return [
      { value: "open" as const, label: "Open" },
      { value: "resolved" as const, label: "Resolved" }
    ];
  }

  return [
    { value: "all" as const, label: "All" },
    { value: "open" as const, label: "Open" },
    { value: "mine" as const, label: "Mine" }
  ];
}

export function InboxChrome({
  availability,
  availabilityBusy = false,
  filter,
  profileAvatarUrl,
  profileLabel,
  workspaceRole,
  unreadCount,
  onChangeFilter,
  onOpenAccount,
  onToggleAvailability
}: InboxChromeProps) {
  const availabilityLabel = availability === "online" ? "Online" : "Offline";
  const tabs = tabsForRole(workspaceRole);

  return (
    <>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Inbox</Text>
          {unreadCount ? (
            <View style={styles.titleBadge}>
              <Text style={styles.titleBadgeText}>{unreadCount}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.headerActions}>
          <Pressable
            disabled={availabilityBusy}
            onPress={onToggleAvailability}
            style={({ pressed }) => [
              styles.availabilityButton,
              pressed && styles.availabilityButtonPressed,
              availabilityBusy && styles.availabilityButtonDisabled
            ]}
          >
            <View
              style={[styles.presenceDot, { backgroundColor: presenceColor(availability) }]}
            />
            <Text style={styles.availabilityButtonText}>{availabilityLabel}</Text>
            <Ionicons color={mobileTheme.colors.slate400} name="chevron-down" size={14} />
          </Pressable>
          <Pressable
            onPress={onOpenAccount}
            style={({ pressed }) => [styles.profileButton, pressed && styles.profileButtonPressed]}
          >
            <AvatarBadge imageUrl={profileAvatarUrl} label={profileLabel} size={32} />
          </Pressable>
        </View>
      </View>
      <View style={styles.filters}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.value}
            style={[styles.filterChip, filter === tab.value && styles.filterChipActive]}
            onPress={() => onChangeFilter(tab.value)}
          >
            <Text style={[styles.filterText, filter === tab.value && styles.filterTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: mobileTheme.spacing.lg,
    marginBottom: mobileTheme.spacing.md,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.sm },
  title: { ...mobileTheme.typography.heading, color: mobileTheme.colors.slate900 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.sm },
  titleBadge: {
    minWidth: 18,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: mobileTheme.radius.full,
    backgroundColor: mobileTheme.colors.red,
  },
  titleBadgeText: {
    ...mobileTheme.typography.tiny,
    color: mobileTheme.colors.white,
    fontWeight: "600",
    textAlign: "center",
  },
  availabilityButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: mobileTheme.spacing.sm,
    paddingHorizontal: 12,
    borderRadius: mobileTheme.radius.full,
    backgroundColor: mobileTheme.colors.white,
    borderWidth: 1,
    borderColor: mobileTheme.colors.slate200,
    ...mobileTheme.shadow.card,
  },
  availabilityButtonPressed: { backgroundColor: mobileTheme.colors.slate50 },
  availabilityButtonDisabled: { opacity: 0.55 },
  presenceDot: { width: 8, height: 8, borderRadius: 4 },
  availabilityButtonText: {
    ...mobileTheme.typography.small,
    color: mobileTheme.colors.slate700,
    fontWeight: "600",
  },
  profileButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  profileButtonPressed: { opacity: 0.8 },
  filters: {
    flexDirection: "row",
    paddingHorizontal: mobileTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: mobileTheme.colors.slate200,
    backgroundColor: mobileTheme.colors.white,
  },
  filterChip: {
    paddingVertical: 12,
    marginRight: mobileTheme.spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  filterChipActive: { borderBottomColor: mobileTheme.colors.blue },
  filterText: {
    ...mobileTheme.typography.small,
    color: mobileTheme.colors.slate500,
    fontWeight: "500",
  },
  filterTextActive: { color: mobileTheme.colors.blue, fontWeight: "600" },
});
