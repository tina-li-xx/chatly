"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  ChatBubbleIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  CopyIcon,
  ExternalLinkIcon,
  GlobeIcon
} from "../dashboard/dashboard-ui";
import {
  copyButtonLabel,
  previewAvatarInitials,
  previewGreeting,
  previewStatus,
  previewWidgetTitle,
  STEP_META,
  type OnboardingFlowStep,
  type WidgetDraft
} from "./onboarding-flow-shared";

export function InstallSnippetBlock({
  snippet,
  copied,
  onCopy
}: {
  snippet: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="relative mt-4 rounded-[22px] bg-slate-950 p-5 text-[13px] leading-6 text-slate-100">
      <button
        type="button"
        onClick={onCopy}
        className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white"
      >
        <CopyIcon className="h-3.5 w-3.5" />
        {copyButtonLabel(copied)}
      </button>
      <pre className="whitespace-pre-wrap pr-28">{snippet}</pre>
    </div>
  );
}

export function SuccessActionCard({
  title,
  description,
  icon,
  iconClassName,
  href,
  onClick
}: {
  title: string;
  description: string;
  icon: ReactNode;
  iconClassName: string;
  href?: string | null;
  onClick?: () => void;
}) {
  const content = (
    <div className="group flex items-center gap-4 rounded-[18px] border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-600" />
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="block">
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className="block w-full">
      {content}
    </button>
  );
}

function PreviewAvatarBadge({
  draft,
  fallbackTeamName,
  compact = false
}: {
  draft: WidgetDraft;
  fallbackTeamName: string;
  compact?: boolean;
}) {
  const size = compact ? "h-8 w-8 text-xs" : "h-11 w-11 text-sm";

  if (draft.avatarStyle === "icon") {
    return (
      <span className={`flex items-center justify-center rounded-full bg-white/18 text-white ${size}`}>
        <ChatBubbleIcon className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} />
      </span>
    );
  }

  if (draft.avatarStyle === "photos") {
    if (draft.teamPhotoUrl) {
      return (
        <span className={`block overflow-hidden rounded-full bg-white/18 ${size}`}>
          <img src={draft.teamPhotoUrl} alt={previewWidgetTitle(draft, fallbackTeamName)} className="h-full w-full object-cover" />
        </span>
      );
    }

    return (
      <span className={`flex items-center justify-center rounded-full bg-white/18 ${size}`}>
        <span className={compact ? "h-3.5 w-3.5 rounded-full bg-white/70" : "h-5 w-5 rounded-full bg-white/70"} />
      </span>
    );
  }

  return (
    <span className={`flex items-center justify-center rounded-full bg-white/18 font-semibold text-white ${size}`}>
      {previewAvatarInitials(draft, fallbackTeamName)}
    </span>
  );
}

