"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildDashboardEmailTemplatePreviewContext,
  EMAIL_TEMPLATE_VARIABLES,
  getDefaultDashboardEmailTemplates,
  renderDashboardEmailTemplate,
  type DashboardEmailTemplate,
  type DashboardEmailTemplateKey
} from "@/lib/email-templates";
import type { DashboardNoticeTone } from "./dashboard-controls";
import {
  PreviewDevice,
  replaceTemplate,
  SettingsEmailTemplateEditor,
  SettingsEmailTemplateList
} from "./settings-email-template-ui";

export function SettingsEmailTemplates({
  templates,
  notificationEmail,
  replyToEmail,
  profileEmail,
  profileName,
  onChange,
  onNotice
}: {
  templates: DashboardEmailTemplate[];
  notificationEmail: string;
  replyToEmail: string;
  profileEmail: string;
  profileName: string;
  onChange: (templates: DashboardEmailTemplate[]) => void;
  onNotice: (notice: { tone: DashboardNoticeTone; message: string }) => void;
}) {
  const [menuTemplateKey, setMenuTemplateKey] = useState<DashboardEmailTemplateKey | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<DashboardEmailTemplate | null>(null);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [sendingTestKey, setSendingTestKey] = useState<DashboardEmailTemplateKey | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const previewContext = useMemo(
    () => buildDashboardEmailTemplatePreviewContext({ profileEmail, profileName }),
    [profileEmail, profileName]
  );

  const renderedPreview = useMemo(() => {
    if (!editingTemplate) {
      return null;
    }

    return renderDashboardEmailTemplate(editingTemplate, previewContext, {
      highlightVariables: true
    });
  }, [editingTemplate, previewContext]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuTemplateKey(null);
        setEditingTemplate(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function openTemplateEditor(template: DashboardEmailTemplate) {
    setMenuTemplateKey(null);
    setPreviewDevice("desktop");
    setEditingTemplate({ ...template });
  }

  function updateEditingTemplate<K extends keyof DashboardEmailTemplate>(
    key: K,
    value: DashboardEmailTemplate[K]
  ) {
    setEditingTemplate((current) => (current ? { ...current, [key]: value } : current));
  }

  function insertIntoBody(before: string, after = "", placeholder = "") {
    const field = textareaRef.current;
    if (!field || !editingTemplate) {
      return;
    }

    const start = field.selectionStart ?? editingTemplate.body.length;
    const end = field.selectionEnd ?? start;
    const selection = editingTemplate.body.slice(start, end) || placeholder;
    const nextBody =
      editingTemplate.body.slice(0, start) +
      before +
      selection +
      after +
      editingTemplate.body.slice(end);

    updateEditingTemplate("body", nextBody);

    window.requestAnimationFrame(() => {
      field.focus();
      const caret = start + before.length + selection.length + after.length;
      field.setSelectionRange(caret, caret);
    });
  }

  function insertVariable(token: string) {
    insertIntoBody(token, "", "");
  }

  function handleToggleEnabled(template: DashboardEmailTemplate) {
    onChange(
      replaceTemplate(templates, {
        ...template,
        enabled: !template.enabled,
        updatedAt: new Date().toISOString()
      })
    );
  }

  function handleResetTemplate(templateKey: DashboardEmailTemplateKey) {
    const nextTemplate = getDefaultDashboardEmailTemplates().find((template) => template.key === templateKey);
    if (!nextTemplate) {
      return;
    }

    onChange(replaceTemplate(templates, nextTemplate));
    setMenuTemplateKey(null);

    if (editingTemplate?.key === templateKey) {
      setEditingTemplate(nextTemplate);
    }
  }

  function handleSaveTemplate() {
    if (!editingTemplate) {
      return;
    }

    onChange(
      replaceTemplate(templates, {
        ...editingTemplate,
        updatedAt: new Date().toISOString()
      })
    );
    setEditingTemplate(null);
  }

  async function handleSendTest(template: Pick<DashboardEmailTemplate, "key" | "subject" | "body">) {
    if (sendingTestKey) {
      return;
    }

    setSendingTestKey(template.key);

    try {
      const response = await fetch("/dashboard/settings/email-templates/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subject: template.subject,
          body: template.body,
          notificationEmail,
          replyToEmail
        })
      });

      const payload = (await response.json()) as { ok: true } | { ok: false; error: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "email-template-test-failed" : payload.error);
      }

      onNotice({
        tone: "success",
        message: `Sent a test email to ${notificationEmail}`
      });
    } catch (error) {
      onNotice({
        tone: "error",
        message: "We couldn't send the test email just now."
      });
    } finally {
      setSendingTestKey(null);
      setMenuTemplateKey(null);
    }
  }

  return (
    <>
      <SettingsEmailTemplateList
        templates={templates}
        menuTemplateKey={menuTemplateKey}
        sendingTestKey={sendingTestKey}
        onOpenTemplateEditor={openTemplateEditor}
        onToggleEnabled={handleToggleEnabled}
        onToggleMenu={(templateKey) =>
          setMenuTemplateKey((current) => (current === templateKey ? null : templateKey))
        }
        onSendTest={(template) => void handleSendTest(template)}
        onResetTemplate={handleResetTemplate}
      />

      {editingTemplate ? (
        <SettingsEmailTemplateEditor
          editingTemplate={editingTemplate}
          previewDevice={previewDevice}
          textareaRef={textareaRef}
          renderedPreview={renderedPreview}
          replyToEmail={replyToEmail}
          profileEmail={profileEmail}
          previewTeamName={previewContext.teamName}
          previewVisitorEmail={previewContext.visitorEmail}
          sendingTestKey={sendingTestKey}
          onClose={() => setEditingTemplate(null)}
          onUpdateField={updateEditingTemplate}
          onInsertIntoBody={insertIntoBody}
          onInsertVariable={insertVariable}
          onSetPreviewDevice={setPreviewDevice}
          onSendTest={(template) => void handleSendTest(template)}
          onSave={handleSaveTemplate}
          variables={EMAIL_TEMPLATE_VARIABLES}
        />
      ) : null}
    </>
  );
}
