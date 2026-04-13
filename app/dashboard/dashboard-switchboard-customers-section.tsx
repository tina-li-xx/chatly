"use client";

import type { KeyboardEvent } from "react";
import { useState } from "react";
import type { FounderWorkspace } from "@/lib/data/founder-switchboard";
import { classNames, formatDateTime, formatRelativeTime } from "@/lib/utils";
import {
  filterSwitchboardWorkspaces,
  switchboardCustomerFilterDescription,
  type SwitchboardCustomerFilter
} from "./dashboard-switchboard-customers-filter";
import { SettingsCard, SettingsSectionHeader } from "./dashboard-settings-shared";
import { DASHBOARD_TABLE_LABEL_CLASS } from "./dashboard-table-styles";
import { DashboardSwitchboardCustomerDrawer } from "./dashboard-switchboard-customer-drawer";
import {
  workspaceLastTouch,
  workspaceStatusLabel,
  workspaceStatusTone
} from "./dashboard-switchboard-format";
import { ChevronRightIcon } from "./dashboard-ui";

function attentionSummary(workspace: FounderWorkspace) {
  if (!workspace.attentionFlags.length) {
    return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Healthy</span>;
  }

  return (
    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
      {workspace.attentionFlags.length} item{workspace.attentionFlags.length === 1 ? "" : "s"}
    </span>
  );
}

function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, onSelect: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelect();
  }
}

export function DashboardSwitchboardCustomersSection({
  workspaces,
  title,
  subtitle,
  activeFilter
}: {
  workspaces: FounderWorkspace[];
  title: string;
  subtitle: string;
  activeFilter: SwitchboardCustomerFilter;
}) {
  const filteredWorkspaces = filterSwitchboardWorkspaces(workspaces, activeFilter);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const selectedWorkspace = filteredWorkspaces.find((workspace) => workspace.ownerUserId === selectedWorkspaceId) ?? null;

  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} />

      <SettingsCard
        title="Workspace rollup"
        description={switchboardCustomerFilterDescription(activeFilter)}
        actions={<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{filteredWorkspaces.length}</span>}
        className="overflow-hidden"
      >
        {filteredWorkspaces.length ? (
          <div className="-mx-6 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50">
                <tr className={classNames("text-left", DASHBOARD_TABLE_LABEL_CLASS)}>
                  <th className="px-5 py-3">Workspace</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Last touch</th>
                  <th className="px-5 py-3">Attention</th>
                  <th className="px-5 py-3"><span className="sr-only">Details</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkspaces.map((workspace) => {
                  const selected = selectedWorkspace?.ownerUserId === workspace.ownerUserId;
                  return (
                    <tr
                      key={workspace.ownerUserId}
                      tabIndex={0}
                      aria-selected={selected}
                      onClick={() => setSelectedWorkspaceId(workspace.ownerUserId)}
                      onKeyDown={(event) => handleRowKeyDown(event, () => setSelectedWorkspaceId(workspace.ownerUserId))}
                      className={classNames(
                        "cursor-pointer border-t border-slate-100 align-top text-sm text-slate-600 transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none",
                        selected && "bg-blue-50/60"
                      )}
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">{workspace.teamName}</p>
                        <a
                          href={`mailto:${workspace.ownerEmail}`}
                          onClick={(event) => event.stopPropagation()}
                          className="mt-1 block text-blue-600 hover:text-blue-700"
                        >
                          {workspace.ownerEmail}
                        </a>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${workspaceStatusTone(workspace)}`}>{workspace.planName} • {workspaceStatusLabel(workspace)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900" title={formatDateTime(workspaceLastTouch(workspace))}>{formatRelativeTime(workspaceLastTouch(workspace))}</p>
                      </td>
                      <td className="px-5 py-4">{attentionSummary(workspace)}</td>
                      <td className="px-5 py-4 text-right text-slate-300">
                        <ChevronRightIcon className="inline h-4 w-4" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-sm leading-6 text-slate-500">No workspaces match this filter yet.</div>
        )}
      </SettingsCard>

      <DashboardSwitchboardCustomerDrawer
        workspace={selectedWorkspace}
        onClose={() => setSelectedWorkspaceId(null)}
      />
    </div>
  );
}
