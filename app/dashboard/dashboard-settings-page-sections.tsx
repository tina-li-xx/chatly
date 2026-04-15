"use client";

import { shouldShowTranscriptBranding } from "@/lib/billing-plans";
import { SettingsSaveActions } from "./dashboard-settings-save-actions";
import { SettingsAiAssistSection } from "./dashboard-settings-ai-assist-section";
import { SettingsAutomationSection } from "./dashboard-settings-automation-section";
import { SettingsContactsSection } from "./dashboard-settings-contacts-section";
import { SettingsEmailSection, SettingsBillingSection } from "./dashboard-settings-email-billing-sections";
import { SettingsIntegrationsSection } from "./dashboard-settings-integrations-section";
import { SettingsNotificationsSection } from "./dashboard-settings-notifications-section";
import type { RenderSettingsPageSectionInput } from "./dashboard-settings-page-section-types";
import { SettingsProfileSection } from "./dashboard-settings-profile-section";
import { SettingsReferralsSection } from "./dashboard-settings-referrals-section";
import { SettingsReportsSection } from "./dashboard-settings-reports-section";
import { SettingsSavedRepliesSection } from "./dashboard-settings-saved-replies-section";

export function renderSettingsPageSection(input: RenderSettingsPageSectionInput) {
  const saveActions = (
    <SettingsSaveActions
      isDirty={input.isDirty}
      isSaving={input.isSaving}
      onSave={input.onSave}
      onDiscard={input.onDiscard}
    />
  );

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
      <SettingsIntegrationsSection
        title={input.pageCopy.title}
        subtitle={input.pageCopy.subtitle}
        planKey={input.billing.planKey}
        billing={input.billing}
        billingPlanPending={input.billingPlanPending}
        selectedInterval={input.selectedBillingInterval}
        onChangePlan={input.onChangePlan}
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
