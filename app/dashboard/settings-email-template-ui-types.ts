"use client";

import type { RefObject } from "react";
import type {
  DashboardEmailTemplate,
  DashboardEmailTemplateKey
} from "@/lib/email-templates";

export type SettingsEmailTemplateListProps = {
  templates: DashboardEmailTemplate[];
  menuTemplateKey: DashboardEmailTemplateKey | null;
  sendingTestKey: DashboardEmailTemplateKey | null;
  onOpenTemplateEditor: (template: DashboardEmailTemplate) => void;
  onToggleEnabled: (template: DashboardEmailTemplate) => void;
  onToggleMenu: (templateKey: DashboardEmailTemplateKey) => void;
  onSendTest: (template: Pick<DashboardEmailTemplate, "key" | "subject" | "body">) => void;
  onResetTemplate: (templateKey: DashboardEmailTemplateKey) => void;
};

export type SettingsEmailTemplateEditorProps = {
  editingTemplate: DashboardEmailTemplate;
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
  onSendTest: (template: Pick<DashboardEmailTemplate, "key" | "subject" | "body">) => void;
  onSave: () => void;
  variables: Array<{ token: string; description: string }>;
};
