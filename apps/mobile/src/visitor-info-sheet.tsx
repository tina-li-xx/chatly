import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AvatarBadge } from "./avatar-badge";
import {
  browserLabel,
  compactPageLabel,
  conversationLocation,
  formatCountLabel,
  formatRelativeTime,
  referrerLabel
} from "./formatting";
import { mobileTheme } from "./mobile-theme";
import type { ConversationThread } from "./types";

type VisitorInfoSheetProps = {
  conversation: ConversationThread | null;
  visible: boolean;
  onClose(): void;
};

export function VisitorInfoSheet({
  conversation,
  visible,
  onClose
}: VisitorInfoSheetProps) {
  if (!conversation) {
    return null;
  }

  const stats = conversation.visitorActivity;
  const currentPage = compactPageLabel(conversation.recordedPageUrl ?? conversation.pageUrl);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => null}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.identity}>
              <AvatarBadge label={conversation.email || conversation.siteName} size={48} />
              <Text style={styles.name}>{conversation.email || conversation.siteName}</Text>
              <Text style={styles.detail}>{conversationLocation(conversation) || "Unknown location"}</Text>
              <Text style={styles.detail}>{conversation.email || conversation.siteName}</Text>
            </View>

            <Section title="Current session">
              <InfoRow label="Current page" value={currentPage || "Unknown"} />
              <InfoRow label="Referrer" value={referrerLabel(conversation.referrer)} />
              <InfoRow label="Browser" value={browserLabel(conversation.userAgent)} />
              <InfoRow label="Timezone" value={conversation.timezone || "Unknown"} />
            </Section>

            <Section title="Visit stats">
              <StatCard label="Conversations" value={String((stats?.otherConversationsTotal ?? 0) + 1)} />
              <StatCard label="Other questions" value={String(stats?.otherQuestionsLastMonth ?? 0)} />
              <StatCard label="Last seen" value={formatRelativeTime(stats?.lastSeenAt ?? conversation.updatedAt)} />
            </Section>

            <Section title="Tags">
              <View style={styles.tagWrap}>
                {conversation.tags.length ? conversation.tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                )) : (
                  <Text style={styles.emptyText}>No tags yet.</Text>
                )}
              </View>
              {stats ? (
                <Text style={styles.helper}>
                  {formatCountLabel(stats.otherConversationsLastMonth, "conversation")} in the last month via {stats.matchType === "email" ? "email" : "session"}.
                </Text>
              ) : null}
            </Section>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.24)" },
  sheet: {
    maxHeight: "82%",
    borderTopLeftRadius: mobileTheme.radius.xl,
    borderTopRightRadius: mobileTheme.radius.xl,
    backgroundColor: mobileTheme.colors.white,
    ...mobileTheme.shadow.sheet
  },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 999, backgroundColor: mobileTheme.colors.slate200, marginTop: 12 },
  content: { gap: mobileTheme.spacing.xl, padding: mobileTheme.spacing.xl, paddingBottom: mobileTheme.spacing.xxxl },
  identity: { alignItems: "center", gap: mobileTheme.spacing.sm },
  name: { ...mobileTheme.typography.heading, color: mobileTheme.colors.slate900 },
  detail: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500 },
  section: { gap: mobileTheme.spacing.md },
  sectionTitle: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500, fontWeight: "600", textTransform: "uppercase" },
  infoRow: { gap: mobileTheme.spacing.xs },
  infoLabel: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate400, textTransform: "uppercase" },
  infoValue: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate700 },
  statCard: {
    padding: mobileTheme.spacing.lg,
    borderRadius: mobileTheme.radius.lg,
    backgroundColor: mobileTheme.colors.slate50,
    borderWidth: 1,
    borderColor: mobileTheme.colors.slate200
  },
  statValue: { ...mobileTheme.typography.heading, color: mobileTheme.colors.slate900 },
  statLabel: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500 },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: mobileTheme.spacing.sm },
  tagChip: {
    paddingHorizontal: mobileTheme.spacing.md,
    paddingVertical: 6,
    borderRadius: mobileTheme.radius.full,
    backgroundColor: mobileTheme.colors.blue50
  },
  tagText: { ...mobileTheme.typography.small, color: mobileTheme.colors.blue, fontWeight: "500" },
  helper: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500 },
  emptyText: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate400 }
});
