import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { mobileTheme } from "./mobile-theme";

type ThreadQuickActionsSheetProps = {
  assigneeLabel: string;
  busy: boolean;
  isResolved: boolean;
  tags: string[];
  visible: boolean;
  onAddTag(tag: string): Promise<void>;
  onClose(): void;
  onOpenAssignment(): void;
  onToggleStatus(): Promise<void>;
  onToggleTag(tag: string): Promise<void>;
};

export function ThreadQuickActionsSheet({
  assigneeLabel,
  busy,
  isResolved,
  tags,
  visible,
  onAddTag,
  onClose,
  onOpenAssignment,
  onToggleStatus,
  onToggleTag
}: ThreadQuickActionsSheetProps) {
  const [tagDraft, setTagDraft] = useState("");
  const statusAction = isResolved
    ? { icon: "↺", label: "Reopen" }
    : { icon: "✓", label: "Mark resolved" };

  async function handleAddTag() {
    if (!tagDraft.trim()) {
      return;
    }

    await onAddTag(tagDraft.trim());
    setTagDraft("");
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => null}>
          <View style={styles.handle} />
          <Text style={styles.title}>Quick actions</Text>
          <Pressable style={styles.actionRow} disabled={busy} onPress={() => void onToggleStatus()}>
            <Text style={styles.actionIcon}>{statusAction.icon}</Text>
            <Text style={styles.actionLabel}>{statusAction.label}</Text>
          </Pressable>
          <Pressable style={styles.actionRow} disabled={busy} onPress={onOpenAssignment}>
            <Ionicons color={mobileTheme.colors.slate600} name="person-add-outline" size={18} />
            <View style={styles.actionCopy}>
              <Text style={styles.actionLabel}>Assign to...</Text>
              <Text style={styles.actionHint}>{assigneeLabel}</Text>
            </View>
            <Ionicons color={mobileTheme.colors.slate400} name="chevron-forward" size={16} />
          </Pressable>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagRow}>
            <TextInput
              placeholder="Add tag"
              placeholderTextColor="#64748B"
              style={styles.input}
              value={tagDraft}
              onChangeText={setTagDraft}
            />
            <Pressable style={styles.addButton} disabled={busy} onPress={() => void handleAddTag()}>
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>
          <View style={styles.tagList}>
            {tags.length ? tags.map((tag) => (
              <Pressable key={tag} style={styles.tagChip} disabled={busy} onPress={() => void onToggleTag(tag)}>
                <Text style={styles.tagText}>{tag}</Text>
              </Pressable>
            )) : <Text style={styles.empty}>No tags yet.</Text>}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15, 23, 42, 0.24)" },
  sheet: { padding: 20, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: "#FFFFFF" },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 999, backgroundColor: mobileTheme.colors.slate200, marginBottom: 16 },
  title: { ...mobileTheme.typography.heading, color: mobileTheme.colors.slate900, marginBottom: 16 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 14, height: 56, marginBottom: 12, paddingHorizontal: 4 },
  actionIcon: { width: 20, fontSize: 18, textAlign: "center", color: mobileTheme.colors.slate600 },
  actionCopy: { flex: 1 },
  actionLabel: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate900 },
  actionHint: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate500, marginTop: 2 },
  sectionTitle: { ...mobileTheme.typography.small, fontWeight: "600", textTransform: "uppercase", color: mobileTheme.colors.slate500, marginBottom: 10 },
  tagRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: { flex: 1, minHeight: 44, paddingHorizontal: 16, borderRadius: mobileTheme.radius.md, borderWidth: 1, borderColor: mobileTheme.colors.slate200, color: mobileTheme.colors.slate900, backgroundColor: "#FFFFFF" },
  addButton: { height: 44, paddingHorizontal: 16, justifyContent: "center", borderRadius: mobileTheme.radius.md, backgroundColor: mobileTheme.colors.blue },
  addButtonText: { ...mobileTheme.typography.small, fontWeight: "600", color: mobileTheme.colors.white },
  tagList: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  tagChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: mobileTheme.colors.blue50 },
  tagText: { ...mobileTheme.typography.small, fontWeight: "500", color: mobileTheme.colors.blueDark },
  empty: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500 }
});
