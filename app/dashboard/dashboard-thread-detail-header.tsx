import type { DashboardTeamMember } from "@/lib/data/settings-types";
import type { ConversationStatus } from "@/lib/types";
import { classNames } from "@/lib/utils";
import { ConversationAssigneeBadge, findConversationAssignee } from "./dashboard-conversation-assignee";
import { ArrowLeftIcon, InfoIcon } from "./dashboard-ui";

export function renderDashboardThreadDetailHeader(input: {
  name: string;
  secondary: string;
  assignedUserId: string | null;
  status: ConversationStatus;
  teamMembers: DashboardTeamMember[];
  showBackButton: boolean;
  showSidebarInline: boolean;
  updatingStatus: boolean;
  onConversationStatusChange: (status: ConversationStatus) => Promise<void>;
  onBack?: () => void;
  onOpenSidebar?: () => void;
}) {
  const assignee = findConversationAssignee(input.teamMembers, input.assignedUserId);

  return (
    <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
      <div className="flex min-w-0 items-center gap-3">
        {input.showBackButton && input.onBack ? (
          <button
            type="button"
            onClick={input.onBack}
            aria-label="Back to conversations"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
        ) : null}

        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium text-slate-900">{input.name}</p>
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-[13px] font-normal text-slate-500">{input.secondary}</p>
            <ConversationAssigneeBadge assignee={assignee} compact />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={input.updatingStatus}
          onClick={() => input.onConversationStatusChange(input.status === "open" ? "resolved" : "open")}
          className={classNames(
            "rounded-lg px-4 py-2 text-[13px] font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60",
            input.status === "open" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-700 hover:bg-slate-800"
          )}
        >
          {input.updatingStatus ? "Saving..." : input.status === "open" ? "Resolve" : "Reopen"}
        </button>
        {!input.showSidebarInline && input.onOpenSidebar ? (
          <button
            type="button"
            onClick={input.onOpenSidebar}
            aria-label="Open visitor info"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <InfoIcon className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
