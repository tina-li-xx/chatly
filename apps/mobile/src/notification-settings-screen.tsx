import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { notificationSoundLabel } from "./notification-sound-options";
import { mobileTheme } from "./mobile-theme";
import { SettingsCard, SettingsScreen, SettingsSectionLabel } from "./settings-scaffold";
import type { MobileNotificationPreferences } from "./types";

type PermissionStatus = "denied" | "granted" | "unavailable" | "undetermined";

function CheckboxRow({
  checked,
  description,
  disabled,
  label,
  onPress
}: {
  checked: boolean;
  description: string;
  disabled: boolean;
  label: string;
  onPress(): void;
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.row, disabled && styles.disabled, styles.rowBorder]}>
      <View style={[styles.checkbox, checked && styles.checkboxActive]}>
        {checked ? <Ionicons color={mobileTheme.colors.white} name="checkmark" size={14} /> : null}
      </View>
      <View style={styles.copy}><Text style={styles.label}>{label}</Text><Text style={styles.description}>{description}</Text></View>
    </Pressable>
  );
}

export function NotificationSettingsScreen({
  busy,
  permissionStatus,
  preferences,
  onBack,
  onOpenSettings,
  onOpenSoundPicker,
  onRequestPermission,
  onUpdate
}: {
  busy: boolean;
  permissionStatus: PermissionStatus;
  preferences: MobileNotificationPreferences;
  onBack(): void;
  onOpenSettings(): void;
  onOpenSoundPicker(): void;
  onRequestPermission(): Promise<PermissionStatus>;
  onUpdate(next: MobileNotificationPreferences): void;
}) {
  const nativeEnabled = permissionStatus === "granted";
  const enabled = nativeEnabled && preferences.pushEnabled;

  async function handlePushToggle(nextValue: boolean) {
    if (!nextValue) {
      onUpdate({ ...preferences, pushEnabled: false });
      return;
    }
    if (permissionStatus === "granted") {
      onUpdate({ ...preferences, pushEnabled: true });
      return;
    }
    if (permissionStatus === "denied") {
      onOpenSettings();
      return;
    }
    const nextStatus = await onRequestPermission();
    if (nextStatus === "granted") {
      onUpdate({ ...preferences, pushEnabled: true });
    }
  }

  return (
    <SettingsScreen onBack={onBack} title="Notifications">
      <SettingsCard>
        <View style={[styles.row, styles.rowBorder]}>
          <View style={styles.copy}><Text style={styles.label}>Push Notifications</Text><Text style={styles.description}>Receive alerts on your phone</Text></View>
          <Switch disabled={busy} onValueChange={(value) => void handlePushToggle(value)} value={enabled} />
        </View>
      </SettingsCard>
      <SettingsSectionLabel>Notify me when</SettingsSectionLabel>
      <SettingsCard>
        <CheckboxRow checked={preferences.newConversationEnabled} description="Someone starts a chat" disabled={!enabled || busy} label="New conversation" onPress={() => onUpdate({ ...preferences, newConversationEnabled: !preferences.newConversationEnabled })} />
        <CheckboxRow checked={preferences.assignedEnabled} description="A conversation is assigned" disabled={!enabled || busy} label="Assigned to me" onPress={() => onUpdate({ ...preferences, assignedEnabled: !preferences.assignedEnabled })} />
        <CheckboxRow checked={preferences.allMessagesEnabled} description="Every message in open chats" disabled={!enabled || busy} label="All new messages" onPress={() => onUpdate({ ...preferences, allMessagesEnabled: !preferences.allMessagesEnabled })} />
      </SettingsCard>
      <SettingsSectionLabel>Sound & vibration</SettingsSectionLabel>
      <SettingsCard>
        <Pressable disabled={!enabled || busy} onPress={onOpenSoundPicker} style={[styles.row, styles.rowBorder, (!enabled || busy) && styles.disabled]}>
          <View style={styles.copy}><Text style={styles.label}>Sound</Text></View>
          <View style={styles.valueRow}><Text style={styles.value}>{notificationSoundLabel(preferences.soundName)}</Text><Ionicons color={mobileTheme.colors.slate400} name="chevron-forward" size={16} /></View>
        </Pressable>
        <View style={styles.row}>
          <View style={styles.copy}><Text style={styles.label}>Vibrate</Text></View>
          <Switch disabled={!enabled || busy} onValueChange={(value) => onUpdate({ ...preferences, vibrationEnabled: value })} value={preferences.vibrationEnabled} />
        </View>
      </SettingsCard>
      {!nativeEnabled ? (
        <View style={styles.helperCard}>
          <Ionicons color="#B45309" name="notifications-outline" size={18} />
          <Text style={styles.helperText}>
            {permissionStatus === "denied"
              ? "Notifications are off in device settings. Tap Enable below to turn them back on."
              : "Enable OS notification permission to start receiving alerts."}
          </Text>
          <Pressable onPress={() => void (permissionStatus === "denied" ? Promise.resolve(onOpenSettings()) : onRequestPermission())}>
            <Text style={styles.helperAction}>Enable</Text>
          </Pressable>
        </View>
      ) : null}
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 56, paddingHorizontal: mobileTheme.spacing.lg, paddingVertical: mobileTheme.spacing.md, flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: mobileTheme.colors.slate100 },
  copy: { flex: 1 },
  label: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate900 },
  description: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500, marginTop: 2 },
  valueRow: { flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.sm },
  value: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate500 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: mobileTheme.colors.slate200, alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: mobileTheme.colors.blue, borderColor: mobileTheme.colors.blue },
  helperCard: { margin: mobileTheme.spacing.lg, padding: mobileTheme.spacing.md, borderRadius: mobileTheme.radius.lg, backgroundColor: "#FEF3C7", flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.sm },
  helperText: { flex: 1, ...mobileTheme.typography.small, color: "#92400E" },
  helperAction: { ...mobileTheme.typography.small, color: "#B45309", fontWeight: "600" },
  disabled: { opacity: 0.5 }
});
