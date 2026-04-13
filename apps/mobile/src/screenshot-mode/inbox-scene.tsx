import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { AvatarBadge } from "../avatar-badge";
import { compactPageLabel, formatRelativeTime } from "../formatting";
import { mobileTheme } from "../mobile-theme";
import type { ConversationSummary, MobileProfile } from "../types";

export function ScreenshotInboxScene({
  conversations,
  profile
}: {
  conversations: ConversationSummary[];
  profile: MobileProfile;
}) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
        <View style={styles.actions}>
          <View style={styles.statusButton}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>Online</Text>
            <Text style={styles.statusChevron}>⌄</Text>
          </View>
          <AvatarBadge label={`${profile.firstName} ${profile.lastName}`} size={32} />
        </View>
      </View>
      <View style={styles.tabs}>
        <Text style={[styles.tab, styles.tabActive]}>All</Text>
        <Text style={styles.tab}>Open</Text>
        <Text style={styles.tab}>Mine</Text>
      </View>
      {conversations.map((item) => (
        <View key={item.id} style={styles.row}>
          <AvatarBadge label={item.email || item.siteName} size={40} />
          <View style={styles.copy}>
            <View style={styles.topRow}>
              <Text numberOfLines={1} style={[styles.name, item.unreadCount > 0 && styles.nameUnread]}>
                {item.email}
              </Text>
              <Text style={styles.time}>{formatRelativeTime(item.lastMessageAt ?? item.updatedAt)}</Text>
            </View>
            <View style={styles.previewRow}>
              {item.unreadCount > 0 ? <View style={styles.unreadDot} /> : null}
              <Text numberOfLines={1} style={styles.preview}>{item.lastMessagePreview}</Text>
            </View>
            <Text style={styles.meta}>
              {compactPageLabel(item.pageUrl)} {item.city ? `· ${item.city}` : ""}
            </Text>
          </View>
        </View>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: mobileTheme.colors.white, paddingTop: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 8 },
  title: { ...mobileTheme.typography.title, color: mobileTheme.colors.slate900, fontWeight: "700" },
  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusButton: { minHeight: 38, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: mobileTheme.colors.white, borderWidth: 1, borderColor: mobileTheme.colors.slate200, ...mobileTheme.shadow.card },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: mobileTheme.colors.green },
  statusText: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate700, fontWeight: "600" },
  statusChevron: { color: mobileTheme.colors.slate400, fontSize: 12, marginTop: -1 },
  tabs: { flexDirection: "row", gap: 22, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: mobileTheme.colors.slate200 },
  tab: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500, fontWeight: "500" },
  tabActive: { color: mobileTheme.colors.blue, fontWeight: "700" },
  row: { minHeight: 84, flexDirection: "row", gap: 12, alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: mobileTheme.colors.slate100, backgroundColor: mobileTheme.colors.white },
  copy: { flex: 1 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  name: { flex: 1, ...mobileTheme.typography.body, color: mobileTheme.colors.slate900, fontWeight: "500" },
  nameUnread: { fontWeight: "700" },
  time: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate400 },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: mobileTheme.colors.blue },
  preview: { flex: 1, ...mobileTheme.typography.small, color: mobileTheme.colors.slate700 },
  meta: { marginTop: 2, ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate400 }
});
