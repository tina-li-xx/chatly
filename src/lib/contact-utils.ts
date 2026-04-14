import type { BillingPlanKey } from "@/lib/billing-plans";
import type {
  ContactCustomFieldDefinition,
  ContactDataRetention,
  ContactStatusColor,
  ContactStatusDefinition,
  ContactWorkspaceSettings
} from "@/lib/contact-types";
import { getContactPlanLimits } from "@/lib/plan-limits";
import { displayNameFromEmail } from "@/lib/user-display";
import { optionalText } from "@/lib/utils";

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `contact-${Date.now()}`;
}


const LEGACY_CONTACT_STATUSES: ContactStatusDefinition[] = [
  { key: "lead", label: "Lead", color: "blue" },
  { key: "trial", label: "Trial", color: "purple" },
  { key: "customer", label: "Customer", color: "green" },
  { key: "vip", label: "VIP", color: "amber" },
  { key: "churned", label: "Churned", color: "gray" }
];

export const DEFAULT_CONTACT_STATUSES: ContactStatusDefinition[] = [];

export const DEFAULT_CONTACT_SETTINGS: ContactWorkspaceSettings = {
  statuses: DEFAULT_CONTACT_STATUSES,
  customFields: [],
  dataRetention: "forever"
};

export function slugifyContactKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function normalizeContactStatusColor(value: string | null | undefined): ContactStatusColor {
  switch (value) {
    case "purple":
    case "green":
    case "amber":
    case "gray":
      return value;
    default:
      return "blue";
  }
}

function normalizeStatus(entry: ContactStatusDefinition | null | undefined) {
  const label = optionalText(entry?.label) ?? "Status";
  return {
    key: slugifyContactKey(entry?.key || label) || createId().slice(0, 8),
    label,
    color: normalizeContactStatusColor(entry?.color)
  } satisfies ContactStatusDefinition;
}

function normalizeField(entry: ContactCustomFieldDefinition | null | undefined) {
  const label = optionalText(entry?.label) ?? "Field";
  const type = entry?.type ?? "text";
  return {
    id: optionalText(entry?.id) ?? createId(),
    key: slugifyContactKey(entry?.key || label) || createId().slice(0, 8),
    label,
    type: type === "dropdown" || type === "date" || type === "number" || type === "url" ? type : "text",
    options: Array.isArray(entry?.options)
      ? Array.from(new Set(entry.options.map((option) => option.trim()).filter(Boolean))).slice(0, 20)
      : [],
    prefix: optionalText(entry?.prefix) ?? null
  } satisfies ContactCustomFieldDefinition;
}

function stripLegacySeededStatuses(statuses: ContactStatusDefinition[]) {
  if (statuses.length !== LEGACY_CONTACT_STATUSES.length) {
    return statuses;
  }

  const matchesLegacyStatuses = statuses.every((status, index) => {
    const legacy = LEGACY_CONTACT_STATUSES[index];
    return (
      legacy &&
      status.key === legacy.key &&
      status.label === legacy.label &&
      status.color === legacy.color
    );
  });

  return matchesLegacyStatuses ? [] : statuses;
}

export function normalizeContactSettings(
  value: Partial<ContactWorkspaceSettings> | null | undefined,
  planKey: BillingPlanKey
) {
  const limits = getContactPlanLimits(planKey);
  const customStatuses = stripLegacySeededStatuses(
    Array.isArray(value?.statuses)
      ? value.statuses.map(normalizeStatus).slice(0, limits.customStatusesLimit ?? undefined)
      : []
  );
  const customFields =
    Array.isArray(value?.customFields)
      ? value.customFields.map(normalizeField).slice(0, limits.customFieldsLimit ?? undefined)
      : [];
  const dataRetention: ContactDataRetention =
    value?.dataRetention === "1y" || value?.dataRetention === "2y" || value?.dataRetention === "3y"
      ? value.dataRetention
      : "forever";

  return {
    statuses: customStatuses,
    customFields,
    dataRetention
  } satisfies ContactWorkspaceSettings;
}

export function parseContactSettingsJson(value: string | null | undefined, planKey: BillingPlanKey) {
  if (!value) {
    return normalizeContactSettings(null, planKey);
  }

  try {
    return normalizeContactSettings(JSON.parse(value) as Partial<ContactWorkspaceSettings>, planKey);
  } catch {
    return normalizeContactSettings(null, planKey);
  }
}

export function contactStatusToneClass(color: ContactStatusColor) {
  switch (color) {
    case "purple":
      return "bg-fuchsia-50 text-fuchsia-700";
    case "green":
      return "bg-emerald-50 text-emerald-700";
    case "amber":
      return "bg-amber-50 text-amber-700";
    case "gray":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-blue-50 text-blue-700";
  }
}

function encodeBase64Utf8(value: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64");
  }

  const bytes = new TextEncoder().encode(value);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return globalThis.btoa(binary);
}

function decodeBase64Utf8(value: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "base64").toString("utf8");
  }

  const binary = globalThis.atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeContactId(siteId: string, email: string) {
  return encodeBase64Utf8(`${siteId}:${email.trim().toLowerCase()}`)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function decodeContactId(value: string) {
  try {
    const normalized = value
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(value.length + ((4 - (value.length % 4 || 4)) % 4), "=");
    const decoded = decodeBase64Utf8(normalized);
    const separator = decoded.indexOf(":");
    if (separator <= 0) {
      return null;
    }

    return {
      siteId: decoded.slice(0, separator),
      email: decoded.slice(separator + 1)
    };
  } catch {
    return null;
  }
}

export function contactDisplayName(name: string | null | undefined, email: string) {
  return optionalText(name) ?? displayNameFromEmail(email);
}
