import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { mobileTheme } from "./mobile-theme";
import type { ReplyAttachmentDraft } from "./types";

type ReplyAttachmentStripProps = {
  attachments: ReplyAttachmentDraft[];
  onRemove(id: string): void;
};

export function ReplyAttachmentStrip({
  attachments,
  onRemove
}: ReplyAttachmentStripProps) {
  if (!attachments.length) {
    return null;
  }

  return (
    <View style={styles.list}>
      {attachments.map((attachment) => (
        <View key={attachment.id} style={styles.card}>
          <Image source={{ uri: attachment.previewUri }} style={styles.image} />
          <Text numberOfLines={1} style={styles.name}>{attachment.fileName}</Text>
          <Pressable style={styles.removeButton} onPress={() => onRemove(attachment.id)}>
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  card: { width: 92, padding: 8, borderRadius: mobileTheme.radius.lg, backgroundColor: mobileTheme.colors.slate50, borderWidth: 1, borderColor: mobileTheme.colors.slate200 },
  image: { width: "100%", height: 64, borderRadius: mobileTheme.radius.md, marginBottom: 8 },
  name: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate700, marginBottom: 8 },
  removeButton: { paddingVertical: 6, borderRadius: 999, backgroundColor: mobileTheme.colors.slate100 },
  removeText: { textAlign: "center", fontSize: 11, fontWeight: "600", color: mobileTheme.colors.slate700 }
});
