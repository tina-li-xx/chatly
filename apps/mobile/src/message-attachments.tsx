import { Image, StyleSheet, Text, View } from "react-native";
import { mobileTheme } from "./mobile-theme";
import { sanitizeBaseUrl } from "./formatting";
import type { MessageAttachment } from "./types";

type MessageAttachmentsProps = {
  attachments: MessageAttachment[];
  baseUrl: string;
  token: string;
  tone: "light" | "dark";
};

export function MessageAttachments({
  attachments,
  baseUrl,
  token,
  tone
}: MessageAttachmentsProps) {
  if (!attachments.length) {
    return null;
  }

  return (
    <View style={styles.list}>
      {attachments.map((attachment) => (
        <View key={attachment.id} style={styles.card}>
          {attachment.isImage ? (
            <Image
              resizeMode="cover"
              source={{
                uri: `${sanitizeBaseUrl(baseUrl)}${attachment.url}`,
                headers: { Authorization: `Bearer ${token}` }
              }}
              style={styles.image}
            />
          ) : null}
          <Text numberOfLines={2} style={[styles.name, tone === "light" ? styles.lightName : styles.darkName]}>
            {attachment.fileName}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  card: { width: 144, padding: 8, borderRadius: mobileTheme.radius.lg, backgroundColor: "rgba(255,255,255,0.14)" },
  image: { width: "100%", height: 112, borderRadius: mobileTheme.radius.md, marginBottom: 8, backgroundColor: mobileTheme.colors.slate200 },
  name: { ...mobileTheme.typography.tiny },
  lightName: { color: mobileTheme.colors.slate700 },
  darkName: { color: mobileTheme.colors.blue50 }
});
