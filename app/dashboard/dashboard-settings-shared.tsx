"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
import type {
  DashboardSettingsData,
  DashboardSettingsNotifications,
  DashboardSettingsProfile
} from "@/lib/data";
import { displayNameFromEmail } from "@/lib/user-display";
import { classNames } from "@/lib/utils";
import {
  BellIcon,
  CreditCardIcon,
  MailIcon,
  UserIcon
} from "./dashboard-ui";

export type SettingsSection = "profile" | "notifications" | "email" | "billing";
export type EditableSettings = Pick<DashboardSettingsData, "profile" | "notifications" | "email">;

export type SettingsNavItem =
  | {
      type: "section";
      value: SettingsSection;
      label: string;
      icon: ComponentType<SVGProps<SVGSVGElement>>;
      description: string;
    }
  | {
      type: "link";
      href: "/dashboard/team" | "/dashboard/widget";
      label: string;
      icon: ComponentType<SVGProps<SVGSVGElement>>;
      description: string;
    };

export const SETTINGS_NAV: Array<{
  label: string;
  items: SettingsNavItem[];
}> = [
  {
    label: "Account",
    items: [
      {
        type: "section",
        value: "profile",
        label: "Profile",
        icon: UserIcon,
        description: "Personal info and preferences"
      }
    ]
  },
  {
    label: "Preferences",
    items: [
      {
        type: "section",
        value: "notifications",
        label: "Notifications",
        icon: BellIcon,
        description: "Alert preferences"
      },
      {
        type: "section",
        value: "email",
        label: "Email",
        icon: MailIcon,
        description: "Email settings and templates"
      }
    ]
  },
  {
    label: "Billing",
    items: [
      {
        type: "section",
        value: "billing",
        label: "Plans & Billing",
        icon: CreditCardIcon,
        description: "Subscription and invoices"
      }
    ]
  }
];

export function editableSignature(value: EditableSettings) {
  return JSON.stringify(value);
}

export function buildOwnerName(profile: DashboardSettingsProfile) {
  const fullName = [profile.firstName.trim(), profile.lastName.trim()].filter(Boolean).join(" ").trim();
  return fullName || displayNameFromEmail(profile.email);
}

export function passwordStrength(password: string) {
  if (!password) {
    return {
      label: "Use at least 8 characters.",
      widthClass: "w-0",
      toneClass: "bg-slate-300"
    };
  }

  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }
  if (/[A-Z]/.test(password)) {
    score += 1;
  }
  if (/[0-9]/.test(password)) {
    score += 1;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  if (score <= 1) {
    return {
      label: "Weak",
      widthClass: "w-1/4",
      toneClass: "bg-red-500"
    };
  }

  if (score === 2) {
    return {
      label: "Fair",
      widthClass: "w-1/2",
      toneClass: "bg-amber-500"
    };
  }

  if (score === 3) {
    return {
      label: "Good",
      widthClass: "w-3/4",
      toneClass: "bg-blue-500"
    };
  }

  return {
    label: "Strong",
    widthClass: "w-full",
    toneClass: "bg-green-500"
  };
}

export function settingsErrorMessage(code: string) {
  switch (code) {
    case "missing_email":
      return "Email is required before we can save your settings.";
    case "email_taken":
      return "That email address is already in use by another account.";
    case "missing_current_password":
      return "Enter your current password before choosing a new one.";
    case "missing_password":
      return "Enter a new password to continue.";
    case "weak_password":
      return "Choose a stronger password with at least 8 characters.";
    case "invalid_current_password":
      return "Your current password is incorrect.";
    case "password_confirm":
      return "Your new password and confirmation do not match.";
    default:
      return "We couldn't save your changes just now.";
  }
}

export function billingErrorMessage(code: string) {
  switch (code) {
    case "stripe_not_configured":
      return "Stripe is not configured yet.";
    case "stripe_checkout_unavailable":
      return "We couldn't open Stripe Checkout right now.";
    case "billing-portal-session-failed":
      return "We couldn't open the Stripe billing portal right now.";
    case "billing-sync-failed":
      return "We couldn't refresh billing from Stripe right now.";
    default:
      return "We couldn't update billing just now.";
  }
}

export function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(amountCents / 100);
}

export function SettingsCard({
  title,
  description,
  actions,
  children,
  className
}: {
  title?: string;
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
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function SettingsSectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={classNames(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full transition",
        checked ? "bg-blue-600" : "bg-slate-300"
      )}
    >
      <span
        className={classNames(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition",
          checked ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}

export function ToggleRow({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg bg-slate-50 px-4 py-4">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="mt-1 text-[13px] text-slate-500">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export function SettingsNavIcon({ icon: Icon }: { icon: ComponentType<SVGProps<SVGSVGElement>> }) {
  return <Icon className="h-[18px] w-[18px]" />;
}
