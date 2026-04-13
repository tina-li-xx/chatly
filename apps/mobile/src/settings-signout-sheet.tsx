import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AuthButton } from "./auth-buttons";
import { mobileTheme } from "./mobile-theme";

export function SettingsSignOutSheet({
  visible,
  onClose,
  onConfirm
}: {
  visible: boolean;
  onClose(): void;
  onConfirm(): void;
}) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.backdrop}>
        <Pressable onPress={() => null} style={styles.sheet}>
          <Text style={styles.title}>Sign out of Chatting?</Text>
        <Text style={styles.description}>
          You'll stop receiving push notifications until you sign back in.
        </Text>
        <Pressable onPress={onConfirm} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
        <View style={styles.cancelWrap}>
          <AuthButton onPress={onClose} variant="secondary">Cancel</AuthButton>
        </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15, 23, 42, 0.24)" },
  sheet: {
    padding: mobileTheme.spacing.xl,
    borderTopLeftRadius: mobileTheme.radius.xl,
    borderTopRightRadius: mobileTheme.radius.xl,
    backgroundColor: mobileTheme.colors.white
  },
  title: { ...mobileTheme.typography.heading, color: mobileTheme.colors.slate900, textAlign: "center" },
  description: {
    ...mobileTheme.typography.small,
    color: mobileTheme.colors.slate500,
    textAlign: "center",
    marginTop: mobileTheme.spacing.sm,
    marginBottom: mobileTheme.spacing.xl
  },
  signOutButton: {
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: mobileTheme.colors.red
  },
  signOutText: { ...mobileTheme.typography.body, color: mobileTheme.colors.white, fontWeight: "600" },
  cancelWrap: { marginTop: mobileTheme.spacing.sm }
});