export function StepProgress({ activeStep }: { activeStep: OnboardingFlowStep }) {
  const activeIndex = STEP_META.findIndex((item) => item.step === activeStep);

  return (
    <div className="mb-12">
      <div className="flex items-start">
        {STEP_META.map((item, index) => {
          const complete = index < activeIndex;
          const current = index === activeIndex;
          const isLast = index === STEP_META.length - 1;

          return (
            <div key={item.step} className="flex min-w-0 flex-1 items-start">
              <div className="flex shrink-0 flex-col items-center text-center">
                <div
                  className={[
                    "h-3 w-3 rounded-full transition-all",
                    complete || current ? "bg-blue-600" : "bg-slate-200",
                    current ? "scale-125 ring-4 ring-blue-100" : ""
                  ].join(" ")}
                />
                <p className="mt-3 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 sm:text-[11px]">
                  {item.title}
                </p>
              </div>
              {!isLast ? (
                <div
                  className={[
                    "mx-3 mt-[6px] h-[2px] flex-1 transition-all",
                    complete ? "bg-blue-600" : "bg-slate-200"
                  ].join(" ")}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PreviewWidget({
  draft,
  fallbackTeamName
}: {
  draft: WidgetDraft;
  fallbackTeamName: string;
}) {
  const title = previewWidgetTitle(draft, fallbackTeamName);
  const headerStatus = previewStatus(draft);
  const launcherClass = draft.launcherPosition === "left" ? "left-10" : "right-10";

  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="relative w-full max-w-[760px] overflow-hidden rounded-[32px] border border-white/70 bg-white/88 shadow-[0_30px_90px_rgba(37,99,235,0.12)] backdrop-blur">
        <div className="flex h-11 items-center gap-2 border-b border-slate-200 bg-slate-100/90 px-4">
          <span className="h-3 w-3 rounded-full bg-rose-300" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-emerald-300" />
          <div className="ml-4 h-7 w-full rounded-full bg-white/80" />
        </div>

        <div className="relative h-[520px] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_28%),linear-gradient(180deg,#F8FAFC_0%,#EFF6FF_100%)] px-8 py-8 sm:px-10 sm:py-10">
          <div className="grid gap-5 opacity-80 sm:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="h-4 w-2/3 rounded-full bg-slate-200" />
              <div className="h-3 w-1/2 rounded-full bg-slate-200" />
              <div className="grid gap-4 pt-6 sm:grid-cols-2">
                <div className="h-40 rounded-[30px] bg-white/75 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]" />
                <div className="h-40 rounded-[30px] bg-white/75 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]" />
              </div>
            </div>
            <div className="space-y-4 pt-8 sm:pt-12">
              <div className="h-24 rounded-[28px] bg-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]" />
              <div className="h-32 rounded-[28px] bg-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]" />
            </div>
          </div>

          <div
            className={[
              "absolute bottom-8 z-10 w-[min(100%,376px)] rounded-[26px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(37,99,235,0.14)]",
              launcherClass
            ].join(" ")}
          >
            <div className="rounded-t-[26px] px-5 py-4 text-white" style={{ backgroundColor: draft.brandColor }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PreviewAvatarBadge draft={draft} fallbackTeamName={fallbackTeamName} />
                  <div>
                    <p className="text-[15px] font-semibold">{title}</p>
                    {headerStatus ? <p className="mt-1 text-sm text-white/80">{headerStatus}</p> : null}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <span>−</span>
                  <span>×</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-white px-5 py-5 text-sm text-slate-700">
              <div className="max-w-[82%] rounded-[20px] bg-slate-100 px-4 py-3">
                {previewGreeting(draft).slice(0, 72)}
              </div>
              <div className="ml-auto max-w-[85%] rounded-[20px] px-4 py-3 text-white" style={{ backgroundColor: draft.brandColor }}>
                Happy to help. What would you like to know?
              </div>
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-slate-500">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-300" />
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-200 [animation-delay:120ms]" />
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-100 [animation-delay:240ms]" />
                Sarah is typing...
              </div>
            </div>

            <div className="border-t border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between rounded-full bg-slate-50 px-4 py-3 text-slate-400">
                <span>Type a message...</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ backgroundColor: draft.brandColor }}>
                  →
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VerifiedInstallPreview({ draft }: { draft: WidgetDraft }) {
  const title = previewWidgetTitle(draft, draft.name);
  const headerStatus = previewStatus(draft);
  const widgetSideClass = draft.launcherPosition === "left" ? "left-5" : "right-5";

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-[560px]">
        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_22px_70px_rgba(37,99,235,0.12)]">
          <div className="flex h-10 items-center gap-2 border-b border-slate-200 bg-slate-100 px-4">
            <span className="h-3 w-3 rounded-full bg-rose-300" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-emerald-300" />
            <div className="ml-6 rounded-full bg-slate-200 px-4 py-1 text-xs font-medium text-slate-500">Your site</div>
          </div>

          <div className="relative h-[340px] overflow-hidden bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_100%)] px-6 py-6">
            <div className="space-y-4 opacity-50">
              <div className="h-4 w-40 rounded-full bg-slate-200" />
              <div className="h-3 w-52 rounded-full bg-slate-200" />
              <div className="h-3 w-44 rounded-full bg-slate-200" />
              <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_1.1fr]">
                <div className="h-32 rounded-[24px] bg-slate-100" />
                <div className="h-40 rounded-[24px] bg-slate-100" />
              </div>
            </div>

            <div className={`absolute bottom-5 ${widgetSideClass} w-[300px] rounded-[22px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(37,99,235,0.18)]`}>
              <div className="flex items-center justify-between rounded-t-[22px] px-4 py-3 text-white" style={{ backgroundColor: draft.brandColor }}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                    <span className="truncate text-sm font-semibold">{title}</span>
                  </div>
                  {headerStatus ? <p className="mt-1 truncate text-xs text-white/80">{headerStatus}</p> : null}
                </div>
              </div>

              <div className="space-y-3 bg-white px-4 py-4 text-sm text-slate-700">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  {previewGreeting(draft).slice(0, 62)}
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                </div>
              </div>

              <div className="border-t border-slate-200 px-4 py-4">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-400">
                  <span className="flex-1">Type a message...</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ backgroundColor: draft.brandColor }}>
                    △
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            Widget is live!
          </div>
          <p className="text-sm text-slate-500">Visitors can now start chatting with you</p>
        </div>
      </div>
    </div>
  );
}

export function SuccessConfetti() {
  const pieces = Array.from({ length: 32 }, (_, index) => index);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece}
          className="absolute top-0 h-3 w-2 rounded-full confetti-piece"
          style={
            {
              left: `${(piece % 8) * 12 + 4}%`,
              animationDelay: `${piece * 80}ms`,
              backgroundColor: ["#2563EB", "#7C3AED", "#16A34A", "#F59E0B", "#DB2777"][piece % 5]
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
