"use client";

import { startTransition, useEffect, useState } from "react";
import { isSiteWidgetInstalled } from "@/lib/site-installation";
import type { Site } from "@/lib/types";
import { buildWidgetSettingsPayload } from "@/lib/widget-settings";
import {
  getPlatformSnippet,
  installationCheckErrorMessage,
  photoUploadErrorMessage,
  siteSettingsSignature,
  widgetSaveErrorMessage,
  type InstallPlatform,
  type PreviewDevice,
  type WidgetTab
} from "./dashboard-widget-settings-shared";

export function useDashboardWidgetSettings(initialSites: Site[]) {
  const [savedSites, setSavedSites] = useState(initialSites);
  const [draftSites, setDraftSites] = useState(initialSites);
  const [activeSiteId, setActiveSiteId] = useState(initialSites[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<WidgetTab>("appearance");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [installPlatform, setInstallPlatform] = useState<InstallPlatform>("html");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [saveError, setSaveError] = useState("");
  const [photoActionState, setPhotoActionState] = useState<"idle" | "uploading" | "removing">("idle");
  const [photoError, setPhotoError] = useState("");
  const [verificationState, setVerificationState] = useState<"idle" | "checking">("idle");
  const [verificationError, setVerificationError] = useState("");
  const [autoCheckedSiteIds, setAutoCheckedSiteIds] = useState<string[]>([]);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const activeSite = draftSites.find((site) => site.id === activeSiteId) ?? draftSites[0] ?? null;
  const savedActiveSite = savedSites.find((site) => site.id === activeSiteId) ?? savedSites[0] ?? null;
  const hasUnsavedChanges = Boolean(
    activeSite && savedActiveSite && siteSettingsSignature(activeSite) !== siteSettingsSignature(savedActiveSite)
  );

  useEffect(() => {
    if (!showSavedToast) {
      return;
    }

    const timer = window.setTimeout(() => setShowSavedToast(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showSavedToast]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      const dirty = draftSites.some(
        (site, index) => siteSettingsSignature(site) !== siteSettingsSignature(savedSites[index])
      );
      if (!dirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [draftSites, savedSites]);

  useEffect(() => {
    setPhotoActionState("idle");
    setPhotoError("");
    setVerificationState("idle");
    setVerificationError("");
  }, [activeSiteId]);

  function applyUploadedPhotoSite(nextSite: Site) {
    setSavedSites((current) => current.map((site) => (site.id === nextSite.id ? nextSite : site)));
    setDraftSites((current) =>
      current.map((site) =>
        site.id === nextSite.id
          ? {
              ...site,
              teamPhotoUrl: nextSite.teamPhotoUrl
            }
          : site
      )
    );
  }

  function applyVerifiedInstallationSite(nextSite: Site) {
    setSavedSites((current) => current.map((site) => (site.id === nextSite.id ? nextSite : site)));
    setDraftSites((current) =>
      current.map((site) =>
        site.id === nextSite.id
          ? {
              ...site,
              widgetInstallVerifiedAt: nextSite.widgetInstallVerifiedAt,
              widgetInstallVerifiedUrl: nextSite.widgetInstallVerifiedUrl,
              widgetLastSeenAt: nextSite.widgetLastSeenAt,
              widgetLastSeenUrl: nextSite.widgetLastSeenUrl,
              conversationCount: nextSite.conversationCount
            }
          : site
      )
    );
  }

  function updateActiveSite(updater: (site: Site) => Site) {
    if (!activeSite) {
      return;
    }

    setDraftSites((current) => current.map((site) => (site.id === activeSite.id ? updater(site) : site)));
    setSaveState("idle");
    setSaveError("");
  }

  function discardChanges() {
    if (!activeSite || !savedActiveSite) {
      return;
    }

    setDraftSites((current) => current.map((site) => (site.id === activeSite.id ? savedActiveSite : site)));
    setSaveState("idle");
    setSaveError("");
  }

  async function uploadTeamPhoto(file: File) {
    if (!activeSite) {
      return;
    }

    setPhotoActionState("uploading");
    setPhotoError("");

    try {
      const formData = new FormData();
      formData.append("siteId", activeSite.id);
      formData.append("file", file);

      const response = await fetch("/dashboard/sites/team-photo", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string; site?: Site };

      if (!response.ok || !payload.site) {
        throw new Error(payload.error || "team-photo-upload-failed");
      }

      applyUploadedPhotoSite(payload.site);
      setPhotoActionState("idle");
    } catch (error) {
      setPhotoActionState("idle");
      setPhotoError(photoUploadErrorMessage(error instanceof Error ? error.message : ""));
    }
  }

  async function removeTeamPhoto() {
    if (!activeSite) {
      return;
    }

    setPhotoActionState("removing");
    setPhotoError("");

    try {
      const response = await fetch("/dashboard/sites/team-photo", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          siteId: activeSite.id
        })
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string; site?: Site };

      if (!response.ok || !payload.site) {
        throw new Error(payload.error || "team-photo-delete-failed");
      }

      applyUploadedPhotoSite(payload.site);
      setPhotoActionState("idle");
    } catch (_error) {
      setPhotoActionState("idle");
      setPhotoError("Unable to remove the team photo right now.");
    }
  }

  async function saveChanges() {
    if (!activeSite) {
      return;
    }

    if (!activeSite.domain?.trim()) {
      setSaveState("idle");
      setSaveError(widgetSaveErrorMessage("site-domain-required"));
      return;
    }

    setSaveState("saving");
    setSaveError("");

    try {
      const formData = new FormData();
      formData.append("siteId", activeSite.id);
      formData.append("settings", JSON.stringify(buildWidgetSettingsPayload(activeSite)));

      const response = await fetch("/dashboard/sites/update", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string; site?: Site };

      if (!response.ok || !payload.site) {
        throw new Error(payload.error || "Unable to save widget settings.");
      }

      setSavedSites((current) => current.map((site) => (site.id === payload.site?.id ? payload.site : site)));
      setDraftSites((current) => current.map((site) => (site.id === payload.site?.id ? payload.site : site)));
      setSaveState("saved");
      setShowSavedToast(true);
    } catch (error) {
      setSaveState("idle");
      setSaveError(widgetSaveErrorMessage(error instanceof Error ? error.message : ""));
    }
  }

  async function verifyInstallation() {
    if (!activeSite) {
      return;
    }

    if (!savedActiveSite?.domain) {
      setVerificationError(
        activeSite.domain?.trim()
          ? "Save your site URL first, then check installation."
          : installationCheckErrorMessage("missing-domain", false)
      );
      return;
    }

    setVerificationState("checking");
    setVerificationError("");

    try {
      const response = await fetch("/dashboard/sites/verify-installation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          siteId: activeSite.id
        })
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        detected?: boolean;
        site?: Site;
      };

      if (!response.ok) {
        throw new Error(payload.error || "installation-check-failed");
      }

      if (payload.site) {
        applyVerifiedInstallationSite(payload.site);
      }

      if (!payload.detected) {
        setVerificationError(installationCheckErrorMessage(payload.error || "", Boolean(activeSite.domain)));
      }
    } catch (error) {
      setVerificationError(
        installationCheckErrorMessage(error instanceof Error ? error.message : "", Boolean(activeSite.domain))
      );
    } finally {
      setVerificationState("idle");
      setAutoCheckedSiteIds((current) => (activeSite ? Array.from(new Set([...current, activeSite.id])) : current));
    }
  }

  useEffect(() => {
    if (!activeSite || activeTab !== "installation") {
      return;
    }
    if (isSiteWidgetInstalled(activeSite) || verificationState === "checking" || autoCheckedSiteIds.includes(activeSite.id)) {
      return;
    }

    void verifyInstallation();
  }, [activeSite, activeTab, autoCheckedSiteIds, verificationState]);

  async function copySnippet() {
    if (!activeSite) {
      return;
    }

    try {
      await navigator.clipboard.writeText(getPlatformSnippet(activeSite, installPlatform));
      setCopiedSnippet(true);
      window.setTimeout(() => setCopiedSnippet(false), 2000);
    } catch (_error) {}
  }

  return {
    activeSite,
    activeSiteId,
    activeTab,
    copiedSnippet,
    copySnippet,
    draftSites,
    hasUnsavedChanges,
    installPlatform,
    photoActionState,
    photoError,
    previewDevice,
    saveError,
    saveState,
    savedActiveSite,
    savedSites,
    setActiveSiteId: (value: string) => startTransition(() => setActiveSiteId(value)),
    setActiveTab,
    setInstallPlatform,
    setPreviewDevice,
    showSavedToast,
    updateActiveSite,
    discardChanges,
    removeTeamPhoto,
    saveChanges,
    uploadTeamPhoto,
    verificationError,
    verificationState,
    verifyInstallation
  };
}
