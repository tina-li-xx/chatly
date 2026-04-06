"use client";

import { ButtonLink } from "../components/ui/Button";
import { DashboardAiAssistActivityBadge } from "./dashboard-ai-assist-activity-badge";
import type { DashboardAiAssistUsageSnapshot } from "@/lib/data/settings-ai-assist-usage";
import {
  describeDashboardAiAssistActivity,
  explainDashboardAiAssistActivity,
  formatDashboardAiAssistConversationPreview
} from "@/lib/data/settings-ai-assist-activity-copy";
import { ChevronRightIcon } from "./dashboard-ui";

function aiAssistActivityHref() {
  return "/dashboard/analytics?section=aiAssist&activity=all";
}

export function DashboardAnalyticsAiAssistActivityLog({
  activity
}: {
  activity: DashboardAiAssistUsageSnapshot["activity"];
}) {
  return (
    <div className="rounded-xl border border-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <h4 className="text-base font-medium text-slate-900">Recent activity</h4>
        {activity.length ? (
          <ButtonLink
            href={aiAssistActivityHref()}
            size="md"
            variant="secondary"
            trailingIcon={<ChevronRightIcon className="h-4 w-4" />}
            className="h-auto border-0 bg-transparent px-0 text-sm text-slate-500 hover:bg-transparent hover:text-slate-700"
          >
            View all
          </ButtonLink>
        ) : null}
      </div>
      <div className="divide-y divide-slate-100">
        {activity.length ? activity.map((item) => {
          const explanation = explainDashboardAiAssistActivity(item);
          const conversationPreview = formatDashboardAiAssistConversationPreview(
            item.conversationPreview
          );

          return (
            <div key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.actorLabel}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-600">{describeDashboardAiAssistActivity(item)}</span>
                  <DashboardAiAssistActivityBadge item={item} explanation={explanation} />
                </div>
                {conversationPreview ? (
                  <p className="mt-1 text-[13px] text-slate-500">{conversationPreview}</p>
                ) : null}
              </div>
              <p className="text-[13px] text-slate-400">{new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" }).format(new Date(item.createdAt))}</p>
            </div>
          );
        }) : (
          <div className="px-5 py-8 text-sm text-slate-500">No AI activity yet in this billing cycle.</div>
        )}
      </div>
    </div>
  );
}
