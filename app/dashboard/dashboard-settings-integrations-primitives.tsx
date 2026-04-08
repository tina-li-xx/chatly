"use client";

import type { ReactNode } from "react";
import { classNames } from "@/lib/utils";
import { WarningIcon } from "./dashboard-ui";

type IntegrationTone = "default" | "locked" | "warning" | "error";
type StatusTone = "success" | "warning" | "locked" | "error";

export const INTEGRATION_SELECT_CLASS =
  "h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export function IntegrationCard({
  tone = "default",
  children
}: {
  tone?: IntegrationTone;
  children: ReactNode;
}) {
  return (
    <article
      className={classNames(
        "flex min-h-[180px] flex-col rounded-xl border p-6",
        tone === "warning"
          ? "border-amber-300 bg-amber-50"
          : tone === "error"
            ? "border-rose-200 bg-rose-50"
          : tone === "locked"
            ? "border-slate-200 bg-slate-50"
            : "border-slate-200 bg-white"
      )}
    >
      {children}
    </article>
  );
}

export function IntegrationLogo({ kind }: { kind: "slack" | "zapier" | "webhooks" | "shopify" }) {
  const sharedClassName = "flex h-10 w-10 items-center justify-center";

  if (kind === "slack") {
    return (
      <div className={sharedClassName}>
        <svg viewBox="0 0 40 40" className="h-6 w-6" aria-hidden="true">
          <rect x="5" y="16" width="9" height="5" rx="2.5" fill="#E01E5A" />
          <rect x="9" y="8" width="5" height="11" rx="2.5" fill="#E01E5A" />
          <rect x="16" y="5" width="5" height="9" rx="2.5" fill="#36C5F0" />
          <rect x="19" y="9" width="11" height="5" rx="2.5" fill="#36C5F0" />
          <rect x="26" y="16" width="9" height="5" rx="2.5" fill="#2EB67D" />
          <rect x="26" y="19" width="5" height="11" rx="2.5" fill="#2EB67D" />
          <rect x="16" y="26" width="5" height="9" rx="2.5" fill="#ECB22E" />
          <rect x="9" y="26" width="11" height="5" rx="2.5" fill="#ECB22E" />
        </svg>
      </div>
    );
  }

  if (kind === "zapier") {
    return (
      <div className={sharedClassName}>
        <svg viewBox="0 0 40 40" className="h-6 w-6" aria-hidden="true">
          <path d="M20 4.5v11M20 24.5v11M35.5 20h-11M15.5 20h-11M30.6 9.4l-7.8 7.8M17.2 22.8l-7.8 7.8M30.6 30.6l-7.8-7.8M17.2 17.2l-7.8-7.8" stroke="#FF4F00" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (kind === "shopify") {
    return (
      <div className={sharedClassName}>
        <svg viewBox="0 0 40 40" className="h-6 w-6" aria-hidden="true">
          <path d="M11 13h18l-1.8 16H12.8L11 13Z" fill="#95BF47" />
          <path d="M16 13c.2-3.4 1.9-6 4.8-6 1.9 0 3.2 1.1 4 3.1.7-.4 1.3-.6 2.1-.8L29 13H16Z" fill="#5E8E3E" />
          <path d="M17.8 13c.2-2.4 1.4-4.3 3.2-4.3 1.1 0 1.9.8 2.5 2.2-.9.5-1.8 1.2-2.7 2.1H17.8Z" fill="#FFFFFF" opacity=".28" />
          <path d="M18.5 20.8c.5.4 1.3.8 2.1.8.9 0 1.4-.4 1.4-1s-.4-.9-1.5-1.4c-1.5-.7-2.5-1.7-2.5-3 0-2 1.7-3.6 4.2-3.6 1 0 1.9.2 2.5.6l-.8 2.3c-.4-.2-1-.5-1.8-.5-.9 0-1.4.5-1.4 1 0 .6.6 1 1.7 1.5 1.7.8 2.3 1.8 2.3 3 0 2.3-1.7 3.6-4.3 3.6-1.2 0-2.4-.3-3-.8l1.1-2.5Z" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  return (
    <div className={sharedClassName}>
      <svg viewBox="0 0 40 40" className="h-6 w-6" aria-hidden="true">
        <circle cx="11" cy="12" r="4" fill="#0F172A" />
        <circle cx="29" cy="20" r="4" fill="#2563EB" />
        <circle cx="11" cy="28" r="4" fill="#0EA5E9" />
        <path d="M14.5 13.6 24.8 18M14.5 26.4 24.8 22" stroke="#38BDF8" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function IntegrationStatusBadge({
  tone,
  label
}: {
  tone: StatusTone;
  label: string;
}) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[13px] font-medium",
        tone === "success"
          ? "bg-emerald-50 text-emerald-700"
          : tone === "error"
            ? "bg-rose-100 text-rose-700"
          : tone === "warning"
            ? "bg-amber-100 text-amber-700"
            : "bg-violet-100 text-violet-700"
      )}
    >
      {tone === "success" ? (
        <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
      ) : tone === "warning" ? (
        <WarningIcon className="h-3.5 w-3.5" />
      ) : tone === "error" ? (
        <WarningIcon className="h-3.5 w-3.5" />
      ) : (
        <LockMiniIcon />
      )}
      {label}
    </span>
  );
}

export function IntegrationFieldLabel({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">{children}</p>;
}

export function IntegrationCheckbox({
  checked,
  label,
  description,
  onChange
}: {
  checked: boolean;
  label: string;
  description?: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg py-1 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="space-y-1">
        <span className="block font-medium text-slate-800">{label}</span>
        {description ? <span className="block leading-6 text-slate-500">{description}</span> : null}
      </span>
    </label>
  );
}

export function IntegrationsSkeletonGrid() {
  return (
    <div className="grid max-w-[700px] gap-5 md:grid-cols-2">
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="flex min-h-[180px] flex-col animate-pulse rounded-xl border border-slate-200 bg-white p-6">
          <div className="h-10 w-10 rounded-lg bg-slate-100" />
          <div className="mt-6 h-4 w-28 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-40 rounded bg-slate-100" />
          <div className="mt-1 h-3 w-32 rounded bg-slate-100" />
          <div className="mt-auto ml-auto h-10 w-28 rounded-xl bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function LockMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8.5a4 4 0 0 1 8 0V11" />
    </svg>
  );
}
