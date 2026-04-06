"use client";

import { useSearchParams } from "next/navigation";
import type { DashboardSettingsData } from "@/lib/data/settings-types";
import { useToast } from "../ui/toast-provider";
import type { DashboardNoticeState } from "./dashboard-controls";
import { resolveSettingsSection } from "./dashboard-settings-section";
import { DashboardSettingsScaffold } from "./dashboard-settings-scaffold";
import { getSettingsPageCopy } from "./dashboard-settings-page-copy";
import type { SettingsSection } from "./dashboard-settings-shared";
import {
  renderSettingsPageSection
} from "./dashboard-settings-page-sections";
import { useDashboardSettingsBilling } from "./use-dashboard-settings-billing";
import { useDashboardSettingsForm } from "./use-dashboard-settings-form";

export function DashboardSettingsPage({
  initialData,
  canManageSavedReplies = false,
  activeSection
}: {
  initialData: DashboardSettingsData;
  canManageSavedReplies?: boolean;
  activeSection?: SettingsSection;
}) {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const resolvedActiveSection = activeSection ?? resolveSettingsSection(searchParams.get("section"));
  const handleNotice = (notice: DashboardNoticeState) => {
    if (!notice) {
      return;
    }

    showToast(notice.tone === "error" ? "error" : "success", notice.message);
  };
  const form = useDashboardSettingsForm(initialData, handleNotice);
  const billing = useDashboardSettingsBilling({
    activeSection: resolvedActiveSection,
    initialBilling: initialData.billing,
    searchParams,
    onNotice: handleNotice
  });

  return (
    <DashboardSettingsScaffold
      activeSection={resolvedActiveSection}
      onSetActiveSection={() => {}}
      isDirty={form.isDirty}
      isSaving={form.isSaving}
      onDiscard={form.handleDiscard}
      onSave={form.handleSave}
    >
      {renderSettingsPageSection({
        activeSection: resolvedActiveSection,
        automationContext: initialData.automationContext,
        billing: billing.billing,
        billingPlanPending: billing.billingPlanPending,
        billingPortalPending: billing.billingPortalPending,
        billingSyncPending: billing.billingSyncPending,
        currentProfileName: form.currentProfileName,
        draftSettings: form.draftSettings,
        aiAssistUsage: initialData.aiAssistUsage,
        fileInputRef: form.fileInputRef,
        isDirty: form.isDirty,
        isSaving: form.isSaving,
        onAvatarPick: form.handleAvatarPick,
        onChangePlan: billing.handleBillingPlanChange,
        onDiscard: form.handleDiscard,
        onNotice: handleNotice,
        onOpenBillingPortal: billing.openBillingPortal,
        onSave: form.handleSave,
        onSetPasswordDraft: form.setPasswordDraft,
        onSetPasswordExpanded: form.setPasswordExpanded,
        onSetSelectedInterval: billing.setSelectedBillingInterval,
        onSyncBilling: () => void billing.syncBillingFromStripe(),
        onUpdateEmail: form.updateEmail,
        onUpdateContacts: form.updateContacts,
        onUpdateAutomation: form.updateAutomation,
        onUpdateAiAssist: form.updateAiAssist,
        onUpdateNotifications: form.updateNotifications,
        onUpdateProfile: form.updateProfile,
        onUpdateReports: form.updateReports,
        onUpdateTeamName: form.updateTeamName,
        pageCopy: getSettingsPageCopy(resolvedActiveSection),
        passwordDraft: form.passwordDraft,
        passwordExpanded: form.passwordExpanded,
        passwordMeter: form.passwordMeter,
        selectedBillingInterval: billing.selectedBillingInterval,
        canManageSavedReplies,
        teamMembers: initialData.teamMembers
      })}
    </DashboardSettingsScaffold>
  );
}
