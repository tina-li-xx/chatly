import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { mobileTheme } from "./mobile-theme";
import { ReplyAttachmentStrip } from "./reply-attachment-strip";
import type { ReplyAttachmentDraft } from "./types";

type ThreadComposerProps = {
  attachments: ReplyAttachmentDraft[];
  busy: boolean;
  draft: string;
  typingLabel: string | null;
  onAttachCamera(): void;
  onAttachLibrary(): void;
  onChangeDraft(value: string): void;
  onOpenSavedReplies(): void;
  onRemoveAttachment(id: string): void;
  onSend(): void;
};

export function ThreadComposer({
  attachments,
  busy,
  draft,
  typingLabel,
  onAttachCamera,
  onAttachLibrary,
  onChangeDraft,
  onOpenSavedReplies,
  onRemoveAttachment,
  onSend
}: ThreadComposerProps) {
  return (
    <View style={styles.composer}>
      {typingLabel ? <Text style={styles.typingLabel}>{typingLabel}</Text> : null}
      <ReplyAttachmentStrip attachments={attachments} onRemove={onRemoveAttachment} />
      <View style={styles.toolbar}>
        <Pressable style={styles.toolButton} onPress={onOpenSavedReplies}>
          <Text style={styles.toolText}>Saved</Text>
        </Pressable>
        <Pressable style={styles.toolButton} onPress={onAttachLibrary}>
          <Text style={styles.toolText}>Photos</Text>
        </Pressable>
        <Pressable style={styles.toolButton} onPress={onAttachCamera}>
          <Text style={styles.toolText}>Camera</Text>
        </Pressable>
      </View>
      <TextInput
        multiline
        placeholder="Type your reply"
        placeholderTextColor="#64748B"
        style={styles.input}
        value={draft}
        onChangeText={onChangeDraft}
      />
      <Pressable
        style={[
          styles.sendButton,
          (!draft.trim() && !attachments.length || busy) && styles.sendButtonDisabled
        ]}
        disabled={busy || (!draft.trim() && !attachments.length)}
        onPress={onSend}
      >
        {busy ? <ActivityIndicator color={mobileTheme.colors.white} /> : <Text style={styles.sendButtonText}>Send</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  composer: {
    paddingHorizontal: mobileTheme.spacing.lg,
    paddingTop: mobileTheme.spacing.sm,
    paddingBottom: mobileTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: mobileTheme.colors.slate200,
    backgroundColor: mobileTheme.colors.white
  },
  typingLabel: { marginBottom: mobileTheme.spacing.sm, ...mobileTheme.typography.small, color: mobileTheme.colors.slate500 },
  toolbar: { flexDirection: "row", gap: mobileTheme.spacing.sm, marginBottom: mobileTheme.spacing.sm },
  toolButton: {
    minHeight: 36,
    paddingHorizontal: mobileTheme.spacing.md,
    justifyContent: "center",
    borderRadius: mobileTheme.radius.full,
    backgroundColor: mobileTheme.colors.slate100
  },
  toolText: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate700, fontWeight: "600" },
  input: {
    minHeight: 56,
    maxHeight: 120,
    paddingHorizontal: mobileTheme.spacing.lg,
    paddingVertical: 14,
    borderRadius: mobileTheme.radius.md,
    borderWidth: 1,
    borderColor: mobileTheme.colors.slate200,
    backgroundColor: mobileTheme.colors.white,
    ...mobileTheme.typography.body,
    color: mobileTheme.colors.slate900,
    marginBottom: mobileTheme.spacing.md
  },
  sendButton: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: mobileTheme.radius.md,
    backgroundColor: mobileTheme.colors.blue
  },
  sendButtonDisabled: { backgroundColor: mobileTheme.colors.slate200 },
  sendButtonText: { ...mobileTheme.typography.body, color: mobileTheme.colors.white, fontWeight: "600" }
});
