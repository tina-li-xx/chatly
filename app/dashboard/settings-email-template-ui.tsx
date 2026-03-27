"use client";

import type { RefObject } from "react";
import type {
  DashboardEmailTemplate,
  DashboardEmailTemplateKey
} from "@/lib/email-templates";
import { formatEmailTemplateTimestamp } from "@/lib/email-templates";
import { classNames } from "@/lib/utils";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  DotsVerticalIcon,
  LaptopIcon,
  PhoneIcon,
  XIcon
} from "./dashboard-ui";
import {
  DASHBOARD_INPUT_CLASS,
  DASHBOARD_PRIMARY_BUTTON_CLASS,
  DASHBOARD_SECONDARY_BUTTON_CLASS
} from "./dashboard-controls";

export type PreviewDevice = "desktop" | "mobile";

const TEMPLATE_ICON_MAP: Record<
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
  return templates.map((template) => (template.key === nextTemplate.key ? nextTemplate : template));
}

function ToolbarButton({
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

export function SettingsEmailTemplateList({
  templates,
  menuTemplateKey,
  sendingTestKey,
  onOpenTemplateEditor,
  onToggleEnabled,
  onToggleMenu,
  onSendTest,
  onResetTemplate
}: {
  templates: DashboardEmailTemplate[];
  menuTemplateKey: DashboardEmailTemplateKey | null;
  sendingTestKey: DashboardEmailTemplateKey | null;
  onOpenTemplateEditor: (template: DashboardEmailTemplate) => void;
  onToggleEnabled: (template: DashboardEmailTemplate) => void;
  onToggleMenu: (templateKey: DashboardEmailTemplateKey) => void;
  onSendTest: (template: Pick<DashboardEmailTemplate, "key" | "subject" | "body">) => void;
  onResetTemplate: (templateKey: DashboardEmailTemplateKey) => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div>
          <h3 className="text-base font-medium text-slate-900">Email templates</h3>
          <p className="mt-1 text-[13px] text-slate-500">Customize emails sent to visitors.</p>
        </div>
      </div>

      <div>
        {templates.map((template) => {
          const icon = TEMPLATE_ICON_MAP[template.icon];
          const menuOpen = menuTemplateKey === template.key;

          return (
            <div
              key={template.key}
              className="group relative flex items-center gap-4 border-b border-slate-100 px-6 py-4 transition hover:bg-slate-50 last:border-b-0"
            >
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
                        template.enabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
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
                      >
                        {sendingTestKey === template.key ? "Sending test..." : "Send test"}
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
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function SettingsEmailTemplateEditor({
  editingTemplate,
  previewDevice,
  textareaRef,
  renderedPreview,
  replyToEmail,
  profileEmail,
  previewTeamName,
  previewVisitorEmail,
  sendingTestKey,
  onClose,
  onUpdateField,
  onInsertIntoBody,
  onInsertVariable,
  onSetPreviewDevice,
  onSendTest,
  onSave,
  variables
}: {
  editingTemplate: DashboardEmailTemplate;
  previewDevice: PreviewDevice;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  renderedPreview: { subject: string; bodyHtml: string } | null;
  replyToEmail: string;
  profileEmail: string;
  previewTeamName: string;
  previewVisitorEmail: string;
  sendingTestKey: DashboardEmailTemplateKey | null;
  onClose: () => void;
  onUpdateField: <K extends keyof DashboardEmailTemplate>(
    key: K,
    value: DashboardEmailTemplate[K]
  ) => void;
  onInsertIntoBody: (before: string, after?: string, placeholder?: string) => void;
  onInsertVariable: (token: string) => void;
  onSetPreviewDevice: (device: PreviewDevice) => void;
  onSendTest: (template: Pick<DashboardEmailTemplate, "key" | "subject" | "body">) => void;
  onSave: () => void;
  variables: Array<{ token: string; description: string }>;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <h3 className="truncate text-lg font-semibold text-slate-900">{editingTemplate.name}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Subject line</span>
            <input
              value={editingTemplate.subject}
              onChange={(event) => onUpdateField("subject", event.target.value)}
              className={DASHBOARD_INPUT_CLASS}
            />
            <p className="text-xs text-slate-400">Use {"{{visitor_name}}"} for personalization.</p>
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Email body</span>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
                <ToolbarButton label="B" onClick={() => onInsertIntoBody("**", "**", "Bold text")} />
                <ToolbarButton label="I" onClick={() => onInsertIntoBody("*", "*", "Italic text")} />
                <ToolbarButton label="U" onClick={() => onInsertIntoBody("__", "__", "Underlined text")} />
                <ToolbarButton
                  label="Link"
                  onClick={() => onInsertIntoBody("[", "](https://example.com)", "Link text")}
                />
                <ToolbarButton label="List" onClick={() => onInsertIntoBody("- ", "", "List item")} />
                <ToolbarButton label="1." onClick={() => onInsertIntoBody("1. ", "", "List item")} />
                <ToolbarButton
                  label="Image"
                  onClick={() => onInsertIntoBody("![Image alt](https://example.com/image.png)", "", "")}
                />
                <ToolbarButton label="Code" onClick={() => onInsertIntoBody("```\n", "\n```", "Code block")} />
                <ToolbarButton label="{{ }}" onClick={() => onInsertVariable("{{visitor_name}}")} />
              </div>

              <textarea
                ref={textareaRef}
                value={editingTemplate.body}
                onChange={(event) => onUpdateField("body", event.target.value)}
                className="min-h-[220px] w-full resize-y border-0 px-4 py-4 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-0"
                placeholder="Write your email body"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Available variables</p>
              <p className="mt-1 text-[13px] text-slate-500">Click to insert into the email body.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => (
                <button
                  key={variable.token}
                  type="button"
                  onClick={() => onInsertVariable(variable.token)}
                  className="rounded-md bg-slate-100 px-3 py-1.5 font-mono text-[13px] text-slate-700 transition hover:bg-blue-100 hover:text-blue-700"
                  title={variable.description}
                >
                  {variable.token}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-700">Preview</p>
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => onSetPreviewDevice("desktop")}
                  className={classNames(
                    "inline-flex h-8 w-8 items-center justify-center rounded-md transition",
                    previewDevice === "desktop" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"
                  )}
                  aria-label="Desktop preview"
                >
                  <LaptopIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onSetPreviewDevice("mobile")}
                  className={classNames(
                    "inline-flex h-8 w-8 items-center justify-center rounded-md transition",
                    previewDevice === "mobile" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-700"
                  )}
                  aria-label="Mobile preview"
                >
                  <PhoneIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-slate-100 p-6">
              <div
                className={classNames(
                  "mx-auto overflow-hidden rounded-lg bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
                  previewDevice === "mobile" ? "w-full max-w-[320px]" : "w-full"
                )}
              >
                <div className="border-b border-slate-100 px-4 py-4">
                  <p className="text-[13px] text-slate-600">From: {previewTeamName} &lt;{replyToEmail || profileEmail}&gt;</p>
                  <p className="mt-1 text-[13px] text-slate-600">To: {previewVisitorEmail}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{renderedPreview?.subject ?? ""}</p>
                </div>
                <div
                  className="px-5 py-5 text-sm leading-6 text-slate-700"
                  dangerouslySetInnerHTML={{ __html: renderedPreview?.bodyHtml ?? "" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={() => onSendTest(editingTemplate)}
            className="text-sm font-medium text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={sendingTestKey === editingTemplate.key}
          >
            {sendingTestKey === editingTemplate.key ? "Sending test..." : "Send test email"}
          </button>

          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className={DASHBOARD_SECONDARY_BUTTON_CLASS}>
              Cancel
            </button>
            <button type="button" onClick={onSave} className={DASHBOARD_PRIMARY_BUTTON_CLASS}>
              Save template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
