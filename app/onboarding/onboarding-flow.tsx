"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trackGrometricsEvent } from "@/lib/grometrics";
import { DEFAULT_BRAND_COLOR } from "@/lib/widget-settings";
import type { Site } from "@/lib/types";
import { OnboardingLeftPanel } from "./onboarding-flow-sections";
import {
  buildNextJsSnippet,
  buildSnippet,
  createWidgetDraft,
  getDetectedInstallUrl,
  normalizeHexColor,
  normalizeSiteHref,
  siteDisplayUrl,
  type InstallTab,
  type OnboardingFlowProps,
  type OnboardingFlowStep,
  type WidgetDraft,
  verifyErrorMessage,
  STEP_META
} from "./onboarding-flow-shared";
import { PreviewWidget, VerifiedInstallPreview } from "./onboarding-flow-ui";

export function OnboardingFlow({
  initialStep,
  initialSite
}: OnboardingFlowProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<OnboardingFlowStep>(initialStep);
  const [siteDraft, setSiteDraft] = useState<WidgetDraft>(createWidgetDraft(initialSite));
  const [brandColorInput, setBrandColorInput] = useState(() =>
    (initialSite?.brandColor ?? DEFAULT_BRAND_COLOR).replace(/^#/, "").toUpperCase()
  );
  const [domain, setDomain] = useState(initialSite?.domain ?? "");
  const [customizeError, setCustomizeError] = useState<string | null>(null);
  const [customizeSaving, setCustomizeSaving] = useState(false);
  const [installTab, setInstallTab] = useState<InstallTab>("code");
  const [copiedCode, setCopiedCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationState, setVerificationState] = useState<"idle" | "verified" | "error">(
    initialSite?.widgetInstallVerifiedAt || initialSite?.widgetLastSeenAt ? "verified" : "idle"
  );
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verifiedUrl, setVerifiedUrl] = useState<string | null>(
    initialSite?.widgetInstallVerifiedAt || initialSite?.widgetLastSeenAt
      ? getDetectedInstallUrl(createWidgetDraft(initialSite))
      : null
  );
  const hasSavedDomain = Boolean(domain.trim());
  const installSnippet = installTab === "nextjs" ? buildNextJsSnippet(siteDraft.id) : buildSnippet(siteDraft.id);
  const showInstallSuccess = verificationState === "verified" && !verifying;
  const showVerificationSummary = verifying || verificationState === "error";

  useEffect(() => {
    setActiveStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    setSiteDraft(createWidgetDraft(initialSite));
    setBrandColorInput((initialSite?.brandColor ?? DEFAULT_BRAND_COLOR).replace(/^#/, "").toUpperCase());
    setDomain(initialSite?.domain ?? "");
    setVerificationState(initialSite?.widgetInstallVerifiedAt || initialSite?.widgetLastSeenAt ? "verified" : "idle");
    setVerifiedUrl(
      initialSite?.widgetInstallVerifiedAt || initialSite?.widgetLastSeenAt
        ? getDetectedInstallUrl(createWidgetDraft(initialSite))
        : null
    );
  }, [initialSite]);

  useEffect(() => {
    if (verificationState !== "verified") {
      return;
    }

    const nextDetectedUrl = getDetectedInstallUrl(siteDraft);
    if (nextDetectedUrl && nextDetectedUrl !== verifiedUrl) {
      setVerifiedUrl(nextDetectedUrl);
    }
  }, [
    siteDraft.domain,
    siteDraft.widgetInstallVerifiedUrl,
    siteDraft.widgetLastSeenUrl,
    verificationState,
    verifiedUrl
  ]);

  function updateDraft(updater: (current: WidgetDraft) => WidgetDraft) {
    setSiteDraft((current) => updater(current));
  }

  async function handleCustomizeContinue() {
    if (!siteDraft.id) {
      setCustomizeError("We couldn't find your workspace yet. Refresh and try again.");
      return;
    }

    setCustomizeSaving(true);
    setCustomizeError(null);

    try {
      const formData = new FormData();
      formData.append("siteId", siteDraft.id);
      formData.append(
        "settings",
        JSON.stringify({
          domain,
          brandColor: siteDraft.brandColor,
          widgetTitle: siteDraft.widgetTitle,
          greetingText: siteDraft.greetingText,
          launcherPosition: siteDraft.launcherPosition,
          avatarStyle: siteDraft.avatarStyle,
          showOnlineStatus: siteDraft.showOnlineStatus,
          requireEmailOffline: siteDraft.requireEmailOffline,
          soundNotifications: siteDraft.soundNotifications,
          autoOpenPaths: siteDraft.autoOpenPaths,
          responseTimeMode: siteDraft.responseTimeMode,
          operatingHoursEnabled: siteDraft.operatingHoursEnabled,
          operatingHoursTimezone: siteDraft.operatingHoursTimezone,
          operatingHours: siteDraft.operatingHours
        })
      );

      const response = await fetch("/dashboard/sites/update", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as
        | { ok: true; site: Site }
        | { ok: false; error: string };

      if (!response.ok || !payload.ok) {
        setCustomizeError(
          payload.ok || payload.error !== "site-domain-required"
            ? "We couldn't save your widget settings right now."
            : "Add your website URL before continuing."
        );
        return;
      }

      await fetch("/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ step: "install" })
      });

      setSiteDraft(createWidgetDraft(payload.site));
      trackGrometricsEvent("widget_settings_saved", {
        source: "onboarding_customize",
        launcher_position: payload.site.launcherPosition,
        show_online_status: payload.site.showOnlineStatus
      });
      setActiveStep("install");
      startTransition(() => {
        router.replace("/onboarding?step=install" as never);
      });
    } catch {
      setCustomizeError("We couldn't save your widget settings right now.");
    } finally {
      setCustomizeSaving(false);
    }
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(installSnippet);
      setCopiedCode(true);
      trackGrometricsEvent("widget_snippet_copied", {
        source: "onboarding_install",
        platform: installTab
      });
      setTimeout(() => setCopiedCode(false), 1600);
    } catch {}
  }

  async function handleVerifyInstallation() {
    if (!siteDraft.id) {
      setVerificationState("error");
      setVerificationMessage("We couldn't find your workspace yet. Refresh and try again.");
      return;
    }

    setVerifying(true);
    setVerificationMessage(null);
    setVerificationState("idle");

    try {
      const response = await fetch("/dashboard/sites/verify-installation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          siteId: siteDraft.id
        })
      });

      const payload = (await response.json()) as
        | { ok: true; detected: boolean; site?: Site; error?: string; checkedUrl?: string }
        | { ok: false; error: string };

      if (!response.ok || !payload.ok || !payload.detected || !payload.site) {
        setVerificationState("error");
        setVerificationMessage(
          verifyErrorMessage(payload.ok ? payload.error ?? "snippet-not-found" : payload.error, Boolean(domain))
        );
        return;
      }

      setSiteDraft(createWidgetDraft(payload.site));
      setVerificationState("verified");
      const detectedUrl = payload.checkedUrl ?? getDetectedInstallUrl(createWidgetDraft(payload.site));
      setVerifiedUrl(detectedUrl);
      setVerificationMessage(`Verified on ${detectedUrl}`);
      trackGrometricsEvent("widget_installation_verified", {
        source: "onboarding_install"
      });
    } catch {
      setVerificationState("error");
      setVerificationMessage("We couldn't verify the widget right now. Try again in a moment.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleSkipInstall() {
    await fetch("/onboarding/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ step: "done" })
    });

    trackGrometricsEvent("onboarding_completed", {
      source: "onboarding_install",
      destination: "/dashboard",
      installation_verified: verificationState === "verified"
    });

    startTransition(() => {
      router.replace("/dashboard" as never);
    });
  }

  async function completeOnboardingAndGo(path: string) {
    try {
      await fetch("/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ step: "done" })
      });
    } catch {}

    trackGrometricsEvent("onboarding_completed", {
      source: "onboarding_install",
      destination: path,
      installation_verified: verificationState === "verified"
    });

    startTransition(() => {
      router.replace(path as never);
    });
  }

  const stepIndex = STEP_META.findIndex((item) => item.step === activeStep);
  const showRightPanel = activeStep === "customize" || (activeStep === "install" && showInstallSuccess);
  const verifiedSiteHref = normalizeSiteHref(verifiedUrl ?? domain);
  const verifiedSiteUrl = siteDisplayUrl(verifiedUrl ?? domain);

  return (
    <main className="min-h-dvh bg-slate-50 p-3 sm:p-4 lg:h-dvh lg:overflow-hidden lg:p-6">
      <div
        className={[
          "mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-[1300px] overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:min-h-[calc(100dvh-2rem)] lg:h-[calc(100dvh-3rem)] lg:min-h-0",
          showRightPanel ? "lg:grid-cols-[minmax(480px,530px)_minmax(0,1fr)]" : "lg:grid-cols-1"
        ].join(" ")}
      >
        <OnboardingLeftPanel
          activeStep={activeStep}
          stepIndex={stepIndex}
          showRightPanel={showRightPanel}
          showInstallSuccess={showInstallSuccess}
          siteDraft={siteDraft}
          domain={domain}
          hasSavedDomain={hasSavedDomain}
          brandColorInput={brandColorInput}
          customizeError={customizeError}
          customizeSaving={customizeSaving}
          installTab={installTab}
          copiedCode={copiedCode}
          installSnippet={installSnippet}
          showVerificationSummary={showVerificationSummary}
          verifying={verifying}
          verificationState={verificationState}
          verificationMessage={verificationMessage}
          verifiedSiteUrl={verifiedSiteUrl}
          verifiedSiteHref={verifiedSiteHref}
          onBack={() => setActiveStep("customize")}
          onDomainChange={(value) => {
            setDomain(value);
            updateDraft((current) => ({ ...current, domain: value }));
          }}
          onWidgetTitleChange={(value) => updateDraft((current) => ({ ...current, widgetTitle: value }))}
          onBrandColorInputChange={(value) => {
            setBrandColorInput(value);
            const normalized = normalizeHexColor(value);
            if (normalized) {
              updateDraft((current) => ({ ...current, brandColor: normalized }));
            }
          }}
          onBrandColorPickerChange={(value) => {
            setBrandColorInput(value.replace(/^#/, ""));
            updateDraft((current) => ({ ...current, brandColor: value }));
          }}
          onBrandColorInputBlur={() => {
            const normalized = normalizeHexColor(brandColorInput);
            if (!normalized) {
              setBrandColorInput(siteDraft.brandColor.replace(/^#/, "").toUpperCase());
            }
          }}
          onAvatarStyleChange={(value) => updateDraft((current) => ({ ...current, avatarStyle: value }))}
          onLauncherPositionChange={(value) => updateDraft((current) => ({ ...current, launcherPosition: value }))}
          onShowOnlineStatusToggle={() =>
            updateDraft((current) => ({ ...current, showOnlineStatus: !current.showOnlineStatus }))
          }
          onResponseTimeModeChange={(value) => updateDraft((current) => ({ ...current, responseTimeMode: value }))}
          onCustomizeContinue={handleCustomizeContinue}
          onInstallTabChange={setInstallTab}
          onCopyCode={handleCopyCode}
          onVerifyInstallation={handleVerifyInstallation}
          onSkipInstall={handleSkipInstall}
          onCompleteAndGo={completeOnboardingAndGo}
        />

        {showRightPanel ? (
          <section className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_24%),linear-gradient(180deg,#F8FAFC_0%,#EFF6FF_100%)] px-8 py-10 lg:flex lg:min-h-0 lg:items-center lg:justify-center xl:px-14">
            {activeStep === "customize" ? (
              <div className="w-full max-w-[960px]">
                <PreviewWidget draft={siteDraft} fallbackTeamName={siteDraft.name} />
              </div>
            ) : null}
            {activeStep === "install" && showInstallSuccess ? (
              <div className="w-full max-w-[980px]">
                <VerifiedInstallPreview draft={siteDraft} />
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}
