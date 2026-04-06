"use client";

import type { DashboardAiAssistUsageActivity } from "@/lib/data/settings-ai-assist-usage";
import { classNames } from "@/lib/utils";

function toneClass(
  item: Pick<DashboardAiAssistUsageActivity, "feature" | "action" | "edited">,
  bordered: boolean
) {
  if (item.feature === "summary") {
    return bordered ? "border-purple-200 bg-purple-50 text-purple-700" : "bg-purple-50 text-purple-700";
  }

  if (item.action === "dismissed") {
    return bordered ? "border-slate-200 bg-slate-100 text-slate-600" : "bg-slate-100 text-slate-600";
  }

  if (item.action === "used" && item.edited) {
    return bordered ? "border-blue-200 bg-blue-50 text-blue-700" : "bg-blue-50 text-blue-700";
  }

  if (item.action === "applied" || item.action === "used") {
    return bordered ? "border-green-200 bg-green-50 text-green-700" : "bg-green-50 text-green-700";
  }

  return bordered ? "border-blue-200 bg-blue-50 text-blue-700" : "bg-blue-50 text-blue-700";
}

function labelForAction(
  item: Pick<DashboardAiAssistUsageActivity, "action" | "edited" | "editLevel">,
  titleCase: boolean
) {
  if (item.action === "used" && item.editLevel === "light") {
    return titleCase ? "Used (lightly edited)" : "used (lightly edited)";
  }

  if (item.action === "used" && item.editLevel === "heavy") {
    return titleCase ? "Used (heavily edited)" : "used (heavily edited)";
  }

  if (item.action === "used" && item.edited) {
    return titleCase ? "Used (edited)" : "used (edited)";
  }

  if (!titleCase) {
    return item.action;
  }

  return item.action === "shown"
    ? "Generated"
    : item.action.charAt(0).toUpperCase() + item.action.slice(1);
}

export function DashboardAiAssistActivityBadge({
  item,
  explanation,
  bordered = false,
  titleCase = false,
  className
}: {
  item: Pick<
    DashboardAiAssistUsageActivity,
    "feature" | "action" | "edited" | "editLevel"
  >;
  explanation: string;
  bordered?: boolean;
  titleCase?: boolean;
  className?: string;
}) {
  return (
    <span
      title={explanation}
      className={classNames(
        "inline-flex px-2 py-0.5 text-xs font-medium",
        bordered ? "rounded-md border" : "rounded-full",
        toneClass(item, bordered),
        className
      )}
    >
      {labelForAction(item, titleCase)}
    </span>
  );
}
