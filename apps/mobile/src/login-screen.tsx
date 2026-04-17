import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AuthButton, AuthCheckbox } from "./auth-buttons";
import { authErrorViewModel, isValidEmail } from "./auth-helpers";
import { AuthBanner, AuthPasswordField, AuthTextField } from "./auth-fields";
import { AuthShell } from "./auth-shell";
import { mobileTheme } from "./mobile-theme";

type LoginScreenProps = {
  defaultEmail?: string;
  error: string | null;
  submitting: boolean;
  onForgotPassword(): void;
  onSubmit(input: { email: string; password: string; rememberMe: boolean }): void;
};

export function LoginScreen({
  defaultEmail = "",
  error,
  submitting,
  onForgotPassword,
  onSubmit
}: LoginScreenProps) {
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const remoteError = error ? authErrorViewModel(new Error(error)) : null;

  function validate() {
    const nextEmailError = !email.trim()
      ? "Please enter your work email."
      : !isValidEmail(email)
        ? "Please enter a valid email address."
        : null;
    const nextPasswordError = password.trim() ? null : "Please enter your password.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    return !nextEmailError && !nextPasswordError;
  }

  function handleSubmit() {
    if (!validate()) {
      return;
    }
    onSubmit({ email: email.trim(), password, rememberMe });
  }

  return (
    <AuthShell
      description="Use your existing Chatting workspace account to sign in."
      title="Sign in to your inbox"
      withBrand
    >
      <AuthBanner message={remoteError?.message ?? null} tone={remoteError?.tone} />
      <AuthTextField
        autoCapitalize="none"
        autoCorrect={false}
        error={emailError}
        keyboardType="email-address"
        label="Email"
        placeholder="you@company.com"
        returnKeyType="next"
        textContentType="username"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setEmailError(null);
        }}
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <AuthPasswordField
        error={passwordError}
        inputRef={passwordRef}
        label="Password"
        placeholder="••••••••"
        returnKeyType="go"
        textContentType="password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setPasswordError(null);
        }}
        onSubmitEditing={handleSubmit}
      />
      <View style={styles.utilityRow}>
        <AuthCheckbox checked={rememberMe} label="Remember me" onPress={() => setRememberMe((value) => !value)} />
        <Pressable onPress={onForgotPassword}>
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </Pressable>
      </View>
      <AuthButton loading={submitting} trailingIcon="arrow-forward" onPress={handleSubmit}>
        {submitting ? "Signing in..." : "Sign in"}
      </AuthButton>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  utilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -4
  },
  forgotLink: { ...mobileTheme.typography.small, color: mobileTheme.colors.blue, fontWeight: "500" },
});
