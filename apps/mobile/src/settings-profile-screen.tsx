import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AuthBanner, AuthTextField } from "./auth-fields";
import { AvatarBadge } from "./avatar-badge";
import { formatPersonName, friendlyErrorMessage } from "./formatting";
import { mobileTheme } from "./mobile-theme";
import { SettingsCard, SettingsRow, SettingsScreen, SettingsSectionLabel } from "./settings-scaffold";
import type { MobileProfile } from "./types";

function splitFullName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ")
  };
}

export function SettingsProfileScreen({
  profile,
  onBack,
  onOpenPassword,
  onOpenPhotoOptions,
  onSave
}: {
  profile: MobileProfile;
  onBack(): void;
  onOpenPassword(): void;
  onOpenPhotoOptions(): void;
  onSave(profile: MobileProfile): Promise<unknown>;
}) {
  const [fullName, setFullName] = useState(formatPersonName(profile));
  const [jobTitle, setJobTitle] = useState(profile.jobTitle);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(formatPersonName(profile));
    setJobTitle(profile.jobTitle);
  }, [profile]);

  const nextProfile = useMemo(() => {
    const name = splitFullName(fullName);
    return {
      ...profile,
      firstName: name.firstName,
      lastName: name.lastName,
      jobTitle
    };
  }, [fullName, jobTitle, profile]);
  const dirty =
    nextProfile.firstName !== profile.firstName ||
    nextProfile.lastName !== profile.lastName ||
    nextProfile.jobTitle !== profile.jobTitle;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onSave(nextProfile);
    } catch (nextError) {
      setError(nextError instanceof Error ? friendlyErrorMessage(nextError.message) : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsScreen actionDisabled={!dirty || !nextProfile.firstName || saving} actionLabel="Save" onAction={() => void handleSave()} onBack={onBack} title="Profile">
      <View style={styles.avatarSection}>
        <AvatarBadge
          imageUrl={profile.avatarDataUrl}
          label={formatPersonName(profile)}
          size={80}
        />
        <Pressable onPress={onOpenPhotoOptions}>
          <Text style={styles.photoLink}>Change photo</Text>
        </Pressable>
      </View>
      <View style={styles.form}>
        <AuthBanner message={error} />
        <AuthTextField autoCapitalize="words" label="Full name" onChangeText={setFullName} value={fullName} />
        <View>
          <AuthTextField
            editable={false}
            label="Email"
            rightAccessory={<Ionicons color={mobileTheme.colors.slate400} name="lock-closed-outline" size={18} />}
            value={profile.email}
          />
          <Text style={styles.helper}>Managed by your workspace</Text>
        </View>
        <View>
          <AuthTextField autoCapitalize="words" label="Job title (optional)" onChangeText={setJobTitle} value={jobTitle} />
          <Text style={styles.helper}>Used across your workspace profile.</Text>
        </View>
      </View>
      <SettingsSectionLabel>Security</SettingsSectionLabel>
      <SettingsCard>
        <SettingsRow icon="key-outline" label="Change password" last onPress={onOpenPassword} />
      </SettingsCard>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  avatarSection: { alignItems: "center", gap: mobileTheme.spacing.md, paddingVertical: mobileTheme.spacing.xl },
  photoLink: { ...mobileTheme.typography.small, color: mobileTheme.colors.blue, fontWeight: "500" },
  form: { gap: mobileTheme.spacing.lg, paddingHorizontal: mobileTheme.spacing.lg },
  helper: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate400, marginTop: 4 }
});
