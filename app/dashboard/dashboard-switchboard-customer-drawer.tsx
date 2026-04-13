"use client";

import type { FounderWorkspace } from "@/lib/data/founder-switchboard";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { SidebarDivider, SidebarKeyValueRows, SidebarSection } from "./dashboard-side-panel-ui";
import {
  attentionLabel,
  siteHref,
  workspaceLastTouch,
  workspaceStatusLabel,
  workspaceStatusTone
} from "./dashboard-switchboard-format";
import { XIcon } from "./dashboard-ui";

function workspaceInitials(value: string) {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "WS";
}

export function DashboardSwitchboardCustomerDrawer({
  workspace,
  onClose
}: {
  workspace: FounderWorkspace | null;
  onClose: () => void;
}) {
  if (!workspace) {
    return null;
  }

  const workspaceRows = [
    { label: "Owner", value: <a href={`mailto:${workspace.ownerEmail}`} className="text-blue-600 hover:text-blue-700">{workspace.ownerEmail}</a> },
    { label: "Primary domain", value: workspace.primaryDomain ? <a href={siteHref(workspace.primaryDomain)} className="text-blue-600 hover:text-blue-700">{workspace.primaryDomain}</a> : "Not set" },
    { label: "Created", value: formatDateTime(workspace.ownerCreatedAt) },
    { label: "Last touch", value: formatRelativeTime(workspaceLastTouch(workspace)) },
    { label: "Email verified", value: workspace.emailVerifiedAt ? formatDateTime(workspace.emailVerifiedAt) : "Not yet" }
  ] as const;
  const billingRows = [
    { label: "Plan", value: workspace.planName },
    { label: "Status", value: <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${workspaceStatusTone(workspace)}`}>{workspaceStatusLabel(workspace)}</span> },
    { label: "Billing", value: workspace.billingInterval ? `${workspace.billingInterval} billing` : "No billing cadence" },
    { label: "Trial end", value: workspace.trialEndsAt ? formatDateTime(workspace.trialEndsAt) : "No active trial" },
    { label: "Seats", value: `${workspace.seatQuantity}` }
  ] as const;
  const usageRows = [
    { label: "30d conversations", value: `${workspace.conversationsLast30Days}` },
    { label: "7d conversations", value: `${workspace.conversationsLast7Days}` },
    { label: "Open now", value: `${workspace.openConversations}` },
    { label: "Verified installs", value: `${workspace.verifiedWidgetCount}` },
    { label: "Team members", value: `${workspace.teamMemberCount}` },
    { label: "Sites", value: `${workspace.siteCount}` }
  ] as const;

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/25" onClick={onClose}>
      <aside
        className="absolute bottom-0 right-0 top-0 flex w-full max-w-[400px] flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.1)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5">
          <p className="text-base font-medium text-slate-900">Workspace details</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close workspace details"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <section className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[22px] font-medium text-blue-700">
              {workspaceInitials(workspace.teamName)}
            </div>
            <p className="mt-3 text-[15px] font-medium text-slate-900">{workspace.teamName}</p>
            <p className="mt-1 text-[13px] text-slate-500">{workspace.primaryDomain || workspace.ownerEmail}</p>
          </section>

          <SidebarDivider />

          <SidebarSection title="Workspace">
            <SidebarKeyValueRows rows={workspaceRows} />
          </SidebarSection>

          <SidebarDivider />

          <SidebarSection title="Billing">
            <SidebarKeyValueRows rows={billingRows} />
          </SidebarSection>

          <SidebarDivider />

          <SidebarSection title="Usage">
            <SidebarKeyValueRows rows={usageRows} />
          </SidebarSection>

          <SidebarDivider />

          <SidebarSection title="Sites">
            <div className="flex flex-wrap gap-2">
              {workspace.siteDomains.length ? (
                workspace.siteDomains.map((domain) => (
                  <a key={domain} href={siteHref(domain)} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200">
                    {domain}
                  </a>
                ))
              ) : (
                <span className="text-sm text-slate-400">No connected sites yet.</span>
              )}
            </div>
          </SidebarSection>

          <SidebarDivider />

          <SidebarSection title="Attention">
            <div className="flex flex-wrap gap-2">
              {workspace.attentionFlags.length ? (
                workspace.attentionFlags.map((flag) => (
                  <span key={flag} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    {attentionLabel(flag)}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">Healthy right now.</span>
              )}
            </div>
          </SidebarSection>
        </div>
      </aside>
    </div>
  );
}
