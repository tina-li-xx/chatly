import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthBanner, AuthPasswordField } from "./auth-fields";
import { AuthButton } from "./auth-buttons";
import { friendlyErrorMessage } from "./formatting";
import { mobileTheme } from "./mobile-theme";
import { SettingsScreen } from "./settings-scaffold";

function passwordStrength(value: string) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  if (value.length >= 12) score += 1;
  return score;
}

const strengthCopy = [
  ["Weak", mobileTheme.colors.red],
  ["Fair", mobileTheme.colors.amber],
  ["Good", mobileTheme.colors.green],
  ["Strong", mobileTheme.colors.green]
] as const;

export function SettingsPasswordScreen({
  onBack,
  onSubmit
}: {
  onBack(): void;
  onSubmit(input: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void>;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const strength = useMemo(() => Math.max(0, passwordStrength(newPassword) - 1), [newPassword]);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ currentPassword, newPassword, confirmPassword });
    } catch (nextError) {
      setError(nextError instanceof Error ? friendlyErrorMessage(nextError.message) : "Unable to update password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsScreen onBack={onBack} title="Change password">
      <View style={styles.form}>
        <AuthBanner message={error} />
        <AuthPasswordField label="Current password" onChangeText={setCurrentPassword} value={currentPassword} />
        <View>
          <AuthPasswordField label="New password" onChangeText={setNewPassword} value={newPassword} />
          <View style={styles.strengthRow}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.strengthBar,
                  index <= strength && newPassword ? { backgroundColor: strengthCopy[strength][1] } : null
                ]}
              />
            ))}
          </View>
          <Text style={[styles.strengthText, newPassword ? { color: strengthCopy[strength][1] } : null]}>
            {newPassword ? strengthCopy[strength][0] : "Use at least 8 characters"}
          </Text>
        </View>
        <AuthPasswordField label="Confirm new password" onChangeText={setConfirmPassword} value={confirmPassword} />
        <AuthButton
          disabled={!currentPassword || !newPassword || !confirmPassword}
          loading={saving}
          onPress={() => void handleSubmit()}
        >
          Update password
        </AuthButton>
      </View>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: mobileTheme.spacing.lg, paddingHorizontal: mobileTheme.spacing.lg, paddingTop: mobileTheme.spacing.lg },
  strengthRow: { flexDirection: "row", gap: mobileTheme.spacing.xs, marginTop: mobileTheme.spacing.sm },
  strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: mobileTheme.colors.slate200 },
  strengthText: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate500, marginTop: 6 }
});
