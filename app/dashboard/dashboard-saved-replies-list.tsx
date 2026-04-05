"use client";

import type { DashboardSavedReply } from "@/lib/data/settings-types";
import { DASHBOARD_ICON_BUTTON_CLASS } from "./dashboard-controls";
import { SettingsCardBody } from "./dashboard-settings-shared";
import { PencilIcon, TrashIcon } from "./dashboard-ui";

export function DashboardSavedRepliesList({
  replies,
  canManage,
  onEdit,
  onDelete
}: {
  replies: DashboardSavedReply[];
  canManage: boolean;
  onEdit: (reply: DashboardSavedReply) => void;
  onDelete: (reply: DashboardSavedReply) => void;
}) {
  return (
    <SettingsCardBody className="space-y-3">
      {replies.map((reply) => (
        <div key={reply.id} className="rounded-lg bg-slate-50 px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{reply.title}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{reply.body}</p>
              {reply.tags.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {reply.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            {canManage ? (
              <div className="flex shrink-0 items-center gap-2 self-start">
                <button
                  type="button"
                  onClick={() => onEdit(reply)}
                  className={DASHBOARD_ICON_BUTTON_CLASS}
                  aria-label={`Edit saved reply ${reply.title}`}
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(reply)}
                  className={DASHBOARD_ICON_BUTTON_CLASS}
                  aria-label={`Delete saved reply ${reply.title}`}
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </SettingsCardBody>
  );
}
