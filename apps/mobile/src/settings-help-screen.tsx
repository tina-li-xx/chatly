import { StyleSheet, Text, View } from "react-native";
import { SettingsCard, SettingsRow, SettingsScreen, SettingsSectionLabel } from "./settings-scaffold";
import { mobileTheme } from "./mobile-theme";

export function SettingsHelpScreen({
  onBack,
  onContactSupport,
  onOpenBlog,
  onOpenBugReport,
  onOpenFeedback,
  onOpenHelpCenter,
  onOpenX
}: {
  onBack(): void;
  onContactSupport(): void;
  onOpenBlog(): void;
  onOpenBugReport(): void;
  onOpenFeedback(): void;
  onOpenHelpCenter(): void;
  onOpenX(): void;
}) {
  return (
    <SettingsScreen onBack={onBack} title="Help & Feedback">
      <SettingsCard>
        <SettingsRow description="Browse articles" icon="book-outline" label="Help Center" onPress={onOpenHelpCenter} />
        <SettingsRow description="Email our team" icon="chatbubble-ellipses-outline" label="Contact Support" onPress={onContactSupport} />
        <SettingsRow description="Ideas and suggestions" icon="bulb-outline" label="Send Feedback" onPress={onOpenFeedback} />
        <SettingsRow description="Something not working?" icon="bug-outline" label="Report a Bug" last onPress={onOpenBugReport} />
      </SettingsCard>
      <SettingsSectionLabel>Connect</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow description="News and updates" icon="logo-twitter" label="X" onPress={onOpenX} />
        <SettingsRow description="Read the latest from Chatting" icon="newspaper-outline" label="Blog" last onPress={onOpenBlog} />
      </SettingsCard>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Need a hand while you're away from the desk? We'll make sure it reaches the right inbox.</Text>
      </View>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  footer: { paddingHorizontal: mobileTheme.spacing.xl, paddingTop: mobileTheme.spacing.xl },
  footerText: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500, textAlign: "center" }
});
