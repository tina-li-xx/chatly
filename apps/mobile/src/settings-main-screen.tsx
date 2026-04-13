import Constants from "expo-constants";
import { Pressable, Switch, StyleSheet, Text, View } from "react-native";
import { AvatarBadge } from "./avatar-badge";
import { formatPersonName } from "./formatting";
import { mobileTheme, presenceColor } from "./mobile-theme";
import { SettingsCard, SettingsRow, SettingsScreen, SettingsSectionLabel } from "./settings-scaffold";
import type { MobileAvailability, MobileProfile } from "./types";

export function SettingsMainScreen({
  availability,
  availabilityBusy,
  profile,
  onBack,
  onOpenAppearance,
  onOpenHelp,
  onOpenNotifications,
  onOpenProfile,
  onOpenPrivacy,
  onOpenSignOut,
  onOpenTerms,
  onToggleAvailability
}: {
  availability: MobileAvailability;
  availabilityBusy: boolean;
  profile: MobileProfile;
  onBack(): void;
  onOpenAppearance(): void;
  onOpenHelp(): void;
  onOpenNotifications(): void;
  onOpenProfile(): void;
  onOpenPrivacy(): void;
  onOpenSignOut(): void;
  onOpenTerms(): void;
  onToggleAvailability(value: boolean): void;
}) {
  const name = formatPersonName(profile);
  const version = Constants.expoConfig?.version ?? "1.0.0";
  const build = Constants.nativeBuildVersion?.trim() || null;

  return (
    <SettingsScreen onBack={onBack} title="Settings">
      <SettingsCard>
        <Pressable onPress={onOpenProfile} style={styles.profileRow}>
          <AvatarBadge imageUrl={profile.avatarDataUrl} label={name} size={48} />
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </SettingsCard>
      <SettingsSectionLabel>Availability</SettingsSectionLabel>
      <SettingsCard>
        <View style={styles.availabilityRow}>
          <View style={styles.availabilityCopy}>
            <View style={styles.availabilityTitle}>
              <View style={[styles.presenceDot, { backgroundColor: presenceColor(availability) }]} />
              <Text style={styles.availabilityText}>{availability === "online" ? "Online" : "Offline"}</Text>
            </View>
            <Text style={styles.availabilityDescription}>
              {availability === "online" ? "Receiving new chats" : "Not receiving chats"}
            </Text>
          </View>
          <Switch
            disabled={availabilityBusy}
            onValueChange={onToggleAvailability}
            value={availability === "online"}
          />
        </View>
      </SettingsCard>
      <SettingsSectionLabel>Preferences</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow icon="notifications-outline" label="Notifications" onPress={onOpenNotifications} />
        <SettingsRow icon="moon-outline" label="Appearance" last onPress={onOpenAppearance} />
      </SettingsCard>
      <SettingsSectionLabel>Support</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow icon="chatbubble-ellipses-outline" label="Help & Feedback" onPress={onOpenHelp} />
        <SettingsRow icon="document-text-outline" label="Terms of Service" onPress={onOpenTerms} />
        <SettingsRow icon="shield-checkmark-outline" label="Privacy Policy" last onPress={onOpenPrivacy} />
      </SettingsCard>
      <View style={styles.signOutBlock}>
        <SettingsCard>
          <SettingsRow label="Sign out" tone="danger" last onPress={onOpenSignOut} />
        </SettingsCard>
      </View>
      {build ? <Text style={styles.version}>Chatting v{version} (build {build})</Text> : null}
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  availabilityRow: {
    minHeight: 76,
    paddingHorizontal: mobileTheme.spacing.lg,
    paddingVertical: mobileTheme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: mobileTheme.spacing.md
  },
  profileRow: {
    minHeight: 80,
    paddingHorizontal: mobileTheme.spacing.lg,
    paddingVertical: mobileTheme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: mobileTheme.spacing.md
  },
  profileCopy: { flex: 1 },
  profileName: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate900, fontWeight: "600" },
  profileEmail: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500, marginTop: 2 },
  chevron: { ...mobileTheme.typography.heading, color: mobileTheme.colors.slate400 },
  availabilityCopy: { flex: 1 },
  availabilityTitle: { flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.sm },
  presenceDot: { width: 10, height: 10, borderRadius: 5 },
  availabilityText: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate900, fontWeight: "500" },
  availabilityDescription: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500, marginTop: 4 },
  signOutBlock: { marginTop: mobileTheme.spacing.lg },
  version: {
    ...mobileTheme.typography.tiny,
    color: mobileTheme.colors.slate400,
    textAlign: "center",
    marginTop: mobileTheme.spacing.xl
  }
});
