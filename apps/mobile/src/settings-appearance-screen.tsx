import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { mobileTheme } from "./mobile-theme";
import { SettingsCard, SettingsScreen, SettingsSectionLabel } from "./settings-scaffold";
import type { MobileAppearanceSettings, MobileThemeMode } from "./types";

const textScaleOptions = [0.95, 1, 1.1] as const;
const themeOptions: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; value: MobileThemeMode }> = [
  { icon: "sunny-outline", label: "Light", value: "light" },
  { icon: "moon-outline", label: "Dark", value: "dark" },
  { icon: "phone-portrait-outline", label: "System", value: "system" }
];

export function SettingsAppearanceScreen({
  appearance,
  onBack,
  onChange
}: {
  appearance: MobileAppearanceSettings;
  onBack(): void;
  onChange(next: MobileAppearanceSettings): void;
}) {
  return (
    <SettingsScreen onBack={onBack} title="Appearance">
      <SettingsSectionLabel>Theme</SettingsSectionLabel>
      <SettingsCard>
        {themeOptions.map((option, index) => (
          <Pressable
            key={option.value}
            onPress={() => onChange({ ...appearance, themeMode: option.value })}
            style={[styles.row, index < themeOptions.length - 1 && styles.rowBorder]}
          >
            <Ionicons color={mobileTheme.colors.slate500} name={option.icon} size={20} />
            <Text style={styles.label}>{option.label}</Text>
            <View style={[styles.radio, appearance.themeMode === option.value && styles.radioActive]} />
          </Pressable>
        ))}
      </SettingsCard>
      <SettingsSectionLabel>Text size</SettingsSectionLabel>
      <SettingsCard>
        <View style={styles.scaleRow}>
          <Text style={styles.scaleLabel}>A</Text>
          <View style={styles.scaleTrack}>
            {textScaleOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => onChange({ ...appearance, textScale: option })}
                style={[styles.scaleStop, appearance.textScale === option && styles.scaleStopActive]}
              />
            ))}
          </View>
          <Text style={[styles.scaleLabel, styles.scaleLargeLabel]}>A</Text>
        </View>
        <Text style={styles.previewLabel}>Preview</Text>
        <View style={styles.previewBubble}>
          <Text style={[styles.previewText, { fontSize: 15 * appearance.textScale, lineHeight: 24 * appearance.textScale }]}>
            Quick question about your pricing plans...
          </Text>
        </View>
      </SettingsCard>
    </SettingsScreen>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 52, paddingHorizontal: mobileTheme.spacing.lg, flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: mobileTheme.colors.slate100 },
  label: { flex: 1, ...mobileTheme.typography.body, color: mobileTheme.colors.slate900 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: mobileTheme.colors.slate200 },
  radioActive: { borderColor: mobileTheme.colors.blue, backgroundColor: mobileTheme.colors.blue },
  scaleRow: { padding: mobileTheme.spacing.lg, flexDirection: "row", alignItems: "center", gap: mobileTheme.spacing.md },
  scaleLabel: { ...mobileTheme.typography.body, color: mobileTheme.colors.slate500 },
  scaleLargeLabel: { fontSize: 18, fontWeight: "600" },
  scaleTrack: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  scaleStop: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: mobileTheme.colors.blue, backgroundColor: mobileTheme.colors.white },
  scaleStopActive: { backgroundColor: mobileTheme.colors.blue },
  previewLabel: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate500, paddingHorizontal: mobileTheme.spacing.lg },
  previewBubble: { margin: mobileTheme.spacing.lg, marginTop: mobileTheme.spacing.sm, borderRadius: mobileTheme.radius.lg, backgroundColor: mobileTheme.colors.slate100, padding: mobileTheme.spacing.lg },
  previewText: { color: mobileTheme.colors.slate900, fontWeight: "500" }
});
