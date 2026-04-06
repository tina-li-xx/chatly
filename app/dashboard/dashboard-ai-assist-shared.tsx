"use client";

import type { ReactNode } from "react";
import { Button, ButtonLink } from "../components/ui/Button";
import { XIcon } from "./dashboard-ui";

const AI_BUTTON_CLASS =
  "h-8 rounded-md !border-purple-200 !bg-purple-50 px-3 text-[13px] font-medium !text-purple-600 shadow-none hover:!border-purple-300 hover:!bg-purple-100 hover:!text-purple-700 disabled:!border-purple-100 disabled:!bg-purple-50 disabled:!opacity-100 disabled:!text-purple-400";
const AI_CARD_CLASS = "rounded-[8px] border border-purple-200 bg-purple-50";
export const AI_TEXT_ACTION_CLASS =
  "h-9 !border-transparent !bg-transparent px-1.5 text-sm text-slate-500 shadow-none hover:!border-transparent hover:!bg-transparent hover:!text-slate-700";

function AiAssistBadge() {
  return (
    <span className="inline-flex rounded-full border border-purple-200 bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-purple-700">
      AI
    </span>
  );
}

export function AiAssistButton(props: {
  label: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      size="md"
      variant="secondary"
      className={AI_BUTTON_CLASS}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      <span className="flex items-center gap-2">
        <span className="text-[12px] leading-none text-purple-500">✦</span>
        <span>{props.label}</span>
      </span>
      <AiAssistBadge />
    </Button>
  );
}

export function AiAssistCard(props: {
  label: string;
  children: ReactNode;
  actions?: ReactNode;
  onDismiss?: () => void;
}) {
  return (
    <div className={`${AI_CARD_CLASS} px-4 py-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <AiAssistBadge />
          <p className="text-xs font-semibold text-purple-700">{props.label}</p>
        </div>
        {props.onDismiss ? (
          <button
            type="button"
            aria-label={`Dismiss ${props.label}`}
            onClick={props.onDismiss}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-purple-400 transition hover:bg-white/70 hover:text-purple-600"
          >
            <XIcon className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <div className="mt-3 text-sm leading-6 text-slate-700">{props.children}</div>
      {props.actions ? (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          {props.actions}
        </div>
      ) : null}
    </div>
  );
}

export function AiAssistLoadingCard({ label }: { label: string }) {
  return (
    <div className={`${AI_CARD_CLASS} flex items-center gap-3 px-4 py-3`}>
      <AiAssistBadge />
      <span className="text-sm font-medium text-purple-700">{label}</span>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-200 border-t-purple-500" />
    </div>
  );
}

export function AiAssistErrorCard(props: {
  title: string;
  description: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4">
      <p className="text-sm font-medium text-red-700">{props.title}</p>
      <p className="mt-1 text-sm text-red-700">{props.description}</p>
      <div className="mt-4 flex justify-end">
        <Button type="button" size="md" variant="secondary" onClick={props.onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

function formatResetLabel(value: string | null) {
  if (!value) {
    return "next month";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short"
  }).format(new Date(value));
}

export function AiAssistLimitCard({ resetsAt }: { resetsAt: string | null }) {
  return (
    <AiAssistCard
      label="✦ AI Assist limit reached"
      actions={
        <ButtonLink href="/dashboard/settings?section=billing" size="md">
          Upgrade now →
        </ButtonLink>
      }
    >
      <p>{`The AI Assist requests included in this billing cycle have been used. Features resume on ${formatResetLabel(resetsAt)}.`}</p>
    </AiAssistCard>
  );
}
