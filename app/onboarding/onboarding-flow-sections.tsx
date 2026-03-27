"use client";

import Link from "next/link";
import { FormButton, FormErrorMessage, FormTextField } from "../ui/form-controls";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  GlobeIcon,
  PaintbrushIcon,
  UsersIcon,
  WarningIcon
} from "../dashboard/dashboard-ui";
import {
  INSTALL_TAB_COPY,
  INSTALL_TABS,
  normalizeHexColor,
  RESPONSE_TIME_OPTIONS,
  sanitizeHexInput,
  STEP_META,
  type InstallTab,
  type OnboardingFlowStep,
  type WidgetDraft
} from "./onboarding-flow-shared";
import {
  InstallSnippetBlock,
  SuccessActionCard,
  StepProgress
} from "./onboarding-flow-ui";

export function OnboardingLeftPanel({
  activeStep,
  stepIndex,
  showRightPanel,
  showInstallSuccess,
  siteDraft,
  domain,
  hasSavedDomain,
  brandColorInput,
  customizeError,
  customizeSaving,
  installTab,
  copiedCode,
  installSnippet,
  showVerificationSummary,
  verifying,
  verificationState,
  verificationMessage,
  verifiedSiteUrl,
  verifiedSiteHref,
  onBack,
  onDomainChange,
  onWidgetTitleChange,
  onBrandColorInputChange,
  onBrandColorPickerChange,
  onBrandColorInputBlur,
  onAvatarStyleChange,
  onLauncherPositionChange,
  onShowOnlineStatusToggle,
  onResponseTimeModeChange,
  onCustomizeContinue,
  onInstallTabChange,
  onCopyCode,
  onVerifyInstallation,
  onSkipInstall,
  onCompleteAndGo
}: {
  activeStep: OnboardingFlowStep;
  stepIndex: number;
  showRightPanel: boolean;
  showInstallSuccess: boolean;
  siteDraft: WidgetDraft;
  domain: string;
  hasSavedDomain: boolean;
  brandColorInput: string;
  customizeError: string | null;
  customizeSaving: boolean;
  installTab: InstallTab;
  copiedCode: boolean;
  installSnippet: string;
  showVerificationSummary: boolean;
  verifying: boolean;
  verificationState: "idle" | "verified" | "error";
  verificationMessage: string | null;
  verifiedSiteUrl: string | null;
  verifiedSiteHref: string | null;
  onBack: () => void;
  onDomainChange: (value: string) => void;
  onWidgetTitleChange: (value: string) => void;
  onBrandColorInputChange: (value: string) => void;
  onBrandColorPickerChange: (value: string) => void;
  onBrandColorInputBlur: () => void;
  onAvatarStyleChange: (value: WidgetDraft["avatarStyle"]) => void;
  onLauncherPositionChange: (value: WidgetDraft["launcherPosition"]) => void;
  onShowOnlineStatusToggle: () => void;
  onResponseTimeModeChange: (value: WidgetDraft["responseTimeMode"]) => void;
  onCustomizeContinue: () => void;
  onInstallTabChange: (value: InstallTab) => void;
  onCopyCode: () => void;
  onVerifyInstallation: () => void;
  onSkipInstall: () => void;
  onCompleteAndGo: (path: string) => void;
}) {
  const stepMeta = STEP_META[Math.max(0, stepIndex)];

  return (
    <section
      className={[
        "flex flex-col border-b border-slate-200/80 bg-white px-6 py-8 sm:px-10 lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:px-12 xl:px-14",
        showRightPanel ? "lg:border-r" : ""
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 7.75A2.75 2.75 0 0 1 9.75 5h6.5A2.75 2.75 0 0 1 19 7.75v4.5A2.75 2.75 0 0 1 16.25 15H12.3l-3.44 2.62A.75.75 0 0 1 7 17.03V15.3A2.75 2.75 0 0 1 5 12.65V7.75Zm4 2a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5h-4Z" />
            </svg>
          </div>
          <span className="display-font text-3xl text-slate-900">Chatting</span>
        </Link>

        {activeStep === "install" ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            Back
          </button>
        ) : (
          <div className="h-5 w-12" aria-hidden="true" />
        )}
      </div>

      <div
        className={[
          "mx-auto flex w-full flex-1 flex-col justify-center py-6 lg:py-8",
          activeStep === "install" && !showInstallSuccess ? "max-w-[860px]" : "max-w-[460px]"
        ].join(" ")}
      >
        <StepProgress activeStep={activeStep} />

        {activeStep === "install" && showInstallSuccess ? null : (
          <div className="mb-8">
            <p className="text-sm font-medium text-blue-600">{`Step ${stepIndex + 1} of ${STEP_META.length}`}</p>
            <h1 className="display-font mt-4 text-[2.75rem] leading-tight text-slate-900">{stepMeta.title}</h1>
            <p className="mt-3 text-[15px] leading-7 text-slate-500">
              {activeStep === "customize" && "Match the widget to your brand and choose where it should appear."}
              {activeStep === "install" && "Add one line of code to your site and let Chatting verify the install."}
            </p>
          </div>
        )}

        {activeStep === "customize" ? (
          <div className="space-y-6">
            <FormErrorMessage message={customizeError} />

            <div className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
              <p className="text-sm leading-6 text-slate-500">
                Set the title, look, and status visitors see first. You can fine-tune the rest once you&apos;re in the dashboard.
              </p>

              <div className="mt-5 space-y-5">
                {!hasSavedDomain ? (
                  <FormTextField
                    label="Website URL"
                    name="domain"
                    type="text"
                    value={domain}
                    onChange={onDomainChange}
                    placeholder="https://yoursite.com"
                  />
                ) : null}

                <FormTextField
                  label="Widget title"
                  name="widgetTitle"
                  type="text"
                  value={siteDraft.widgetTitle}
                  onChange={onWidgetTitleChange}
                  placeholder="Talk to the team"
                />

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-slate-700">Brand color</p>
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-slate-400">
                      {siteDraft.brandColor}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <label
                      className="relative flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-2xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)]"
                      style={{ backgroundColor: siteDraft.brandColor }}
                    >
                      <input
                        type="color"
                        value={siteDraft.brandColor}
                        onChange={(event) => onBrandColorPickerChange(event.target.value.toUpperCase())}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        aria-label="Pick brand color"
                      />
                    </label>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700">Pick a color</p>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
                        <span className="font-mono text-sm text-slate-400">#</span>
                        <input
                          type="text"
                          inputMode="text"
                          autoCapitalize="characters"
                          autoCorrect="off"
                          spellCheck={false}
                          value={brandColorInput}
                          onChange={(event) => onBrandColorInputChange(sanitizeHexInput(event.target.value))}
                          onBlur={onBrandColorInputBlur}
                          placeholder="E85D04"
                          className="w-24 bg-transparent font-mono text-sm uppercase tracking-[0.08em] text-slate-600 outline-none placeholder:text-slate-300"
                          aria-label="Brand color hex"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">Avatar style</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      ...(siteDraft.teamPhotoUrl ? ([{ value: "photos" as const, label: "Photo" }] as const) : []),
                      { value: "initials" as const, label: "Initials" },
                      { value: "icon" as const, label: "Chat icon" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onAvatarStyleChange(option.value)}
                        className={[
                          "flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
                          siteDraft.avatarStyle === option.value
                            ? "bg-blue-50 text-blue-700 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.2)]"
                            : "bg-white text-slate-700 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)] hover:bg-slate-50"
                        ].join(" ")}
                      >
                        <span className="text-sm font-semibold">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">Widget position</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      { value: "left" as const, label: "Bottom left" },
                      { value: "right" as const, label: "Bottom right" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onLauncherPositionChange(option.value)}
                        className={[
                          "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                          siteDraft.launcherPosition === option.value
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        ].join(" ")}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[22px] bg-white/80 px-4 py-4 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.14)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Show online status</p>
                      <p className="mt-1 text-xs text-slate-400">Let visitors see when your team is around.</p>
                    </div>
                    <button
                      type="button"
                      onClick={onShowOnlineStatusToggle}
                      className={[
                        "relative h-7 w-12 rounded-full transition",
                        siteDraft.showOnlineStatus ? "bg-blue-600" : "bg-slate-200"
                      ].join(" ")}
                      aria-pressed={siteDraft.showOnlineStatus}
                    >
                      <span
                        className={[
                          "absolute top-1 h-5 w-5 rounded-full bg-white transition",
                          siteDraft.showOnlineStatus ? "left-6" : "left-1"
                        ].join(" ")}
                      />
                    </button>
                  </div>

                  {siteDraft.showOnlineStatus ? (
                    <label className="mt-4 block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">Response time</span>
                      <select
                        value={siteDraft.responseTimeMode}
                        onChange={(event) => onResponseTimeModeChange(event.target.value as WidgetDraft["responseTimeMode"])}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition focus:border-blue-500"
                      >
                        {RESPONSE_TIME_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                </div>
              </div>
            </div>

            <FormButton
              type="button"
              fullWidth
              disabled={customizeSaving}
              onClick={onCustomizeContinue}
              trailingIcon={<span aria-hidden="true">→</span>}
            >
              {customizeSaving ? "Saving..." : "Continue"}
            </FormButton>
          </div>
        ) : null}

        {activeStep === "install" ? (
          showInstallSuccess ? (
            <div className="space-y-8">
              <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-6 py-6 text-center shadow-[0_10px_30px_rgba(22,163,74,0.08)]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircleIcon className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-[1.25rem] font-semibold text-emerald-900">Widget detected!</h2>
                <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <GlobeIcon className="h-4 w-4" />
                  <span>{verifiedSiteUrl ?? "Verified on your site"}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900">What&apos;s next?</h3>
                <div className="mt-4 space-y-3">
                  <SuccessActionCard
                    title="Test it yourself"
                    description="Open your site and try the widget"
                    href={verifiedSiteHref}
                    icon={<ExternalLinkIcon className="h-5 w-5" />}
                    iconClassName="bg-blue-50 text-blue-600"
                  />
                  <SuccessActionCard
                    title="Customize more"
                    description="Fine-tune colors and behavior"
                    onClick={() => onCompleteAndGo("/dashboard/widget")}
                    icon={<PaintbrushIcon className="h-5 w-5" />}
                    iconClassName="bg-amber-50 text-amber-600"
                  />
                </div>
              </div>

              <FormButton
                type="button"
                fullWidth
                onClick={() => onCompleteAndGo("/dashboard/inbox")}
                trailingIcon={<ChevronRightIcon className="h-4 w-4" />}
              >
                Go to Inbox
                {siteDraft.conversationCount > 0 ? (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
                    {siteDraft.conversationCount}
                  </span>
                ) : null}
              </FormButton>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm">
                  {INSTALL_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => onInstallTabChange(tab.value)}
                      className={[
                        "rounded-xl px-4 py-2 text-sm font-semibold transition",
                        installTab === tab.value ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                      ].join(" ")}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="mt-5">
                  <p className="text-sm leading-7 text-slate-600">{INSTALL_TAB_COPY[installTab]}</p>
                  <InstallSnippetBlock snippet={installSnippet} copied={copiedCode} onCopy={onCopyCode} />
                </div>
              </div>

              <div className="pt-1">
                {showVerificationSummary ? (
                  <div className="flex items-center gap-3">
                    {verifying ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    ) : (
                      <WarningIcon className="h-5 w-5 text-amber-500" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {verifying ? "Checking installation..." : "Not installed yet"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {verificationMessage ?? "Paste the script, publish your site, then try again."}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className={`${showVerificationSummary ? "mt-5 " : ""}flex flex-col gap-3 sm:flex-row sm:justify-center`}>
                  <FormButton
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={onVerifyInstallation}
                    disabled={verifying}
                  >
                    {verifying ? "Checking..." : verificationState === "idle" ? "Check installation" : "Check again"}
                  </FormButton>
                  <FormButton type="button" variant="secondary" size="md" onClick={onSkipInstall}>
                    Skip for now
                  </FormButton>
                </div>
              </div>
            </div>
          )
        ) : null}
      </div>
    </section>
  );
}
