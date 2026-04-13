"use client";

import type { Route } from "next";
import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { classNames } from "@/lib/utils";

const SETTINGS_NAV_ITEM_CLASS = "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition min-h-[76px]";
const SETTINGS_NAV_ITEM_TEXT_CLASS = "min-w-0 flex-1";

export function SettingsCard({
  title,
  description,
  actions,
  children,
  className
}: {
  title?: ReactNode;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={classNames("rounded-xl border border-slate-200 bg-white p-6", className)}>
      {title ? (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-medium text-slate-900">{title}</h3>
            {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function SettingsSectionHeader({
  title,
  subtitle,
  actions
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-3 sm:pt-1">{actions}</div> : null}
    </div>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={classNames(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full transition",
        checked ? "bg-blue-600" : "bg-slate-300",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <span
        className={classNames("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition", checked ? "left-[22px]" : "left-0.5")}
      />
    </button>
  );
}

export function ToggleRow(props: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg bg-slate-50 px-4 py-4">
      <div>
        <p className="text-sm font-medium text-slate-700">{props.label}</p>
        <p className="mt-1 text-[13px] text-slate-600">{props.description}</p>
      </div>
      <ToggleSwitch checked={props.checked} onChange={props.onChange} label={props.label} disabled={props.disabled} />
    </div>
  );
}

export function SettingsNavIcon({ icon: Icon }: { icon: ComponentType<SVGProps<SVGSVGElement>> }) {
  return <Icon className="h-[18px] w-[18px]" />;
}

export function SettingsDesktopNavItem({
  icon,
  label,
  description,
  href,
  active = false,
  onClick,
  prefetch,
  documentNavigation = false
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  description: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  prefetch?: boolean;
  documentNavigation?: boolean;
}) {
  const Icon = icon;
  const iconClassName = classNames("mt-0.5", active ? "text-blue-600" : "text-slate-500");
  const titleClassName = classNames("block text-sm font-medium", active ? "text-blue-600" : "text-slate-700");
  const descriptionClassName = classNames("mt-0.5 block text-xs leading-5", active ? "text-blue-500" : "text-slate-500");
  const content = (
    <>
      <span className={iconClassName}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className={SETTINGS_NAV_ITEM_TEXT_CLASS}>
        <span className={titleClassName}>{label}</span>
        <span className={descriptionClassName}>{description}</span>
      </span>
    </>
  );

  if (href) {
    const className = classNames(
      SETTINGS_NAV_ITEM_CLASS,
      active ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    );
    return (
      <Link
        href={href as Route}
        prefetch={documentNavigation ? false : prefetch}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(SETTINGS_NAV_ITEM_CLASS, active ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")}
    >
      {content}
    </button>
  );
}
