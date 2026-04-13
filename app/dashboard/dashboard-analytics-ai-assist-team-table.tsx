"use client";

import { useState } from "react";
import type { DashboardAiAssistTeamMemberUsage } from "@/lib/data/settings-ai-assist-usage";
import { classNames } from "@/lib/utils";
import { DASHBOARD_TABLE_LABEL_CLASS } from "./dashboard-table-styles";
import { ChevronDownIcon } from "./dashboard-ui";

type SortKey = "requests" | "used" | "acceptanceRate" | "summaries";

function sortedRows(
  rows: DashboardAiAssistTeamMemberUsage[],
  sortKey: SortKey,
  direction: "asc" | "desc"
) {
  return [...rows].sort((left, right) => {
    const comparison =
      (left[sortKey] as number) - (right[sortKey] as number) ||
      left.actorLabel.localeCompare(right.actorLabel);

    return direction === "asc" ? comparison : comparison * -1;
  });
}

export function DashboardAnalyticsAiAssistTeamTable({
  rows
}: {
  rows: DashboardAiAssistTeamMemberUsage[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("requests");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const visibleRows = sortedRows(rows, sortKey, sortDirection);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-medium text-slate-900">By team member</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className={classNames("px-4 py-3 text-left", DASHBOARD_TABLE_LABEL_CLASS)}>
                Name
              </th>
              {[
                ["Requests", "requests"],
                ["Used", "used"],
                ["Acceptance", "acceptanceRate"],
                ["Summaries", "summaries"]
              ].map(([label, value]) => (
                <th
                  key={value}
                  className={classNames("px-4 py-3 text-left", DASHBOARD_TABLE_LABEL_CLASS)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (sortKey === value) {
                        setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
                        return;
                      }

                      setSortKey(value as SortKey);
                      setSortDirection("desc");
                    }}
                    className="inline-flex items-center gap-1"
                  >
                    <span>{label}</span>
                    <ChevronDownIcon
                      className={`h-3.5 w-3.5 transition ${sortKey === value && sortDirection === "asc" ? "rotate-180" : ""}`}
                    />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={`${row.actorUserId ?? row.actorEmail ?? row.actorLabel}`} className="border-t border-slate-100 text-sm text-slate-700">
                <td className="px-4 py-4 font-medium text-slate-900">{row.actorLabel}</td>
                <td className="px-4 py-4">{row.requests}</td>
                <td className="px-4 py-4">{row.used}</td>
                <td className={`px-4 py-4 ${row.acceptanceRate < 50 ? "text-amber-600" : "text-slate-700"}`}>
                  {row.acceptanceRate}%
                </td>
                <td className="px-4 py-4">{row.summaries}</td>
              </tr>
            ))}
            {!visibleRows.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-sm text-slate-500">
                  No team member usage yet in this billing cycle.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
