"use client";

import { formatEmailTemplateTimestamp } from "@/lib/email-templates";
import { classNames } from "@/lib/utils";
import { SettingsCard, SettingsCardRow, SettingsCardRows } from "./dashboard-settings-shared";
import { ChevronRightIcon, DotsVerticalIcon } from "./dashboard-ui";
import { TEMPLATE_ICON_MAP } from "./settings-email-template-ui-shared";
import type { SettingsEmailTemplateListProps } from "./settings-email-template-ui-types";

function SettingsEmailTemplateMenu({
  template,
  sendingTestKey,
  onOpenTemplateEditor,
  onSendTest,
  onToggleEnabled,
  onResetTemplate
}: Pick<
  SettingsEmailTemplateListProps,
  "sendingTestKey" | "onOpenTemplateEditor" | "onSendTest" | "onToggleEnabled" | "onResetTemplate"
> & {
  template: SettingsEmailTemplateListProps["templates"][number];
}) {
  return (
    <div className="absolute right-0 top-10 z-10 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
      <button
        type="button"
        onClick={() => onOpenTemplateEditor(template)}
        className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
      >
        Edit template
      </button>
      <button
        type="button"
        onClick={() => onOpenTemplateEditor(template)}
        className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
      >
        Preview
      </button>
      <button
        type="button"
        onClick={() => onSendTest(template)}
        className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
        disabled={Boolean(sendingTestKey)}
        aria-busy={sendingTestKey === template.key}
      >
        Send test
      </button>
      <button
        type="button"
        onClick={() => onToggleEnabled(template)}
        className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
      >
        {template.enabled ? "Disable" : "Enable"}
      </button>
      <button
        type="button"
        onClick={() => onResetTemplate(template.key)}
        className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
      >
        Reset to default
      </button>
    </div>
  );
}

export function SettingsEmailTemplateList({
  templates,
  menuTemplateKey,
  sendingTestKey,
  onOpenTemplateEditor,
  onToggleEnabled,
  onToggleMenu,
  onSendTest,
  onResetTemplate
}: SettingsEmailTemplateListProps) {
  return (
    <SettingsCard title="Email templates" description="Customize emails sent to visitors." className="overflow-hidden">
      <SettingsCardRows>
        {templates.map((template) => {
          const icon = TEMPLATE_ICON_MAP[template.icon];
          const menuOpen = menuTemplateKey === template.key;

          return (
            <SettingsCardRow key={template.key} className="group relative flex items-center gap-4 py-4 transition hover:bg-slate-50">
              <button
                type="button"
                onClick={() => onOpenTemplateEditor(template)}
                className="flex min-w-0 flex-1 items-center gap-4 text-left"
              >
                <div
                  className={classNames(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-lg",
                    icon.toneClass
                  )}
                  aria-hidden="true"
                >
                  {icon.glyph}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{template.name}</p>
                    <span
                      className={classNames(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                        template.enabled
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {template.enabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-slate-500">{template.description}</p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    Last edited: {formatEmailTemplateTimestamp(template.updatedAt)}
                  </p>
                </div>

                <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
              </button>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={template.enabled}
                  aria-label={`Toggle ${template.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleEnabled(template);
                  }}
                  className={classNames(
                    "relative inline-flex h-6 w-11 rounded-full transition",
                    template.enabled ? "bg-blue-600" : "bg-slate-300"
                  )}
                >
                  <span
                    className={classNames(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition",
                      template.enabled ? "left-[22px]" : "left-0.5"
                    )}
                  />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleMenu(template.key);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Open ${template.name} actions`}
                  >
                    <DotsVerticalIcon className="h-4 w-4" />
                  </button>
                  {menuOpen ? (
                    <SettingsEmailTemplateMenu
                      template={template}
                      sendingTestKey={sendingTestKey}
                      onOpenTemplateEditor={onOpenTemplateEditor}
                      onSendTest={onSendTest}
                      onToggleEnabled={onToggleEnabled}
                      onResetTemplate={onResetTemplate}
                    />
                  ) : null}
                </div>
              </div>
            </SettingsCardRow>
          );
        })}
      </SettingsCardRows>
    </SettingsCard>
  );
}
