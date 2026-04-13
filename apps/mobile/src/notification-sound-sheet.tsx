import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AuthButton } from "./auth-buttons";
import { mobileTheme } from "./mobile-theme";
import { notificationSoundOptions } from "./notification-sound-options";
import type { MobileNotificationSound } from "./types";

export function NotificationSoundSheet({
  selected,
  visible,
  onClose,
  onSelect
}: {
  selected: MobileNotificationSound;
  visible: boolean;
  onClose(): void;
  onSelect(value: MobileNotificationSound): void;
}) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.backdrop}>
        <Pressable onPress={() => null} style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Notification Sound</Text>
          {notificationSoundOptions.map((option) => (
            <Pressable key={option.value} onPress={() => onSelect(option.value)} style={styles.row}>
              <View style={[styles.radio, selected === option.value && styles.radioActive]}>
                {selected === option.value ? <View style={styles.radioInner} /> : null}
              </View>
              <View style={styles.copy}>
                <Text style={styles.label}>{option.label}</Text>
                <Text style={styles.description}>{option.description}</Text>
              </View>
              <Ionicons color={mobileTheme.colors.slate400} name="volume-high-outline" size={18} />
            </Pressable>
          ))}
          <AuthButton onPress={onClose}>Done</AuthButton>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15, 23, 42, 0.24)" },
  sheet: {
    padding: mobileTheme.spacing.lg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: mobileTheme.colors.white
  },
  handle: { width: 36, height: 4, borderRadius: 999, backgroundColor: mobileTheme.colors.slate200, alignSelf: "center", marginBottom: mobileTheme.spacing.md },
  title: { ...mobileTheme.typography.heading, color: mobileTheme.colors.slate900, marginBottom: mobileTheme.spacing.md },
  row: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.md, borderTopWidth: 1, borderTopColor: mobileTheme.colors.slate100, paddingVertical: mobileTheme.spacing.md },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: mobileTheme.colors.slate200, alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: mobileTheme.colors.blue },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: mobileTheme.colors.blue },
  copy: { flex: 1 },
  label: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate900 },
  description: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500 }
});
