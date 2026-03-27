"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent
} from "react";
import { useSearchParams } from "next/navigation";
import type {
  BillingPlanKey,
  DashboardBillingSummary,
  DashboardSettingsData,
  DashboardSettingsEmail,
  DashboardSettingsNotifications,
  DashboardSettingsProfile
} from "@/lib/data";
import {
  DashboardTopNotice,
  type DashboardNoticeState
} from "./dashboard-controls";
import {
  billingErrorMessage,
  buildOwnerName,
  editableSignature,
  passwordStrength,
  settingsErrorMessage,
  type EditableSettings,
  type SettingsSection
} from "./dashboard-settings-shared";
import { DashboardSettingsScaffold } from "./dashboard-settings-scaffold";
import { SettingsEmailSection, SettingsBillingSection } from "./dashboard-settings-email-billing-sections";
import { SettingsNotificationsSection } from "./dashboard-settings-notifications-section";
import { SettingsProfileSection } from "./dashboard-settings-profile-section";

export function DashboardSettingsPage({ initialData }: { initialData: DashboardSettingsData }) {
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [savedSettings, setSavedSettings] = useState<EditableSettings>({
    profile: initialData.profile,
    notifications: initialData.notifications,
    email: initialData.email
  });
  const [draftSettings, setDraftSettings] = useState<EditableSettings>({
    profile: initialData.profile,
    notifications: initialData.notifications,
    email: initialData.email
  });
  const [passwordDraft, setPasswordDraft] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordExpanded, setPasswordExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<DashboardNoticeState>(null);
  const [billing, setBilling] = useState<DashboardBillingSummary>(initialData.billing);
  const [billingPlanPending, setBillingPlanPending] = useState<BillingPlanKey | null>(null);
  const [billingPortalPending, setBillingPortalPending] = useState(false);
  const [billingSyncPending, setBillingSyncPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const billingSyncedRef = useRef(false);

  const isDirty = useMemo(() => {
    return (
      editableSignature(savedSettings) !== editableSignature(draftSettings) ||
      Boolean(passwordDraft.currentPassword || passwordDraft.newPassword || passwordDraft.confirmPassword)
    );
  }, [draftSettings, passwordDraft, savedSettings]);
  const passwordMeter = passwordStrength(passwordDraft.newPassword);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setNotice(null);
    }, 3200);

    return () => window.clearTimeout(timeout);
  }, [notice]);

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

  useEffect(() => {
    const section = searchParams.get("section");
    if (
      section === "profile" ||
      section === "notifications" ||
      section === "email" ||
      section === "billing"
    ) {
      setActiveSection(section);
    }
  }, [searchParams]);

  useEffect(() => {
    const billingState = searchParams.get("billing");

    if (billingState === "checkout-success") {
      billingSyncedRef.current = true;
      setNotice({
        tone: "success",
        message: "Stripe checkout completed"
      });
      void syncBillingFromStripe();
    } else if (billingState === "checkout-cancelled") {
      setNotice({
        tone: "error",
        message: "Stripe checkout was cancelled"
      });
    } else if (billingState === "portal-return") {
      billingSyncedRef.current = true;
      setNotice({
        tone: "success",
        message: "Billing details refreshed from Stripe"
      });
      void syncBillingFromStripe();
    }
  }, [searchParams]);

  function updateProfile<K extends keyof DashboardSettingsProfile>(key: K, value: DashboardSettingsProfile[K]) {
    setDraftSettings((current) => ({
      ...current,
      profile: {
        ...current.profile,
        [key]: value
      }
    }));
  }

  function updateNotifications<K extends keyof DashboardSettingsNotifications>(
    key: K,
    value: DashboardSettingsNotifications[K]
  ) {
    setDraftSettings((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [key]: value
      }
    }));
  }

  function updateEmail<K extends keyof DashboardSettingsEmail>(key: K, value: DashboardSettingsEmail[K]) {
    setDraftSettings((current) => ({
      ...current,
      email: {
        ...current.email,
        [key]: value
      }
    }));
  }

  async function handleSave() {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/dashboard/settings/update", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          profile: draftSettings.profile,
          notifications: draftSettings.notifications,
          email: draftSettings.email,
          password:
            passwordDraft.currentPassword || passwordDraft.newPassword || passwordDraft.confirmPassword
              ? passwordDraft
              : null
        })
      });

      const payload = (await response.json()) as
        | {
            ok: true;
            settings: DashboardSettingsData;
          }
        | {
            ok: false;
            error: string;
          };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "settings-save-failed" : payload.error);
      }

      setSavedSettings({
        profile: payload.settings.profile,
        notifications: payload.settings.notifications,
        email: payload.settings.email
      });
      setDraftSettings({
        profile: payload.settings.profile,
        notifications: payload.settings.notifications,
        email: payload.settings.email
      });
      window.dispatchEvent(
        new CustomEvent("chatly:notification-settings-updated", {
          detail: payload.settings.notifications
        })
      );
      setPasswordDraft({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setPasswordExpanded(false);
      setNotice({
        tone: "success",
        message: "Settings saved"
      });
    } catch (error) {
      setNotice({
        tone: "error",
        message: settingsErrorMessage(error instanceof Error ? error.message : "settings-save-failed")
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    setDraftSettings(savedSettings);
    setPasswordDraft({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordExpanded(false);
  }

  async function syncBillingFromStripe() {
    if (billingSyncPending) {
      return;
    }

    setBillingSyncPending(true);

    try {
      const response = await fetch("/dashboard/settings/billing/sync", {
        method: "POST"
      });

      const payload = (await response.json()) as
        | { ok: true; billing: DashboardBillingSummary }
        | { ok: false; error: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "billing-sync-failed" : payload.error);
      }

      setBilling(payload.billing);
    } catch (error) {
      setNotice({
        tone: "error",
        message: billingErrorMessage(error instanceof Error ? error.message : "billing-sync-failed")
      });
    } finally {
      setBillingSyncPending(false);
    }
  }

  async function handleBillingPlanChange(planKey: BillingPlanKey) {
    if (billingPlanPending || billing.planKey === planKey) {
      return;
    }

    setBillingPlanPending(planKey);

    try {
      const response = await fetch("/dashboard/settings/billing/plan", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ plan: planKey })
      });

      const payload = (await response.json()) as
        | { ok: true; redirectUrl: string }
        | { ok: false; error: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "billing-plan-update-failed" : payload.error);
      }

      window.location.assign(payload.redirectUrl);
    } catch (error) {
      setNotice({
        tone: "error",
        message: billingErrorMessage(error instanceof Error ? error.message : "billing-plan-update-failed")
      });
    } finally {
      setBillingPlanPending(null);
    }
  }

  async function openBillingPortal() {
    if (billingPortalPending) {
      return;
    }

    setBillingPortalPending(true);

    try {
      const response = await fetch("/dashboard/settings/billing/payment-method", {
        method: "POST"
      });

      const payload = (await response.json()) as
        | { ok: true; redirectUrl: string }
        | { ok: false; error: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "billing-portal-session-failed" : payload.error);
      }

      window.location.assign(payload.redirectUrl);
    } catch (error) {
      setNotice({
        tone: "error",
        message: billingErrorMessage(error instanceof Error ? error.message : "billing-portal-session-failed")
      });
    } finally {
      setBillingPortalPending(false);
    }
  }

  useEffect(() => {
    if (activeSection !== "billing" || billingSyncedRef.current) {
      return;
    }

    billingSyncedRef.current = true;
    void syncBillingFromStripe();
  }, [activeSection]);

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

  const currentProfileName = buildOwnerName(draftSettings.profile);

  const pageTitle = (() => {
    switch (activeSection) {
      case "profile":
        return {
          title: "Profile",
          subtitle: "Manage your personal information and preferences"
        };
      case "notifications":
        return {
          title: "Notifications",
          subtitle: "Choose how you want to be notified"
        };
      case "email":
        return {
          title: "Email",
          subtitle: "Configure email notifications and templates"
        };
      case "billing":
        return {
          title: "Plans & Billing",
          subtitle: "Manage your subscription and payment methods"
        };
    }
  })();

  return (
    <>
      <DashboardTopNotice notice={notice} />
      <DashboardSettingsScaffold
        activeSection={activeSection}
        onSetActiveSection={setActiveSection}
        isDirty={isDirty}
        isSaving={isSaving}
        onDiscard={handleDiscard}
        onSave={handleSave}
      >
        {activeSection === "profile" ? (
          <SettingsProfileSection
            title={pageTitle.title}
            subtitle={pageTitle.subtitle}
            profile={draftSettings.profile}
            currentProfileName={currentProfileName}
            fileInputRef={fileInputRef}
            passwordDraft={passwordDraft}
            passwordExpanded={passwordExpanded}
            passwordMeter={passwordMeter}
            onUpdateProfile={updateProfile}
            onAvatarPick={handleAvatarPick}
            onSetPasswordExpanded={setPasswordExpanded}
            onSetPasswordDraft={setPasswordDraft}
          />
        ) : null}
        {activeSection === "notifications" ? (
          <SettingsNotificationsSection
            title={pageTitle.title}
            subtitle={pageTitle.subtitle}
            notifications={draftSettings.notifications}
            onUpdateNotifications={updateNotifications}
          />
        ) : null}
        {activeSection === "email" ? (
          <SettingsEmailSection
            title={pageTitle.title}
            subtitle={pageTitle.subtitle}
            email={draftSettings.email}
            profileEmail={draftSettings.profile.email}
            profileName={currentProfileName}
            onUpdateEmail={updateEmail}
            onNotice={setNotice}
          />
        ) : null}
        {activeSection === "billing" ? (
          <SettingsBillingSection
            title={pageTitle.title}
            subtitle={pageTitle.subtitle}
            billing={billing}
            billingPlanPending={billingPlanPending}
            billingPortalPending={billingPortalPending}
            billingSyncPending={billingSyncPending}
            onOpenBillingPortal={openBillingPortal}
            onChangePlan={handleBillingPlanChange}
            onSyncBilling={() => void syncBillingFromStripe()}
          />
        ) : null}
      </DashboardSettingsScaffold>
    </>
  );
}
