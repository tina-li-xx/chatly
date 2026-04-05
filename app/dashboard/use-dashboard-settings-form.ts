"use client";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import type {
  DashboardAutomationSettings,
  DashboardSettingsData,
  DashboardSettingsEmail,
  DashboardSettingsNotifications,
  DashboardSettingsProfile,
  DashboardSettingsReports
} from "@/lib/data/settings-types";
import type { DashboardNoticeState } from "./dashboard-controls";
import { buildOwnerName, editableSignature, passwordStrength, settingsErrorMessage, type EditableSettings } from "./dashboard-settings-shared";
import { buildEditableSettings, emptyPasswordDraft, type PasswordDraft } from "./dashboard-settings-form-state";
const EMPTY_PASSWORD_SIGNATURE = JSON.stringify(emptyPasswordDraft());
export function useDashboardSettingsForm(
  initialData: DashboardSettingsData,
  onNotice: (notice: Exclude<DashboardNoticeState, null>) => void
) {
  const initialSettings = useMemo(() => buildEditableSettings(initialData), [initialData]);
  const [savedSettings, setSavedSettings] = useState<EditableSettings>(initialSettings);
  const [draftSettings, setDraftSettings] = useState<EditableSettings>(initialSettings);
  const [passwordDraft, setPasswordDraft] = useState<PasswordDraft>(emptyPasswordDraft);
  const [passwordExpanded, setPasswordExpanded] = useState(false);
  const [pendingSaveSignature, setPendingSaveSignature] = useState<{ settings: string; password: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentProfileName = buildOwnerName(draftSettings.profile);
  const passwordMeter = passwordStrength(passwordDraft.newPassword);
  const initialSignature = editableSignature(initialSettings);
  const savedSettingsSignature = editableSignature(savedSettings);
  const draftSignature = editableSignature(draftSettings);
  const savedSignature = pendingSaveSignature?.settings ?? editableSignature(savedSettings);
  const passwordSignature = JSON.stringify(passwordDraft);
  const isDirty = useMemo(
    () =>
      savedSignature !== draftSignature ||
      passwordSignature !== (pendingSaveSignature?.password ?? EMPTY_PASSWORD_SIGNATURE),
    [draftSignature, passwordSignature, pendingSaveSignature, savedSignature]
  );
  useEffect(() => {
    if (initialSignature === savedSettingsSignature) {
      return;
    }
    setSavedSettings(initialSettings);
    setDraftSettings((current) => editableSignature(current) === savedSettingsSignature ? initialSettings : current);
    setPendingSaveSignature(null);
  }, [initialSettings, initialSignature, savedSettingsSignature]);
  useEffect(() => {
    if (!isDirty) {
      return;
    }
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
  function updateProfile<K extends keyof DashboardSettingsProfile>(key: K, value: DashboardSettingsProfile[K]) {
    setDraftSettings((current) => ({
      ...current,
      profile: { ...current.profile, [key]: value }
    }));
  }
  function updateTeamName(value: string) {
    setDraftSettings((current) => ({ ...current, teamName: value }));
  }
  function updateNotifications<K extends keyof DashboardSettingsNotifications>(key: K, value: DashboardSettingsNotifications[K]) {
    setDraftSettings((current) => ({
      ...current,
      notifications: { ...current.notifications, [key]: value }
    }));
  }
  function updateEmail<K extends keyof DashboardSettingsEmail>(key: K, value: DashboardSettingsEmail[K]) {
    setDraftSettings((current) => ({
      ...current,
      email: { ...current.email, [key]: value }
    }));
  }
  function updateContacts(value: EditableSettings["contacts"]) {
    setDraftSettings((current) => ({
      ...current,
      contacts: value
    }));
  }
  function updateReports<K extends keyof DashboardSettingsReports>(key: K, value: DashboardSettingsReports[K]) {
    setDraftSettings((current) => ({
      ...current,
      reports: { ...current.reports, [key]: value }
    }));
  }
  function updateAutomation(updater: (current: DashboardAutomationSettings) => DashboardAutomationSettings) {
    setDraftSettings((current) => ({
      ...current,
      automation: updater(current.automation)
    }));
  }
  async function handleSave() {
    if (isSaving) {
      return;
    }
    const submittedSettings = draftSettings;
    const submittedPassword =
      passwordDraft.currentPassword || passwordDraft.newPassword || passwordDraft.confirmPassword
        ? passwordDraft
        : null;
    const submittedSettingsSignature = editableSignature(submittedSettings);
    const submittedPasswordSignature = JSON.stringify(passwordDraft);
    setPendingSaveSignature({ settings: submittedSettingsSignature, password: submittedPasswordSignature });
    setIsSaving(true);
    try {
      const response = await fetch("/dashboard/settings/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profile: submittedSettings.profile,
          teamName: submittedSettings.teamName,
          notifications: submittedSettings.notifications,
          email: submittedSettings.email,
          contacts: submittedSettings.contacts,
          reports: submittedSettings.reports,
          automation: submittedSettings.automation,
          password: submittedPassword
        })
      });
      const payload = (await response.json()) as
        | { ok: true; settings: DashboardSettingsData }
        | { ok: false; error: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "settings-save-failed" : payload.error);
      }
      const nextSettings = buildEditableSettings(payload.settings);
      setSavedSettings(nextSettings);
      setDraftSettings((current) => (editableSignature(current) === submittedSettingsSignature ? nextSettings : current));
      if (submittedPassword) {
        setPasswordDraft((current) =>
          JSON.stringify(current) === submittedPasswordSignature ? emptyPasswordDraft() : current
        );
        setPasswordExpanded(false);
      }
      window.dispatchEvent(
        new CustomEvent("chatly:notification-settings-updated", {
          detail: payload.settings.notifications
        })
      );
      setPendingSaveSignature(null);
      onNotice({ tone: "success", message: "Settings saved" });
    } catch (error) {
      setPendingSaveSignature(null);
      onNotice({
        tone: "error",
        message: settingsErrorMessage(error instanceof Error ? error.message : "settings-save-failed")
      });
    } finally {
      setIsSaving(false);
    }
  }
  function handleDiscard() {
    setDraftSettings(savedSettings);
    setPasswordDraft(emptyPasswordDraft());
    setPasswordExpanded(false);
    setPendingSaveSignature(null);
  }
  function handleAvatarPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateProfile("avatarDataUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }
  return {
    currentProfileName,
    draftSettings,
    fileInputRef,
    handleAvatarPick,
    handleDiscard,
    handleSave,
    isDirty,
    isSaving,
    passwordDraft,
    passwordExpanded,
    passwordMeter,
    setPasswordDraft,
    setPasswordExpanded,
    updateEmail,
    updateAutomation,
    updateContacts,
    updateNotifications,
    updateProfile,
    updateReports,
    updateTeamName
  };
}
