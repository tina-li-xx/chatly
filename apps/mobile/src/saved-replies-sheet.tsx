import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { mobileTheme } from "./mobile-theme";
import type { DashboardSavedReply } from "./types";

type SavedRepliesSheetProps = {
  replies: DashboardSavedReply[];
  visible: boolean;
  onClose(): void;
  onPick(reply: DashboardSavedReply): void;
};

export function SavedRepliesSheet({
  replies,
  visible,
  onClose,
  onPick
}: SavedRepliesSheetProps) {
  const [query, setQuery] = useState("");
  const visibleReplies = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return replies;
    }

    return replies.filter((reply) =>
      `${reply.title} ${reply.body} ${reply.tags.join(" ")}`.toLowerCase().includes(needle)
    );
  }, [query, replies]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => null}>
          <View style={styles.handle} />
          <Text style={styles.title}>Saved replies</Text>
          <TextInput
            placeholder="Search replies"
            placeholderTextColor={mobileTheme.colors.slate400}
            style={styles.search}
            value={query}
            onChangeText={setQuery}
          />
          <ScrollView contentContainerStyle={styles.list}>
            {visibleReplies.length ? visibleReplies.map((reply) => (
              <Pressable key={reply.id} style={styles.card} onPress={() => onPick(reply)}>
                <Text style={styles.shortcut}>/{reply.title.toLowerCase().replace(/\s+/g, "-")}</Text>
                <Text numberOfLines={3} style={styles.body}>{reply.body}</Text>
                <Text style={styles.tags}>{reply.tags.length ? reply.tags.join(" • ") : "Tap to insert"}</Text>
              </Pressable>
            )) : <Text style={styles.empty}>No saved replies yet.</Text>}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15, 23, 42, 0.24)" },
  sheet: { maxHeight: "56%", padding: 20, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: "#FFFFFF" },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 999, backgroundColor: mobileTheme.colors.slate200, marginBottom: 16 },
  title: { ...mobileTheme.typography.heading, color: mobileTheme.colors.slate900, marginBottom: 12 },
  search: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: mobileTheme.radius.md,
    borderWidth: 1,
    borderColor: mobileTheme.colors.slate200,
    backgroundColor: mobileTheme.colors.white,
    marginBottom: 12,
    ...mobileTheme.typography.body,
    color: mobileTheme.colors.slate900
  },
  list: { gap: 0, paddingBottom: 12 },
  card: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: mobileTheme.colors.slate100 },
  shortcut: { ...mobileTheme.typography.small, color: mobileTheme.colors.blue, fontWeight: "500", marginBottom: 6 },
  body: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate700 },
  tags: { marginTop: 8, ...mobileTheme.typography.small, color: mobileTheme.colors.slate500 },
  empty: { paddingVertical: 24, textAlign: "center", color: mobileTheme.colors.slate500 }
});
