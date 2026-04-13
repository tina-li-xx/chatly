import { SafeAreaView, StyleSheet } from "react-native";
import { SettingsMainScreen } from "../settings-main-screen";
import { screenshotProfile } from "./mock-data";

export function ScreenshotSettingsScene() {
  return (
    <SafeAreaView style={styles.screen}>
      <SettingsMainScreen
        availability="online"
        availabilityBusy={false}
        profile={screenshotProfile}
        onBack={() => {}}
        onOpenAppearance={() => {}}
        onOpenHelp={() => {}}
        onOpenNotifications={() => {}}
        onOpenProfile={() => {}}
        onOpenPrivacy={() => {}}
        onOpenSignOut={() => {}}
        onOpenTerms={() => {}}
        onToggleAvailability={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFFFF" }
});
