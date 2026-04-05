"use client";

import type { ReactNode } from "react";
import type { DashboardSettingsNotifications } from "@/lib/data/settings-types";
import { SettingsCard, SettingsSectionHeader, ToggleRow } from "./dashboard-settings-shared";

export function SettingsNotificationsSection({
  title,
  subtitle,
  headerActions,
  notifications,
  onUpdateNotifications
}: {
  title: string;
  subtitle: string;
  headerActions?: ReactNode;
  notifications: DashboardSettingsNotifications;
  onUpdateNotifications: <K extends keyof DashboardSettingsNotifications>(
    key: K,
    value: DashboardSettingsNotifications[K]
  ) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} actions={headerActions} />

      <SettingsCard
        title="Inbox alerts"
        description="Choose how Chatting should get your attention when a conversation needs a reply."
      >
        <div className="space-y-3">
          <ToggleRow
            label="Browser notifications"
            description="Show desktop notifications when new messages arrive."
            checked={notifications.browserNotifications}
            onChange={(value) => onUpdateNotifications("browserNotifications", value)}
          />
          <ToggleRow
            label="Sound alerts"
            description="Play a sound for each new incoming message."
            checked={notifications.soundAlerts}
            onChange={(value) => onUpdateNotifications("soundAlerts", value)}
          />
          <ToggleRow
            label="Email notifications"
            description="Send email updates whenever a visitor is waiting on your team."
            checked={notifications.emailNotifications}
            onChange={(value) => onUpdateNotifications("emailNotifications", value)}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Visitor activity"
        description="Stay on top of new traffic and high-intent visitor behavior across your sites."
      >
        <div className="space-y-3">
          <ToggleRow
            label="New visitor alerts"
            description="Get notified when new visitors appear on your site."
            checked={notifications.newVisitorAlerts}
            onChange={(value) => onUpdateNotifications("newVisitorAlerts", value)}
          />
          <ToggleRow
            label="High-intent alerts"
            description="Alert the team when visitors land on important pages like pricing."
            checked={notifications.highIntentAlerts}
            onChange={(value) => onUpdateNotifications("highIntentAlerts", value)}
          />
        </div>
      </SettingsCard>
    </div>
  );
}
