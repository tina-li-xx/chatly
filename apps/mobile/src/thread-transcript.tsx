import { ScrollView, StyleSheet, Text, View } from "react-native";
import { compactPageLabel, conversationLocation, formatClockTime } from "./formatting";
import { MessageAttachments } from "./message-attachments";
import { mobileTheme } from "./mobile-theme";
import type { ConversationThread } from "./types";

type ThreadTranscriptProps = {
  assigneeLabel: string;
  baseUrl: string;
  thread: ConversationThread;
  token: string;
};

export function ThreadTranscript({
  assigneeLabel,
  baseUrl,
  thread,
  token
}: ThreadTranscriptProps) {
  const groups = groupMessages(thread.messages);
  const location = conversationLocation(thread);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.metaLabel}>{compactPageLabel(thread.recordedPageUrl ?? thread.pageUrl) || "Current session"}</Text>
        {location ? <Text style={styles.meta}>{location}</Text> : null}
        <Text style={styles.meta}>{assigneeLabel}</Text>
        <View style={styles.tagRow}>
          {thread.tags.length ? thread.tags.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          )) : (
            <Text style={styles.meta}>No tags yet</Text>
          )}
        </View>
      </View>
      {groups.map((group) =>
        typeof group === "string" ? (
          <View key={group} style={styles.dayDivider}>
            <Text style={styles.dayDividerText}>{group}</Text>
          </View>
        ) : (
          <View key={group.id} style={[styles.bubble, group.sender === "team" ? styles.teamBubble : styles.userBubble]}>
            {group.content ? <Text style={[styles.bubbleText, group.sender === "team" && styles.teamBubbleText]}>{group.content}</Text> : null}
            <MessageAttachments attachments={group.attachments} baseUrl={baseUrl} token={token} tone={group.sender === "team" ? "dark" : "light"} />
            <Text style={[styles.messageMeta, group.sender === "team" && styles.teamMessageMeta]}>{formatClockTime(group.createdAt)}</Text>
          </View>
        )
      )}
    </ScrollView>
  );
}

function groupMessages(messages: ConversationThread["messages"]) {
  const groups: Array<string | ConversationThread["messages"][number]> = [];
  let previousDay = "";

  for (const message of messages) {
    const date = new Date(message.createdAt);
    const day = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    if (day !== previousDay) {
      previousDay = day;
      groups.push(
        date.toLocaleDateString("en-GB", {
          month: "long",
          day: "numeric"
        })
      );
    }

    groups.push(message);
  }

  return groups;
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: mobileTheme.spacing.lg, gap: mobileTheme.spacing.md, paddingBottom: mobileTheme.spacing.xxl },
  hero: {
    gap: mobileTheme.spacing.xs,
    padding: mobileTheme.spacing.lg,
    borderRadius: mobileTheme.radius.lg,
    backgroundColor: mobileTheme.colors.white,
    borderWidth: 1,
    borderColor: mobileTheme.colors.slate200
  },
  metaLabel: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.blue, textTransform: "uppercase", fontWeight: "600" },
  meta: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: mobileTheme.spacing.sm, marginTop: mobileTheme.spacing.sm },
  tagChip: { paddingHorizontal: mobileTheme.spacing.md, paddingVertical: 6, borderRadius: mobileTheme.radius.full, backgroundColor: mobileTheme.colors.blue50 },
  tagText: { ...mobileTheme.typography.small, color: mobileTheme.colors.blue, fontWeight: "500" },
  dayDivider: { alignItems: "center", marginVertical: mobileTheme.spacing.sm },
  dayDividerText: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate400, textTransform: "uppercase" },
  bubble: { maxWidth: "75%", paddingHorizontal: mobileTheme.spacing.lg, paddingVertical: mobileTheme.spacing.md },
  userBubble: { alignSelf: "flex-start", backgroundColor: mobileTheme.colors.visitorBubble, borderRadius: 12, borderBottomLeftRadius: 4 },
  teamBubble: { alignSelf: "flex-end", backgroundColor: mobileTheme.colors.teamBubble, borderRadius: 12, borderBottomRightRadius: 4 },
  bubbleText: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate900 },
  teamBubbleText: { color: mobileTheme.colors.white },
  messageMeta: { marginTop: mobileTheme.spacing.sm, ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate400 },
  teamMessageMeta: { color: "#BFDBFE", textAlign: "right" }
});
