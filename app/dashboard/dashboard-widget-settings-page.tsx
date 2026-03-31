"use client";

import type { DashboardBillingSummary } from "@/lib/data/billing-types";
import type { Site } from "@/lib/types";
import { classNames } from "@/lib/utils";
import {
  CheckCircleIcon,
  ChevronDownIcon
} from "./dashboard-ui";
import { WidgetPreviewPane } from "./dashboard-widget-settings-preview-pane";
import { TAB_OPTIONS } from "./dashboard-widget-settings-shared";
import { WidgetAppearancePanel } from "./dashboard-widget-settings-appearance-panel";
import { WidgetBehaviorPanel } from "./dashboard-widget-settings-behavior-panel";
import { WidgetInstallationPanel } from "./dashboard-widget-settings-installation-panel";
import { useDashboardWidgetSettings } from "./use-dashboard-widget-settings";

type DashboardWidgetSettingsPageProps = {
  initialSites: Site[];
  initialBilling: DashboardBillingSummary;
};

export function DashboardWidgetSettingsPage({ initialSites, initialBilling }: DashboardWidgetSettingsPageProps) {
  const {
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
    setActiveSiteId,
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
  } = useDashboardWidgetSettings(initialSites);

  if (!activeSite) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Once you have a site in Chatting, widget settings and the live preview will show up here.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {draftSites.length > 1 ? (
            <div className="relative">
              <select
                value={activeSiteId}
                onChange={(event) => setActiveSiteId(event.target.value)}
                className="h-10 appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-10 text-sm text-slate-700"
              >
                {draftSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          ) : null}

          <button
            type="button"
            onClick={discardChanges}
            disabled={!hasUnsavedChanges || saveState === "saving"}
            className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={saveChanges}
            disabled={!hasUnsavedChanges || saveState === "saving"}
            className={classNames(
              "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium text-white transition disabled:opacity-50",
              saveState === "saved" ? "bg-green-500" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {saveState === "saving" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Saving…</span>
              </>
            ) : saveState === "saved" ? (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </div>

      {saveError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {saveError}
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[480px_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex border-b border-slate-200 bg-slate-50">
            {TAB_OPTIONS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={classNames(
                    "flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition",
                    activeTab === tab.value
                      ? "border-blue-600 bg-white text-slate-900"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-6">
            {activeTab === "appearance" ? (
              <WidgetAppearancePanel
                activeSite={activeSite}
                photoActionState={photoActionState}
                photoError={photoError}
                onUpdateActiveSite={updateActiveSite}
                onUploadTeamPhoto={uploadTeamPhoto}
                onRemoveTeamPhoto={removeTeamPhoto}
              />
            ) : null}

            {activeTab === "behavior" ? (
              <WidgetBehaviorPanel
                activeSite={activeSite}
                proactiveChatUnlocked={initialBilling.features.proactiveChat}
                onUpdateActiveSite={updateActiveSite}
              />
            ) : null}

            {activeTab === "installation" ? (
              <WidgetInstallationPanel
                activeSite={activeSite}
                installPlatform={installPlatform}
                copiedSnippet={copiedSnippet}
                verificationState={verificationState}
                verificationError={verificationError}
                onSetInstallPlatform={setInstallPlatform}
                onCopySnippet={copySnippet}
                onVerifyInstallation={verifyInstallation}
              />
            ) : null}
          </div>
        </section>

        <WidgetPreviewPane site={activeSite} device={previewDevice} onSetPreviewDevice={setPreviewDevice} />
      </div>

      {showSavedToast ? (
        <div className="fixed right-6 top-24 z-30 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
            <span>Widget settings saved</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
