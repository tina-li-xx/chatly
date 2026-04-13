import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AuthButton } from "./auth-buttons";
import { mobileTheme } from "./mobile-theme";

export function SettingsAvatarSheet({
  canRemove,
  visible,
  onClose,
  onChooseLibrary,
  onTakePhoto,
  onRemove
}: {
  canRemove: boolean;
  visible: boolean;
  onClose(): void;
  onChooseLibrary(): void;
  onTakePhoto(): void;
  onRemove(): void;
}) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.backdrop}>
        <Pressable onPress={() => null} style={styles.sheet}>
          <AuthButton onPress={onTakePhoto} variant="secondary">Take photo</AuthButton>
          <View style={styles.gap} />
          <AuthButton onPress={onChooseLibrary} variant="secondary">Choose from library</AuthButton>
          {canRemove ? (
            <View style={styles.gap}>
              <AuthButton onPress={onRemove} variant="secondary">Remove photo</AuthButton>
            </View>
          ) : null}
          <View style={styles.gap}>
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
    padding: mobileTheme.spacing.lg,
    borderTopLeftRadius: mobileTheme.radius.xl,
    borderTopRightRadius: mobileTheme.radius.xl,
    backgroundColor: mobileTheme.colors.white
  },
  gap: { marginTop: mobileTheme.spacing.sm }
});
