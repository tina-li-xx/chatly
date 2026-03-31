"use client";

import { DashboardLink } from "./dashboard-shell";

export function DashboardWidgetInstallLink({
  label,
  className
}: {
  label: string;
  className: string;
}) {
  return (
    <DashboardLink href="/dashboard/widget" className={className}>
      {label}
    </DashboardLink>
  );
}
