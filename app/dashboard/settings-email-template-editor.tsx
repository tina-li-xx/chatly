"use client";

import {
  DASHBOARD_INPUT_CLASS,
  DASHBOARD_PRIMARY_BUTTON_CLASS,
  DASHBOARD_SECONDARY_BUTTON_CLASS
} from "./dashboard-controls";
import { ArrowLeftIcon, XIcon } from "./dashboard-ui";
import { ToolbarButton } from "./settings-email-template-ui-shared";
import type { SettingsEmailTemplateEditorProps } from "./settings-email-template-ui-types";

export function SettingsEmailTemplateEditor({
  editingTemplate,
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
  onSendTest,
  onSave,
  variables
}: SettingsEmailTemplateEditorProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
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
            <h3 className="truncate text-lg font-semibold text-slate-900">
              {editingTemplate.name}
            </h3>
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

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <div className="min-w-0 space-y-6">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Subject line</span>
                <input
                  value={editingTemplate.subject}
                  onChange={(event) => onUpdateField("subject", event.target.value)}
                  className={DASHBOARD_INPUT_CLASS}
                />
                <p className="text-xs text-slate-400">
                  Use {"{{visitor_name}}"} for personalization.
                </p>
              </label>

              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Email body</span>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
                    <ToolbarButton label="B" onClick={() => onInsertIntoBody("**", "**", "Bold text")} />
                    <ToolbarButton label="I" onClick={() => onInsertIntoBody("*", "*", "Italic text")} />
                    <ToolbarButton label="U" onClick={() => onInsertIntoBody("__", "__", "Underlined text")} />
                    <ToolbarButton label="Link" onClick={() => onInsertIntoBody("[", "](https://example.com)", "Link text")} />
                    <ToolbarButton label="List" onClick={() => onInsertIntoBody("- ", "", "List item")} />
                    <ToolbarButton label="1." onClick={() => onInsertIntoBody("1. ", "", "List item")} />
                    <ToolbarButton label="Image" onClick={() => onInsertIntoBody("![Image alt](https://example.com/image.png)", "", "")} />
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
                  <p className="mt-1 text-[13px] text-slate-500">
                    Click to insert into the email body.
                  </p>
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
            </div>

            <div className="min-w-0 space-y-4 border-t border-slate-200 pt-6 lg:sticky lg:top-0 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <p className="text-sm font-medium text-slate-700">Preview</p>
              <div className="rounded-xl bg-slate-100 p-6">
                <div className="mx-auto w-full overflow-hidden rounded-lg bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                  <div className="border-b border-slate-100 px-4 py-4">
                    <p className="text-[13px] text-slate-600">
                      From: {previewTeamName} &lt;{replyToEmail || profileEmail}&gt;
                    </p>
                    <p className="mt-1 text-[13px] text-slate-600">To: {previewVisitorEmail}</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {renderedPreview?.subject ?? ""}
                    </p>
                  </div>
                  <div
                    className="px-5 py-5 text-sm leading-6 text-slate-700"
                    dangerouslySetInnerHTML={{ __html: renderedPreview?.bodyHtml ?? "" }}
                  />
                </div>
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
            aria-busy={sendingTestKey === editingTemplate.key}
          >
            Send test email
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
