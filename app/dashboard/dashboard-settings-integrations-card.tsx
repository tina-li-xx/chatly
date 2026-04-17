"use client";

import type { ReactNode } from "react";
import { IntegrationCard, IntegrationLogo } from "./dashboard-settings-integrations-primitives";

export function SettingsIntegrationsCard({
  kind,
  title,
  description,
  detail,
  links,
  badge,
  tone,
  actions
}: {
  kind: "slack" | "zapier" | "webhooks" | "shopify";
  title: string;
  description: string;
  detail?: string;
  links?: Array<{ label: string; href: string }>;
  badge?: ReactNode;
  tone?: "default" | "locked" | "warning" | "error";
  actions: ReactNode;
}) {
  return (
    <IntegrationCard tone={tone}>
      <div className="flex items-start justify-between gap-4">
        <IntegrationLogo kind={kind} />
        {badge}
      </div>

      <div className="mt-6">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{detail ?? description}</p>
        {links?.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            {links.map((link, index) => (
              <div key={link.href} className="flex items-center gap-x-3 gap-y-2">
                {index > 0 ? (
                  <span className="text-slate-300" aria-hidden="true">
                    •
                  </span>
                ) : null}
                <a
                  href={link.href}
                  className="font-medium text-blue-700 transition hover:text-blue-800"
                >
                  {link.label}
                </a>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-auto flex justify-end gap-3 pt-6">{actions}</div>
    </IntegrationCard>
  );
}
