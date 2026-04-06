"use client";

import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from "react";
import type { BillingInterval, BillingPlanKey, DashboardBillingSummary } from "@/lib/data/billing-types";
import type { DashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import type { DashboardAiAssistUsageSnapshot } from "@/lib/data/settings-ai-assist-usage";
import type { DashboardAutomationContext, DashboardAutomationSettings, DashboardTeamMember } from "@/lib/data/settings-types";
import { shouldShowTranscriptBranding } from "@/lib/billing-plans";
import type { DashboardNoticeState } from "./dashboard-controls";
import { SettingsSaveActions } from "./dashboard-settings-save-actions";
import { SettingsAiAssistSection } from "./dashboard-settings-ai-assist-section";
import { type EditableSettings, type SettingsSection } from "./dashboard-settings-shared";
import { SettingsAutomationSection } from "./dashboard-settings-automation-section";
import { SettingsContactsSection } from "./dashboard-settings-contacts-section";
import { SettingsEmailSection, SettingsBillingSection } from "./dashboard-settings-email-billing-sections";
import { SettingsNotificationsSection } from "./dashboard-settings-notifications-section";
import { SettingsPlaceholderSection } from "./dashboard-settings-placeholder-section";
import { getSettingsPageCopy } from "./dashboard-settings-page-copy";
import { SettingsProfileSection } from "./dashboard-settings-profile-section";
import { SettingsReferralsSection } from "./dashboard-settings-referrals-section";
import { SettingsReportsSection } from "./dashboard-settings-reports-section";
import { SettingsSavedRepliesSection } from "./dashboard-settings-saved-replies-section";

type PasswordDraft = { currentPassword: string; newPassword: string; confirmPassword: string };
type PasswordMeter = { label: string; widthClass: string; toneClass: string };

export function renderSettingsPageSection(input: {
  activeSection: SettingsSection;
  billing: DashboardBillingSummary;
  billingPlanPending: string | null;
  billingPortalPending: boolean;
  billingSyncPending: boolean;
  aiAssistUsage?: DashboardAiAssistUsageSnapshot;
  automationContext?: DashboardAutomationContext;
  currentProfileName: string;
  draftSettings: EditableSettings;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isDirty: boolean;
  isSaving: boolean;
  onChangePlan: (planKey: BillingPlanKey, billingInterval: BillingInterval, seatQuantity?: number) => Promise<void>;
  onDiscard: () => void;
  onNotice: (notice: DashboardNoticeState) => void;
  onOpenBillingPortal: () => Promise<void>;
  onSave: () => void;
  onSetPasswordDraft: Dispatch<SetStateAction<PasswordDraft>>;
  onSetPasswordExpanded: Dispatch<SetStateAction<boolean>>;
  onSetSelectedInterval: Dispatch<SetStateAction<BillingInterval>>;
  onSyncBilling: () => void;
  onUpdateEmail: <K extends keyof EditableSettings["email"]>(key: K, value: EditableSettings["email"][K]) => void;
  onUpdateContacts: (value: EditableSettings["contacts"]) => void;
  onUpdateAutomation: (updater: (current: DashboardAutomationSettings) => DashboardAutomationSettings) => void;
  onUpdateAiAssist: <K extends keyof DashboardAiAssistSettings>(
    key: K,
    value: DashboardAiAssistSettings[K]
  ) => void;
  onUpdateNotifications: <K extends keyof EditableSettings["notifications"]>(key: K, value: EditableSettings["notifications"][K]) => void;
  onUpdateReports: <K extends keyof NonNullable<EditableSettings["reports"]>>(key: K, value: NonNullable<EditableSettings["reports"]>[K]) => void;
  onUpdateProfile: <K extends keyof EditableSettings["profile"]>(key: K, value: EditableSettings["profile"][K]) => void;
  onUpdateTeamName: (value: string) => void;
  onAvatarPick: (event: ChangeEvent<HTMLInputElement>) => void;
  pageCopy: ReturnType<typeof getSettingsPageCopy>;
  passwordDraft: PasswordDraft;
  passwordExpanded: boolean;
  passwordMeter: PasswordMeter;
  selectedBillingInterval: BillingInterval;
  canManageSavedReplies: boolean;
  teamMembers: DashboardTeamMember[];
}) {
  const saveActions = <SettingsSaveActions isDirty={input.isDirty} isSaving={input.isSaving} onSave={input.onSave} onDiscard={input.onDiscard} />;

  if (input.activeSection === "profile") {
    return (
      <SettingsProfileSection
        title={input.pageCopy.title}
        subtitle={input.pageCopy.subtitle}
        headerActions={saveActions}
        profile={input.draftSettings.profile}
        teamName={input.draftSettings.teamName}
        currentProfileName={input.currentProfileName}
        fileInputRef={input.fileInputRef}
        passwordDraft={input.passwordDraft}
        passwordExpanded={input.passwordExpanded}
        passwordMeter={input.passwordMeter}
        onUpdateProfile={input.onUpdateProfile}
        onUpdateTeamName={input.onUpdateTeamName}
        onAvatarPick={input.onAvatarPick}
        onSetPasswordExpanded={input.onSetPasswordExpanded}
        onSetPasswordDraft={input.onSetPasswordDraft}
      />
    );
  }

  if (input.activeSection === "automation") {
    return (
      <SettingsAutomationSection
        title={input.pageCopy.title}
        subtitle={input.pageCopy.subtitle}
        automation={input.draftSettings.automation}
        context={input.automationContext}
        teamMembers={input.teamMembers}
        billing={input.billing}
        isDirty={input.isDirty}
        isSaving={input.isSaving}
        onSave={input.onSave}
        onDiscard={input.onDiscard}
        onChange={input.onUpdateAutomation}
      />
    );
  }

  if (input.activeSection === "contacts") {
    return (
      <SettingsContactsSection
        title={input.pageCopy.title}
        subtitle={input.pageCopy.subtitle}
        headerActions={saveActions}
        contacts={input.draftSettings.contacts}
        planKey={input.billing.planKey}
        onUpdateContacts={input.onUpdateContacts}
      />
    );
  }

  if (input.activeSection === "notifications") {
    return (
      <SettingsNotificationsSection
        title={input.pageCopy.title}
        subtitle={input.pageCopy.subtitle}
        headerActions={saveActions}
        notifications={input.draftSettings.notifications}
        onUpdateNotifications={input.onUpdateNotifications}
      />
    );
  }

  if (input.activeSection === "aiAssist") {
    return (
      <SettingsAiAssistSection
        title={input.pageCopy.title}
        subtitle={input.pageCopy.subtitle}
        headerActions={saveActions}
        aiAssist={input.draftSettings.aiAssist}
        planKey={input.billing.planKey}
        usage={input.aiAssistUsage}
        onUpdateAiAssist={input.onUpdateAiAssist}
      />
    );
  }

  if (input.activeSection === "integrations") {
    return (
      <SettingsPlaceholderSection
        title={input.pageCopy.title}
        subtitle={input.pageCopy.subtitle}
        headerActions={saveActions}
        message="Integrations settings are being wired in next, so this section can hold connected tools and sync controls."
      />
    );
  }

  if (input.activeSection === "email") {
    return (
      <SettingsEmailSection
        title={input.pageCopy.title}
        subtitle={input.pageCopy.subtitle}
        headerActions={saveActions}
        email={input.draftSettings.email}
        profileEmail={input.draftSettings.profile.email}
        profileName={input.currentProfileName}
        profileAvatarDataUrl={input.draftSettings.profile.avatarDataUrl}
        showTranscriptBrandingPreview={shouldShowTranscriptBranding(input.billing.planKey)}
        onUpdateEmail={input.onUpdateEmail}
        onNotice={input.onNotice}
      />
    );
  }

  if (input.activeSection === "reports") {
    return (
      <SettingsReportsSection
        title={input.pageCopy.title}
        subtitle={input.pageCopy.subtitle}
        headerActions={saveActions}
        reports={input.draftSettings.reports}
        onUpdateReports={input.onUpdateReports}
      />
    );
  }

  if (input.activeSection === "savedReplies") {
    return (
      <SettingsSavedRepliesSection
        title={input.pageCopy.title}
        subtitle={input.pageCopy.subtitle}
        canManageSavedReplies={input.canManageSavedReplies}
      />
    );
  }

  if (input.activeSection === "billing") {
    return (
      <SettingsBillingSection
        title={input.pageCopy.title}
        subtitle={input.pageCopy.subtitle}
        headerActions={saveActions}
        billing={input.billing}
        billingPlanPending={input.billingPlanPending}
        selectedInterval={input.selectedBillingInterval}
        billingPortalPending={input.billingPortalPending}
        billingSyncPending={input.billingSyncPending}
        onOpenBillingPortal={input.onOpenBillingPortal}
        onChangePlan={input.onChangePlan}
        onSetSelectedInterval={input.onSetSelectedInterval}
        onSyncBilling={input.onSyncBilling}
      />
    );
  }

  return (
    <SettingsReferralsSection
      title={input.pageCopy.title}
      subtitle={input.pageCopy.subtitle}
      headerActions={saveActions}
      referrals={input.billing.referrals}
    />
  );
}
