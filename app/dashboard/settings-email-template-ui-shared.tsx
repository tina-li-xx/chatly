"use client";

import type { DashboardEmailTemplate } from "@/lib/email-templates";

export const TEMPLATE_ICON_MAP: Record<
  DashboardEmailTemplate["icon"],
  {
    glyph: string;
    toneClass: string;
  }
> = {
  mail: { glyph: "✉", toneClass: "bg-blue-50 text-blue-600" },
  transcript: { glyph: "▤", toneClass: "bg-purple-50 text-purple-600" },
  welcome: { glyph: "✦", toneClass: "bg-amber-50 text-amber-600" },
  follow_up: { glyph: "◷", toneClass: "bg-green-50 text-green-600" },
  survey: { glyph: "★", toneClass: "bg-rose-50 text-rose-600" }
};

export function replaceTemplate(
  templates: DashboardEmailTemplate[],
  nextTemplate: DashboardEmailTemplate
) {
  return templates.map((template) =>
    template.key === nextTemplate.key ? nextTemplate : template
  );
}

export function ToolbarButton({
  label,
  onClick
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {label}
    </button>
  );
}
