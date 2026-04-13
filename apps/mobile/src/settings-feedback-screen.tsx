import Constants from "expo-constants";
import { useMemo, useState } from "react";
import { Linking, StyleSheet, Text, TextInput, View } from "react-native";
import { AuthBanner } from "./auth-fields";
import { AuthCheckbox } from "./auth-buttons";
import { buildMailto } from "./mobile-settings-links";
import { mobileTheme } from "./mobile-theme";
import { SettingsScreen } from "./settings-scaffold";
import type { MobileSession } from "./types";

export function SettingsFeedbackScreen({
  kind,
  session,
  onBack
}: {
  kind: "bug" | "feedback";
  session: MobileSession;
  onBack(): void;
}) {
  const [message, setMessage] = useState("");
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const copy = useMemo(() => kind === "bug"
    ? {
        title: "Report a bug",
        prompt: "Tell us what broke and what you expected to happen.",
        subject: "Chatting mobile bug report"
      }
    : {
        title: "Send feedback",
        prompt: "Share your ideas, suggestions, or feedback with us.",
        subject: "Chatting mobile feedback"
      }, [kind]);

  function diagnostics() {
    const version = Constants.expoConfig?.version ?? "dev";
    return includeDiagnostics
      ? `\n\n---\nApp version: ${version}\nPlatform: mobile\nUser: ${session.user.email}\nBase URL: ${session.baseUrl}`
      : "";
  }

  async function handleSend() {
    if (!message.trim()) {
      setError("Write a message first.");
      return;
    }

    try {
      setError(null);
      await Linking.openURL(buildMailto(copy.subject, `${message.trim()}${diagnostics()}`));
    } catch {
      setError("We couldn't open your mail app just now.");
    }
  }

  return (
    <SettingsScreen actionDisabled={!message.trim()} actionLabel="Send" onAction={() => void handleSend()} onBack={onBack} title={copy.title}>
      <View style={styles.content}>
        <Text style={styles.prompt}>{copy.prompt}</Text>
        <AuthBanner message={error} />
        <TextInput
          multiline
          onChangeText={setMessage}
          placeholder={kind === "bug" ? "What happened?" : "What's on your mind?"}
          placeholderTextColor={mobileTheme.colors.slate400}
          style={styles.input}
          textAlignVertical="top"
          value={message}
        />
        <View style={styles.checkboxRow}>
          <AuthCheckbox checked={includeDiagnostics} label="Include app diagnostics" onPress={() => setIncludeDiagnostics((current) => !current)} />
        </View>
        <Text style={styles.helper}>Helps us understand issues faster when you're away from your desk.</Text>
      </View>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: mobileTheme.spacing.lg, gap: mobileTheme.spacing.lg },
  prompt: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate700 },
  input: {
    minHeight: 200,
    borderWidth: 1,
    borderColor: mobileTheme.colors.slate200,
    borderRadius: 12,
    backgroundColor: mobileTheme.colors.white,
    padding: mobileTheme.spacing.lg,
    ...mobileTheme.typography.body,
    color: mobileTheme.colors.slate900
  },
  checkboxRow: { alignSelf: "flex-start" },
  helper: { ...mobileTheme.typography.tiny, color: mobileTheme.colors.slate400 }
});
