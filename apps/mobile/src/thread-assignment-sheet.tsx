import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { AvatarBadge } from "./avatar-badge";
import { mobileTheme } from "./mobile-theme";
import type { DashboardTeamMember } from "./types";

type AssignmentStatus = "away" | "offline" | "online";

function assignmentStatus(member: DashboardTeamMember): AssignmentStatus {
  if (member.status === "online") return "online";
  return member.lastActiveLabel === "Never" ? "offline" : "away";
}

function matchesQuery(member: DashboardTeamMember, query: string) {
  if (!query) return true;
  const source = `${member.name} ${member.email}`.toLowerCase();
  return source.includes(query.toLowerCase().trim());
}

function orderMembers(members: DashboardTeamMember[]) {
  return [...members].sort((left, right) => left.name.localeCompare(right.name));
}

export function ThreadAssignmentSheet({
  assignedUserId,
  busy,
  teamMembers,
  visible,
  onAssign,
  onClose
}: {
  assignedUserId: string | null;
  busy: boolean;
  teamMembers: DashboardTeamMember[];
  visible: boolean;
  onAssign(userId: string | null): Promise<void>;
  onClose(): void;
}) {
  const [query, setQuery] = useState("");
  const currentUser = teamMembers.find((member) => member.isCurrentUser) ?? null;
  const filtered = useMemo(
    () => orderMembers(teamMembers.filter((member) => !member.isCurrentUser && matchesQuery(member, query))),
    [query, teamMembers]
  );
  const grouped = useMemo(
    () => ({
      online: filtered.filter((member) => assignmentStatus(member) === "online"),
      away: filtered.filter((member) => assignmentStatus(member) === "away"),
      offline: filtered.filter((member) => assignmentStatus(member) === "offline")
    }),
    [filtered]
  );
  const hasResults = Boolean(filtered.length || (currentUser && matchesQuery(currentUser, query)));
  const hasOtherMembers = teamMembers.some((member) => !member.isCurrentUser);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.backdrop}>
        <Pressable onPress={() => null} style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Assign to</Text>
          <View style={styles.searchWrap}>
            <Ionicons color={mobileTheme.colors.slate400} name="search-outline" size={18} />
            <TextInput placeholder="Search teammates..." placeholderTextColor={mobileTheme.colors.slate400} style={styles.search} value={query} onChangeText={setQuery} />
            {query ? (
              <Pressable onPress={() => setQuery("")} style={styles.clearButton}>
                <Ionicons color={mobileTheme.colors.slate400} name="close" size={18} />
              </Pressable>
            ) : null}
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            {currentUser && matchesQuery(currentUser, query) ? (
              <Pressable
                disabled={busy || assignedUserId === currentUser.id}
                onPress={() => void onAssign(currentUser.id)}
                style={[styles.selfAssign, assignedUserId === currentUser.id && styles.assignedSurface]}
              >
                <Text style={styles.selfAssignText}>Assign to me</Text>
                <Ionicons color={mobileTheme.colors.blueDark} name="arrow-forward" size={16} />
              </Pressable>
            ) : null}
            {!hasOtherMembers && !query ? (
              <View style={styles.emptyState}>
                <Ionicons color={mobileTheme.colors.slate400} name="people-outline" size={44} />
                <Text style={styles.emptyTitle}>No teammates yet</Text>
                <Text style={styles.emptyText}>Invite your team from the web dashboard to assign conversations.</Text>
              </View>
            ) : hasResults ? (
              <>
                {renderSection("Online", grouped.online, assignedUserId, busy, onAssign)}
                {renderSection("Away", grouped.away, assignedUserId, busy, onAssign)}
                {renderSection("Offline", grouped.offline, assignedUserId, busy, onAssign)}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons color={mobileTheme.colors.slate400} name="search-outline" size={40} />
                <Text style={styles.emptyTitle}>No teammates found</Text>
                <Text style={styles.emptyText}>Try a different name or email.</Text>
              </View>
            )}
            {assignedUserId ? (
              <Pressable disabled={busy} onPress={() => void onAssign(null)} style={styles.unassignButton}>
                <Ionicons color={mobileTheme.colors.slate600} name="close-circle-outline" size={18} />
                <Text style={styles.unassignText}>Unassign</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function renderSection(
  title: string,
  members: DashboardTeamMember[],
  assignedUserId: string | null,
  busy: boolean,
  onAssign: (userId: string | null) => Promise<void>
) {
  if (!members.length) return null;
  return (
    <View key={title}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {members.map((member) => {
        const selected = assignedUserId === member.id;
        const status = assignmentStatus(member);
        return (
          <Pressable
            key={member.id}
            accessibilityLabel={`Assign to ${member.name}, ${status}`}
            accessibilityRole="button"
            disabled={busy || selected}
            onPress={() => void onAssign(member.id)}
            style={[styles.memberRow, selected && styles.assignedSurface]}
          >
            <AvatarBadge imageUrl={member.avatarDataUrl} label={member.name} size={40} />
            <View style={styles.memberCopy}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberEmail}>{member.email}</Text>
              {selected ? <Text style={styles.assignedLabel}>Currently assigned</Text> : null}
            </View>
            {selected ? <Ionicons color={mobileTheme.colors.blue} name="checkmark" size={20} /> : <View style={[styles.statusDot, status === "online" ? styles.onlineDot : status === "away" ? styles.awayDot : styles.offlineDot]} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15, 23, 42, 0.24)" },
  sheet: { maxHeight: "86%", borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: mobileTheme.colors.white },
  handle: { alignSelf: "center", width: 36, height: 4, borderRadius: 2, backgroundColor: mobileTheme.colors.slate400, opacity: 0.4, marginTop: 8 },
  title: { ...mobileTheme.typography.heading, color: mobileTheme.colors.slate900, padding: mobileTheme.spacing.lg, borderBottomWidth: 1, borderBottomColor: mobileTheme.colors.slate200 },
  searchWrap: { height: 44, margin: mobileTheme.spacing.lg, marginBottom: mobileTheme.spacing.md, paddingHorizontal: 12, borderRadius: 10, backgroundColor: mobileTheme.colors.slate100, flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.sm },
  search: { flex: 1, ...mobileTheme.typography.body, color: mobileTheme.colors.slate900 },
  clearButton: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  content: { paddingBottom: mobileTheme.spacing.xl },
  selfAssign: { height: 48, marginHorizontal: mobileTheme.spacing.lg, marginBottom: mobileTheme.spacing.lg, paddingHorizontal: mobileTheme.spacing.lg, borderRadius: 10, backgroundColor: mobileTheme.colors.blue50, borderWidth: 1, borderColor: mobileTheme.colors.blueLight, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selfAssignText: { ...mobileTheme.typography.body, color: mobileTheme.colors.blueDark, fontWeight: "500" },
  sectionTitle: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate400, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.55, paddingHorizontal: mobileTheme.spacing.lg, paddingTop: mobileTheme.spacing.md, paddingBottom: mobileTheme.spacing.sm },
  memberRow: { minHeight: 64, paddingHorizontal: mobileTheme.spacing.lg, paddingVertical: mobileTheme.spacing.md, borderBottomWidth: 1, borderBottomColor: mobileTheme.colors.slate100, flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.md },
  memberCopy: { flex: 1 },
  memberName: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate900, fontWeight: "500" },
  memberEmail: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500, marginTop: 2 },
  assignedLabel: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.blue, fontWeight: "600", marginTop: 4 },
  assignedSurface: { backgroundColor: mobileTheme.colors.blue50 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  onlineDot: { backgroundColor: mobileTheme.colors.green },
  awayDot: { backgroundColor: mobileTheme.colors.amber },
  offlineDot: { borderWidth: 1.5, borderColor: mobileTheme.colors.slate400, backgroundColor: "transparent" },
  unassignButton: { height: 48, margin: mobileTheme.spacing.lg, marginTop: mobileTheme.spacing.xl, borderRadius: 10, backgroundColor: mobileTheme.colors.slate100, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: mobileTheme.spacing.sm },
  unassignText: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate700, fontWeight: "500" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingHorizontal: mobileTheme.spacing.xxxl, paddingVertical: mobileTheme.spacing.xxxl, gap: mobileTheme.spacing.sm },
  emptyTitle: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate700, fontWeight: "500" },
  emptyText: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate400, textAlign: "center" }
});
