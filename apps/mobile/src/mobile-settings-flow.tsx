import { useEffect, useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { friendlyErrorMessage } from "./formatting";
import {
  MOBILE_BLOG_URL,
  MOBILE_HELP_CENTER_URL,
  MOBILE_PRIVACY_URL,
  MOBILE_TERMS_URL,
  MOBILE_X_URL,
  buildMailto
} from "./mobile-settings-links";
import { mobileTheme } from "./mobile-theme";
import { NotificationSettingsScreen } from "./notification-settings-screen";
import { NotificationSoundSheet } from "./notification-sound-sheet";
import { SettingsAppearanceScreen } from "./settings-appearance-screen";
import { SettingsAvatarSheet } from "./settings-avatar-sheet";
import { SettingsFeedbackScreen } from "./settings-feedback-screen";
import { SettingsHelpScreen } from "./settings-help-screen";
import { SettingsMainScreen } from "./settings-main-screen";
import { SettingsPasswordScreen } from "./settings-password-screen";
import { SettingsProfileScreen } from "./settings-profile-screen";
import { SettingsSignOutSheet } from "./settings-signout-sheet";
import { chooseProfilePhoto, takeProfilePhoto } from "./profile-avatar-picker";
import type { MobileAppearanceSettings, MobileAvailability, MobileNotificationPreferences, MobileProfile, MobileSession } from "./types";

type Screen = "appearance" | "bug" | "help" | "main" | "notifications" | "password" | "profile" | "feedback";
type PermissionStatus = "denied" | "granted" | "unavailable" | "undetermined";

export function MobileSettingsFlow({
  appearance,
  availability,
  permissionStatus,
  preferences,
  profile,
  session,
  workspaceBusy,
  onClose,
  onLogout,
  onOpenSystemSettings,
  onRequestPermission,
  onSaveAppearance,
  onSaveAvailability,
  onSaveNotificationPreferences,
  onSaveProfile,
  onUpdatePassword
}: {
  appearance: MobileAppearanceSettings;
  availability: MobileAvailability;
  permissionStatus: PermissionStatus;
  preferences: MobileNotificationPreferences;
  profile: MobileProfile;
  session: MobileSession;
  workspaceBusy: boolean;
  onClose(): void;
  onLogout(): void;
  onOpenSystemSettings(): Promise<void>;
  onRequestPermission(): Promise<PermissionStatus>;
  onSaveAppearance(next: MobileAppearanceSettings): Promise<void>;
  onSaveAvailability(next: MobileAvailability): Promise<void>;
  onSaveNotificationPreferences(next: MobileNotificationPreferences): Promise<void>;
  onSaveProfile(next: MobileProfile): Promise<void>;
  onUpdatePassword(input: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<void>;
}) {
  const [screen, setScreen] = useState<Screen>("main");
  const [soundSheetVisible, setSoundSheetVisible] = useState(false);
  const [avatarSheetVisible, setAvatarSheetVisible] = useState(false);
  const [signOutVisible, setSignOutVisible] = useState(false);
  const [banner, setBanner] = useState<{ message: string; tone: "error" | "success" } | null>(null);
  const resolvedProfile = profile.email
    ? profile
    : { ...profile, email: session.user.email };

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 2400);
    return () => clearTimeout(timer);
  }, [banner]);

  function showBanner(message: string, tone: "error" | "success") {
    setBanner({ message, tone });
  }

  function showError(error: unknown, fallback = "Something went wrong.") {
    showBanner(
      error instanceof Error ? friendlyErrorMessage(error.message) : fallback,
      "error"
    );
  }

  async function run(action: () => Promise<void>, success?: string) {
    try {
      await action();
      if (success) showBanner(success, "success");
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  }

  async function saveAvatar(nextAvatar: string | null) {
    setAvatarSheetVisible(false);
    await run(() => onSaveProfile({ ...profile, avatarDataUrl: nextAvatar }), "Profile updated");
  }

  function openUrl(url: string) {
    void Linking.openURL(url).catch(() => {
      showBanner("That link could not be opened right now.", "error");
    });
  }

  async function handleAvatarSelection(action: () => Promise<string | null>) {
    try {
      const nextAvatar = await action();
      if (nextAvatar) {
        await saveAvatar(nextAvatar);
        return;
      }
      setAvatarSheetVisible(false);
    } catch (error) {
      showError(error, "Photo update failed.");
    }
  }

  const currentScreen = {
    main: <SettingsMainScreen availability={availability} availabilityBusy={workspaceBusy} profile={resolvedProfile} onBack={onClose} onOpenAppearance={() => setScreen("appearance")} onOpenHelp={() => setScreen("help")} onOpenNotifications={() => setScreen("notifications")} onOpenPrivacy={() => openUrl(MOBILE_PRIVACY_URL)} onOpenProfile={() => setScreen("profile")} onOpenSignOut={() => setSignOutVisible(true)} onOpenTerms={() => openUrl(MOBILE_TERMS_URL)} onToggleAvailability={(value) => void run(() => onSaveAvailability(value ? "online" : "offline"))} />,
    profile: <SettingsProfileScreen profile={resolvedProfile} onBack={() => setScreen("main")} onOpenPassword={() => setScreen("password")} onOpenPhotoOptions={() => setAvatarSheetVisible(true)} onSave={(next) => run(() => onSaveProfile(next), "Profile updated")} />,
    password: <SettingsPasswordScreen onBack={() => setScreen("profile")} onSubmit={async (input) => { if (await run(() => onUpdatePassword(input), "Password updated")) setScreen("profile"); }} />,
    notifications: <NotificationSettingsScreen busy={workspaceBusy} permissionStatus={permissionStatus} preferences={preferences} onBack={() => setScreen("main")} onOpenSettings={() => void onOpenSystemSettings()} onOpenSoundPicker={() => setSoundSheetVisible(true)} onRequestPermission={onRequestPermission} onUpdate={(next) => void run(() => onSaveNotificationPreferences(next))} />,
    appearance: <SettingsAppearanceScreen appearance={appearance} onBack={() => setScreen("main")} onChange={(next) => void run(() => onSaveAppearance(next))} />,
    help: <SettingsHelpScreen onBack={() => setScreen("main")} onContactSupport={() => openUrl(buildMailto("Chatting mobile support", ""))} onOpenBlog={() => openUrl(MOBILE_BLOG_URL)} onOpenBugReport={() => setScreen("bug")} onOpenFeedback={() => setScreen("feedback")} onOpenHelpCenter={() => openUrl(MOBILE_HELP_CENTER_URL)} onOpenX={() => openUrl(MOBILE_X_URL)} />,
    feedback: <SettingsFeedbackScreen kind="feedback" onBack={() => setScreen("help")} session={session} />,
    bug: <SettingsFeedbackScreen kind="bug" onBack={() => setScreen("help")} session={session} />
  }[screen];

  return (
    <View style={styles.screen}>
      {currentScreen}
      {banner ? <View style={[styles.banner, banner.tone === "success" ? styles.successBanner : styles.errorBanner]}><Text style={styles.bannerText}>{banner.message}</Text></View> : null}
      <NotificationSoundSheet selected={preferences.soundName} visible={soundSheetVisible} onClose={() => setSoundSheetVisible(false)} onSelect={(soundName) => { setSoundSheetVisible(false); void run(() => onSaveNotificationPreferences({ ...preferences, soundName })); }} />
      <SettingsAvatarSheet canRemove={Boolean(profile.avatarDataUrl)} visible={avatarSheetVisible} onClose={() => setAvatarSheetVisible(false)} onChooseLibrary={() => void handleAvatarSelection(chooseProfilePhoto)} onTakePhoto={() => void handleAvatarSelection(takeProfilePhoto)} onRemove={() => void saveAvatar(null)} />
      <SettingsSignOutSheet visible={signOutVisible} onClose={() => setSignOutVisible(false)} onConfirm={onLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: mobileTheme.colors.white },
  banner: {
    position: "absolute",
    top: mobileTheme.spacing.lg,
    left: mobileTheme.spacing.lg,
    right: mobileTheme.spacing.lg,
    borderRadius: mobileTheme.radius.lg,
    paddingHorizontal: mobileTheme.spacing.lg,
    paddingVertical: mobileTheme.spacing.md
  },
  successBanner: { backgroundColor: "#D1FAE5" },
  errorBanner: { backgroundColor: "#FEF2F2" },
  bannerText: { ...mobileTheme.typography.small, color: mobileTheme.colors.slate900, textAlign: "center", fontWeight: "500" }
});
