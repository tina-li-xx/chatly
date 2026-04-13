import { useState } from "react";
import { AuthButton } from "./auth-buttons";
import { authErrorViewModel, isValidEmail } from "./auth-helpers";
import { AuthBanner, AuthTextField } from "./auth-fields";
import { AuthShell } from "./auth-shell";

type ForgotPasswordScreenProps = {
  defaultEmail?: string;
  error: string | null;
  submitting: boolean;
  onBack(): void;
  onSubmit(email: string): void;
};

export function ForgotPasswordScreen({
  defaultEmail = "",
  error,
  submitting,
  onBack,
  onSubmit
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [emailError, setEmailError] = useState<string | null>(null);
  const banner = error ? authErrorViewModel(new Error(error)) : null;

  function handleSubmit() {
    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    onSubmit(email.trim());
  }

  return (
    <AuthShell
      backLabel="Back to sign in"
      description="No problem. Enter your email and we’ll send you a reset link."
      title="Forgot password?"
      onBack={onBack}
    >
      <AuthBanner message={banner?.message ?? null} tone={banner?.tone} />
      <AuthTextField
        autoCapitalize="none"
        autoCorrect={false}
        error={emailError}
        keyboardType="email-address"
        label="Email address"
        placeholder="you@company.com"
        returnKeyType="send"
        textContentType="emailAddress"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setEmailError(null);
        }}
        onSubmitEditing={handleSubmit}
      />
      <AuthButton loading={submitting} trailingIcon="paper-plane-outline" onPress={handleSubmit}>
        {submitting ? "Sending..." : "Send reset link"}
      </AuthButton>
    </AuthShell>
  );
}
