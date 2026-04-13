import { StyleSheet, Text, View } from "react-native";
import { mobileTheme } from "../mobile-theme";
import { screenshotNotification } from "./mock-data";

function LockGlyph() {
  return (
    <View style={styles.lockGlyph}>
      <View style={styles.lockShackle} />
      <View style={styles.lockBody} />
    </View>
  );
}

function FlashlightGlyph() {
  return (
    <View style={styles.flashlightGlyph}>
      <View style={styles.flashlightHead} />
      <View style={styles.flashlightBeam} />
    </View>
  );
}

function CameraGlyph() {
  return (
    <View style={styles.cameraGlyph}>
      <View style={styles.cameraTop} />
      <View style={styles.cameraBody}>
        <View style={styles.cameraLens} />
      </View>
    </View>
  );
}

export function ScreenshotNotificationScene() {
  return (
    <View style={styles.screen}>
      <View style={styles.glowA} />
      <View style={styles.glowB} />
      <View style={styles.glowC} />
      <View style={styles.lockWrap}><LockGlyph /></View>
      <Text style={styles.date}>Tuesday, April 15</Text>
      <Text style={styles.time}>9:41</Text>
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.appIcon}><Text style={styles.appIconText}>◻</Text></View>
          <Text style={styles.appName}>{screenshotNotification.appName}</Text>
          <Text style={styles.now}>now</Text>
        </View>
        <Text style={styles.title}>{screenshotNotification.title}</Text>
        <Text style={styles.body}>{screenshotNotification.body}</Text>
      </View>
      <View style={styles.bottomLeft}><FlashlightGlyph /></View>
      <View style={styles.bottomRight}><CameraGlyph /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#132248", alignItems: "center" },
  glowA: { position: "absolute", top: 140, left: -52, width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(93,168,255,0.22)" },
  glowB: { position: "absolute", top: 348, right: -22, width: 292, height: 292, borderRadius: 146, backgroundColor: "rgba(45,212,191,0.14)" },
  glowC: { position: "absolute", bottom: -18, left: 34, width: 238, height: 238, borderRadius: 119, backgroundColor: "rgba(13,148,136,0.16)" },
  lockWrap: { marginTop: 34, alignItems: "center", justifyContent: "center" },
  lockGlyph: { width: 18, height: 20, alignItems: "center" },
  lockShackle: { width: 10, height: 8, borderWidth: 1.8, borderBottomWidth: 0, borderColor: "rgba(255,255,255,0.82)", borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  lockBody: { marginTop: -1, width: 13, height: 10, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.82)" },
  date: { marginTop: 14, fontSize: 17, fontWeight: "600", color: "rgba(255,255,255,0.82)" },
  time: { marginTop: 8, fontSize: 72, fontWeight: "300", letterSpacing: -3.5, color: mobileTheme.colors.white },
  card: { width: "82%", marginTop: 34, paddingHorizontal: 18, paddingVertical: 16, borderRadius: 22, backgroundColor: "rgba(248,250,252,0.94)", borderWidth: 1, borderColor: "rgba(255,255,255,0.34)", shadowColor: "#000000", shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  cardRow: { flexDirection: "row", alignItems: "center" },
  appIcon: { width: 22, height: 22, borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: mobileTheme.colors.blue },
  appIconText: { color: mobileTheme.colors.white, fontSize: 9, fontWeight: "700" },
  appName: { marginLeft: 8, flex: 1, fontSize: 10.5, fontWeight: "700", color: mobileTheme.colors.slate500, letterSpacing: 0.6 },
  now: { fontSize: 10.5, fontWeight: "600", color: mobileTheme.colors.slate400 },
  title: { marginTop: 14, fontSize: 16, lineHeight: 21, fontWeight: "700", color: mobileTheme.colors.slate900 },
  body: { marginTop: 8, fontSize: 13.5, lineHeight: 17, color: mobileTheme.colors.slate600 },
  bottomLeft: { position: "absolute", left: 30, bottom: 20, width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(15,23,42,0.3)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  bottomRight: { position: "absolute", right: 30, bottom: 20, width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(15,23,42,0.3)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  flashlightGlyph: { width: 16, height: 18, alignItems: "center" },
  flashlightHead: { width: 10, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.92)" },
  flashlightBeam: { marginTop: 2, width: 6, height: 9, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.92)" },
  cameraGlyph: { width: 20, height: 15, alignItems: "center" },
  cameraTop: { width: 7, height: 2.5, marginBottom: 1, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.92)" },
  cameraBody: { width: 17, height: 11, borderRadius: 3.5, borderWidth: 1.6, borderColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center" },
  cameraLens: { width: 5, height: 5, borderRadius: 2.5, borderWidth: 1.4, borderColor: "rgba(255,255,255,0.92)" }
});
