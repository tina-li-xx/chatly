import { Pressable, StyleSheet, Text, View } from "react-native";
import { AvatarBadge } from "./avatar-badge";
import {
  compactPageLabel,
  conversationLabel,
  conversationLocation,
  formatRelativeTime
} from "./formatting";
import { mobileTheme } from "./mobile-theme";
import type { ConversationSummary } from "./types";

type InboxConversationCardProps = {
  connectionState: "connecting" | "connected" | "reconnecting";
  conversation: ConversationSummary;
  isTyping: boolean;
  onPress(): void;
};

export function InboxConversationCard({
  connectionState,
  conversation,
  isTyping,
  onPress
}: InboxConversationCardProps) {
  const unread = conversation.unreadCount > 0;
  const meta = compactPageLabel(conversation.recordedPageUrl ?? conversation.pageUrl)
    || conversationLocation(conversation)
    || conversation.siteName;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <AvatarBadge
        label={conversationLabel(conversation)}
        size={conversation.status === "resolved" ? 32 : 40}
      />
      <View style={styles.copy}>
        <View style={styles.row}>
          <Text numberOfLines={1} style={[styles.cardTitle, unread && styles.unreadTitle]}>
            {conversationLabel(conversation)}
          </Text>
          <Text style={styles.cardMeta}>{formatRelativeTime(conversation.lastMessageAt ?? conversation.updatedAt)}</Text>
        </View>
        <View style={styles.previewRow}>
          {conversation.status === "resolved" ? (
            <View style={styles.resolvedMark}>
              <Text style={styles.resolvedMarkText}>✓</Text>
            </View>
          ) : unread ? (
            <View style={styles.unreadDot} />
          ) : null}
          <Text numberOfLines={1} style={[styles.preview, unread && styles.unreadPreview, isTyping && styles.typingPreview]}>
            {isTyping
              ? "Someone is replying..."
              : connectionState === "reconnecting"
                ? "Reconnecting live updates..."
                : conversation.lastMessagePreview || "No messages yet"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text numberOfLines={1} style={styles.smallMeta}>{meta}</Text>
          {conversation.unreadCount ? <Text style={styles.badge}>{conversation.unreadCount}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    flexDirection: "row",
    gap: mobileTheme.spacing.md,
    alignItems: "center",
    paddingHorizontal: mobileTheme.spacing.lg,
    paddingVertical: mobileTheme.spacing.md,
    backgroundColor: mobileTheme.colors.white
  },
  copy: { flex: 1, gap: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: mobileTheme.spacing.sm },
  cardTitle: { flex: 1, ...mobileTheme.typography.body, color: mobileTheme.colors.slate900, fontWeight: "500" },
  unreadTitle: { fontWeight: "600" },
  cardMeta: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate400 },
  previewRow: { flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.sm, marginTop: 2, marginBottom: 2 },
  preview: { flex: 1, ...mobileTheme.typography.small, color: mobileTheme.colors.slate500 },
  unreadPreview: { color: mobileTheme.colors.slate700 },
  typingPreview: { color: mobileTheme.colors.blue, fontWeight: "500" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: mobileTheme.colors.blue },
  resolvedMark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: mobileTheme.colors.green,
    alignItems: "center",
    justifyContent: "center"
  },
  resolvedMarkText: { color: mobileTheme.colors.white, fontSize: 11, fontWeight: "600" },
  smallMeta: { flex: 1, ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate400 },
  badge: {
    minWidth: 18,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: mobileTheme.radius.full,
    overflow: "hidden",
    backgroundColor: mobileTheme.colors.red,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    color: mobileTheme.colors.white
  }
});
