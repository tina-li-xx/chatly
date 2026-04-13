import { useState } from "react";
import { InAppNotificationBanner } from "./in-app-notification-banner";
import { InboxScreen } from "./inbox-screen";
import { MobileSettingsFlow } from "./mobile-settings-flow";
import { NotificationNudgeBanner } from "./notification-nudge-banner";
import { NotificationPermissionScreen } from "./notification-permission-screen";
import { ThreadScreen } from "./thread-screen";
import type { MobileSession } from "./types";
import { useMobileAppearance } from "./use-mobile-appearance";
import { useMobilePresenceHeartbeat } from "./use-mobile-presence-heartbeat";
import { useMobileWorkspace } from "./use-mobile-workspace";
import { useNotificationPermissionFlow } from "./use-notification-permission-flow";
import { usePushRegistration } from "./use-push-registration";

export function AuthenticatedMobileShell({
  session,
  onLogout
}: {
  session: MobileSession;
  onLogout(pushToken: string | null): Promise<void>;
}) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const workspace = useMobileWorkspace(session);
  const { appearance, saveAppearance } = useMobileAppearance();
  const push = usePushRegistration({
    baseUrl: session.baseUrl,
    token: session.token,
    preferences: workspace.notificationPreferences,
    onOpenConversation: setSelectedConversationId
  });
  const permissionFlow = useNotificationPermissionFlow({
    permissionStatus: push.permissionStatus,
    unreadCount,
    userId: session.user.id,
    onOpenSettings: push.openSystemSettings,
    onRequestPermission: push.requestPermission
  });

  useMobilePresenceHeartbeat({
    baseUrl: session.baseUrl,
    token: session.token,
    enabled: workspace.availability === "online"
  });

  async function handleNudgeEnable() {
    if (push.permissionStatus === "denied") {
      await push.openSystemSettings();
      return;
    }
    await push.requestPermission();
  }

  const foregroundNotification =
    push.foregroundNotification?.conversationId === selectedConversationId ? null : push.foregroundNotification;

  return (
    <>
      {permissionFlow.onboardingVisible ? (
        <NotificationPermissionScreen
          mode={permissionFlow.onboardingMode}
          onContinue={() => void permissionFlow.skipOnboarding()}
          onEnable={() => void permissionFlow.enableNotifications()}
          onSkip={() => void permissionFlow.skipOnboarding()}
        />
      ) : settingsVisible ? (
        <MobileSettingsFlow
          appearance={appearance}
          availability={workspace.availability}
          permissionStatus={push.permissionStatus}
          preferences={workspace.notificationPreferences}
          profile={workspace.profile}
          session={session}
          workspaceBusy={workspace.loading}
          onClose={() => setSettingsVisible(false)}
          onLogout={() => void onLogout(push.pushToken)}
          onOpenSystemSettings={push.openSystemSettings}
          onRequestPermission={push.requestPermission}
          onSaveAppearance={saveAppearance}
          onSaveAvailability={workspace.saveAvailability}
          onSaveNotificationPreferences={workspace.saveNotificationPreferences}
          onSaveProfile={workspace.saveProfile}
          onUpdatePassword={workspace.updatePassword}
        />
      ) : selectedConversationId ? (
        <ThreadScreen
          baseUrl={session.baseUrl}
          token={session.token}
          conversationId={selectedConversationId}
          currentUserId={session.user.id}
          savedReplies={workspace.savedReplies}
          teamMembers={workspace.teamMembers}
          onBack={() => setSelectedConversationId(null)}
        />
      ) : (
        <InboxScreen
          availability={workspace.availability}
          banner={
            permissionFlow.nudgeVisible ? (
              <NotificationNudgeBanner
                onDismiss={() => void permissionFlow.dismissNudge()}
                onEnable={() => void handleNudgeEnable()}
              />
            ) : null
          }
          profile={workspace.profile}
          session={session}
          onUnreadCountChange={setUnreadCount}
          onOpenAccount={() => setSettingsVisible(true)}
          onOpenConversation={setSelectedConversationId}
          onToggleAvailability={workspace.saveAvailability}
        />
      )}
      <InAppNotificationBanner
        notification={permissionFlow.onboardingVisible ? null : foregroundNotification}
        onDismiss={push.clearForegroundNotification}
        onOpen={(conversationId) => {
          push.clearForegroundNotification();
          setSelectedConversationId(conversationId);
        }}
      />
    </>
  );
}
