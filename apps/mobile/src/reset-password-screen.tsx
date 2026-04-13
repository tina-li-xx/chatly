import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthButton } from "./auth-buttons";
import { authErrorViewModel, passwordStrength } from "./auth-helpers";
import { AuthBanner, AuthPasswordField } from "./auth-fields";
import { AuthShell } from "./auth-shell";
import { mobileTheme } from "./mobile-theme";

type ResetPasswordScreenProps = {
  error: string | null;
  submitting: boolean;
  onSubmit(password: string, confirmPassword: string): void;
};

export function ResetPasswordScreen({
  error,
  submitting,
  onSubmit
}: ResetPasswordScreenProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const strength = passwordStrength(password);
  const banner = error ? authErrorViewModel(new Error(error)) : null;

  function handleSubmit() {
    const nextPasswordError = password.trim().length >= 8 ? null : "Use at least 8 characters.";
    const nextConfirmError = confirmPassword.trim() === password.trim() ? null : "Your password confirmation does not match.";
    setPasswordError(nextPasswordError);
    setConfirmError(confirmPassword ? nextConfirmError : "Please confirm your new password.");
    if (nextPasswordError || nextConfirmError || !confirmPassword.trim()) {
      return;
    }
    onSubmit(password, confirmPassword);
  }

  return (
    <AuthShell description="Enter a new password for your account." title="Reset your password" withBrand>
      <AuthBanner message={banner?.message ?? null} tone={banner?.tone} />
      <AuthPasswordField
        error={passwordError}
        label="New password"
        placeholder="••••••••"
        returnKeyType="next"
        textContentType="newPassword"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setPasswordError(null);
        }}
      />
      <View style={styles.strengthBlock}>
        <View style={styles.strengthRow}>
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={[styles.strengthBar, index < strength.bars && { backgroundColor: strength.color }]}
            />
          ))}
        </View>
        <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
      </View>
      <AuthPasswordField
        error={confirmError}
        label="Confirm new password"
        placeholder="••••••••"
        returnKeyType="go"
        textContentType="newPassword"
        value={confirmPassword}
        onChangeText={(value) => {
          setConfirmPassword(value);
          setConfirmError(null);
        }}
        onSubmitEditing={handleSubmit}
      />
      <AuthButton loading={submitting} trailingIcon="arrow-forward" onPress={handleSubmit}>
        {submitting ? "Resetting..." : "Reset password"}
      </AuthButton>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  strengthBlock: { marginTop: -8, gap: 6 },
  strengthRow: { flexDirection: "row", gap: 4 },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: mobileTheme.colors.slate200
  },
  strengthLabel: { ...mobileTheme.typography.tiny, fontWeight: "500" }
});
