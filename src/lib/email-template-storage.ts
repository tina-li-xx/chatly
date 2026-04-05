import { buildDefaultDashboardEmailTemplate, TEMPLATE_ORDER } from "@/lib/email-template-config";
import { normalizeDashboardEmailTemplateContent } from "@/lib/email-template-content";
import type {
  DashboardEmailTemplate,
  StoredDashboardEmailTemplate
} from "@/lib/email-template-types";
import { optionalText } from "@/lib/utils";

function normalizeStoredTemplate(input: StoredDashboardEmailTemplate | null | undefined) {
  if (!input || !TEMPLATE_ORDER.includes(input.key)) {
    return null;
  }

  return {
    key: input.key,
    subject:
      optionalText(
        input.subject ? normalizeDashboardEmailTemplateContent(input.subject) : null
      ) ?? buildDefaultDashboardEmailTemplate(input.key).subject,
    body:
      optionalText(input.body ? normalizeDashboardEmailTemplateContent(input.body) : null) ??
      buildDefaultDashboardEmailTemplate(input.key).body,
    enabled: input.enabled ?? true,
    updatedAt: optionalText(input.updatedAt) ?? null
  };
}

export function parseDashboardEmailTemplates(value: string | null | undefined) {
  let stored: StoredDashboardEmailTemplate[] = [];

  if (value) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        stored = parsed as StoredDashboardEmailTemplate[];
      }
    } catch {
      stored = [];
    }
  }

  const byKey = new Map<DashboardEmailTemplate["key"], StoredDashboardEmailTemplate>();

  for (const entry of stored) {
    const normalized = normalizeStoredTemplate(entry);
    if (normalized) {
      byKey.set(normalized.key, normalized);
    }
  }

  return TEMPLATE_ORDER.map((key) => {
    const defaults = buildDefaultDashboardEmailTemplate(key);
    const current = byKey.get(key);

    return current
      ? {
          ...defaults,
          subject: current.subject || defaults.subject,
          body: current.body || defaults.body,
          enabled: current.enabled ?? defaults.enabled,
          updatedAt: current.updatedAt ?? defaults.updatedAt
        }
      : defaults;
  });
}

export function serializeDashboardEmailTemplates(templates: DashboardEmailTemplate[]) {
  const safeTemplates = TEMPLATE_ORDER.map((key) => {
    const current = templates.find((template) => template.key === key);
    const defaults = buildDefaultDashboardEmailTemplate(key);

    return {
      key,
      subject:
        optionalText(
          current?.subject ? normalizeDashboardEmailTemplateContent(current.subject) : null
        ) ?? defaults.subject,
      body:
        optionalText(current?.body ? normalizeDashboardEmailTemplateContent(current.body) : null) ??
        defaults.body,
      enabled: current?.enabled ?? true,
      updatedAt: optionalText(current?.updatedAt) ?? null
    };
  });

  return JSON.stringify(safeTemplates);
}
