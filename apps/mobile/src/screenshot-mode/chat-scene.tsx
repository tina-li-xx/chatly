import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { ThreadAssignmentSheet } from "../thread-assignment-sheet";
import { mobileTheme } from "../mobile-theme";
import type { DashboardTeamMember } from "../types";
import { screenshotChat } from "./mock-data";

function Bubble({ align = "left", text, time, seen }: { align?: "left" | "right"; text: string; time: string; seen?: string }) {
  const team = align === "right";
  return (
    <View style={[styles.bubbleWrap, team ? styles.bubbleWrapRight : styles.bubbleWrapLeft]}>
      <View style={[styles.bubble, team ? styles.teamBubble : styles.visitorBubble]}>
        <Text style={[styles.bubbleText, team && styles.teamBubbleText]}>{text}</Text>
      </View>
      <Text style={[styles.meta, team && styles.teamMeta]}>{time}{seen ? `  ${seen}` : ""}</Text>
    </View>
  );
}

export function ScreenshotChatScene({
  showAssignment,
  teamMembers
}: {
  showAssignment: boolean;
  teamMembers: DashboardTeamMember[];
}) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton}><Text style={styles.icon}>‹</Text></Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>{screenshotChat.title}</Text>
          <Text style={styles.headerSubtitle}>{screenshotChat.subtitle}</Text>
        </View>
        <Pressable style={styles.iconButton}><Text style={styles.infoIcon}>i</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Bubble text={screenshotChat.visitorMessages[0].text} time={screenshotChat.visitorMessages[0].time} />
        <Bubble align="right" text={screenshotChat.teamMessage.text} time={screenshotChat.teamMessage.time} seen={screenshotChat.teamMessage.seen} />
        <Bubble text={screenshotChat.visitorMessages[1].text} time={screenshotChat.visitorMessages[1].time} />
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        </View>
      </ScrollView>
      <View style={styles.composer}>
        <Text style={styles.composerIcon}>⌁</Text>
        <Text style={styles.placeholder}>Type a message</Text>
        <Text style={styles.send}>➤</Text>
      </View>
      <ThreadAssignmentSheet
        assignedUserId={"sarah"}
        busy={false}
        teamMembers={teamMembers}
        visible={showAssignment}
        onAssign={async () => {}}
        onClose={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: mobileTheme.colors.slate50 },
  header: { height: 72, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, backgroundColor: mobileTheme.colors.white, borderBottomWidth: 1, borderBottomColor: mobileTheme.colors.slate200 },
  iconButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 28, color: mobileTheme.colors.slate700, lineHeight: 30 },
  infoIcon: { width: 22, height: 22, borderRadius: 11, overflow: "hidden", textAlign: "center", lineHeight: 22, color: mobileTheme.colors.slate600, borderWidth: 1, borderColor: mobileTheme.colors.slate300, fontSize: 14, fontWeight: "700" },
  headerCopy: { flex: 1, alignItems: "center" },
  headerTitle: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate900, fontWeight: "600" },
  headerSubtitle: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate500 },
  content: { padding: 16, gap: 16, paddingBottom: 24 },
  bubbleWrap: { maxWidth: "78%" },
  bubbleWrapLeft: { alignSelf: "flex-start" },
  bubbleWrapRight: { alignSelf: "flex-end" },
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
  visitorBubble: { backgroundColor: mobileTheme.colors.slate100, borderBottomLeftRadius: 4 },
  teamBubble: { backgroundColor: mobileTheme.colors.blue, borderBottomRightRadius: 4 },
  bubbleText: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate900, lineHeight: 21 },
  teamBubbleText: { color: mobileTheme.colors.white },
  meta: { marginTop: 6, ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate400 },
  teamMeta: { color: "#BFDBFE", textAlign: "right" },
  typingBubble: { alignSelf: "flex-start", backgroundColor: mobileTheme.colors.slate100, borderRadius: 16, borderBottomLeftRadius: 4, paddingHorizontal: 18, paddingVertical: 16 },
  typingDots: { flexDirection: "row", gap: 6 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: mobileTheme.colors.slate400 },
  composer: { height: 60, marginHorizontal: 16, marginBottom: 14, paddingHorizontal: 16, borderRadius: 18, backgroundColor: mobileTheme.colors.white, borderWidth: 1, borderColor: mobileTheme.colors.slate200, flexDirection: "row", alignItems: "center", gap: 12 },
  composerIcon: { color: mobileTheme.colors.slate500, fontSize: 18 },
  placeholder: { flex: 1, ...mobileTheme.typography.body, color: mobileTheme.colors.slate400 },
  send: { color: mobileTheme.colors.blue, fontSize: 18, fontWeight: "700" }
});
