import { StyleSheet, View } from "react-native";
import { mobileTheme } from "./mobile-theme";

export function AuthScreenSkeleton() {
  return (
    <View style={styles.authScreen}>
      <View style={styles.authHero} />
      <View style={styles.authCard}>
        <View style={[styles.line, styles.authEyebrow]} />
        <View style={[styles.line, styles.authTitle]} />
        <View style={[styles.line, styles.authCopy]} />
        <View style={[styles.line, styles.authCopyShort]} />
        <View style={[styles.line, styles.authInput]} />
        <View style={[styles.line, styles.authInput]} />
        <View style={[styles.line, styles.authButton]} />
      </View>
    </View>
  );
}

export function InboxSkeleton() {
  return (
    <View style={styles.list}>
      {[1, 2, 3, 4, 5].map((item) => (
        <View key={item} style={styles.row}>
          <View style={styles.avatar} />
          <View style={styles.copy}>
            <View style={[styles.line, styles.title]} />
            <View style={[styles.line, styles.preview]} />
            <View style={[styles.line, styles.meta]} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ThreadSkeleton() {
  return (
    <View style={styles.thread}>
      <View style={[styles.hero, styles.line]} />
      <View style={[styles.bubble, styles.line]} />
      <View style={[styles.bubbleWide, styles.line, styles.right]} />
      <View style={[styles.bubble, styles.line]} />
    </View>
  );
}

const styles = StyleSheet.create({
  authScreen: {
    flex: 1,
    justifyContent: "center",
    padding: mobileTheme.spacing.xl,
    backgroundColor: mobileTheme.colors.slate50,
  },
  authHero: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "46%",
    backgroundColor: mobileTheme.colors.blueLight,
  },
  authCard: {
    gap: mobileTheme.spacing.md,
    padding: mobileTheme.spacing.xl,
    borderRadius: mobileTheme.radius.xl,
    backgroundColor: mobileTheme.colors.white,
    borderWidth: 1,
    borderColor: mobileTheme.colors.slate200,
  },
  list: { gap: mobileTheme.spacing.sm, paddingTop: mobileTheme.spacing.md },
  row: {
    flexDirection: "row",
    gap: mobileTheme.spacing.md,
    alignItems: "flex-start",
    paddingVertical: mobileTheme.spacing.md
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: mobileTheme.colors.slate100
  },
  copy: { flex: 1, gap: mobileTheme.spacing.sm },
  line: {
    backgroundColor: mobileTheme.colors.slate100,
    borderRadius: mobileTheme.radius.md
  },
  authEyebrow: { width: "34%", height: 12 },
  authTitle: { width: "82%", height: 72 },
  authCopy: { width: "92%", height: 18 },
  authCopyShort: { width: "68%", height: 18 },
  authInput: { width: "100%", height: 44 },
  authButton: { width: "100%", height: 44 },
  title: { width: "48%", height: 16 },
  preview: { width: "82%", height: 14 },
  meta: { width: "36%", height: 12 },
  thread: { flex: 1, gap: mobileTheme.spacing.md, padding: mobileTheme.spacing.lg },
  hero: { height: 96, borderRadius: mobileTheme.radius.lg },
  bubble: { width: "58%", height: 72, borderRadius: mobileTheme.radius.lg },
  bubbleWide: { width: "72%", height: 88, borderRadius: mobileTheme.radius.lg },
  right: { alignSelf: "flex-end" }
});
