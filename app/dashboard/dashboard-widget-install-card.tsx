"use client";

import { DashboardWidgetInstallLink } from "./dashboard-widget-install-link";
import { useWidgetInstallState } from "./use-widget-install-state";

type DashboardWidgetInstallCardProps = {
  initialInstalled: boolean;
  siteIds: string[];
};

export function DashboardWidgetInstallCard({
  initialInstalled,
  siteIds
}: DashboardWidgetInstallCardProps) {
  const installed = useWidgetInstallState(initialInstalled, siteIds);

  if (installed) {
    return null;
  }

  return (
    <article className="rounded-xl bg-gradient-to-br from-blue-700 to-blue-600 p-5 text-white">
      <h2 className="text-base font-semibold">Ready to install?</h2>
      <p className="mb-4 mt-2 text-sm font-normal leading-6 text-blue-100">
        Add the chat widget to your site so visitors can start conversations here.
      </p>
      <DashboardWidgetInstallLink
        label="Check installation"
        className="inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
      />
    </article>
  );
}
