"use client";

import type { ReactNode } from "react";
import { DashboardSavedRepliesManager } from "./dashboard-saved-replies-manager";
import { SettingsSectionHeader } from "./dashboard-settings-shared";

export function SettingsSavedRepliesSection({
  title,
  subtitle,
  headerActions,
  canManageSavedReplies
}: {
  title: string;
  subtitle: string;
  headerActions?: ReactNode;
  canManageSavedReplies: boolean;
}) {
  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} actions={headerActions} />
      <DashboardSavedRepliesManager canManage={canManageSavedReplies} />
    </div>
  );
}
