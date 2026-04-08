import "server-only";

export type ZapierCreateContactInput = {
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  status: string | null;
  tags: string[];
  customFields: Record<string, string>;
};

function optionalString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map((entry) => String(entry)) : [];
}

function stringRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, String(entry)])
  );
}

export function readZapierCreateContactInput(
  body: Record<string, unknown> | null
): ZapierCreateContactInput {
  return {
    email: String(body?.email ?? "").trim(),
    name: optionalString(body?.name),
    phone: optionalString(body?.phone),
    company: optionalString(body?.company),
    status: optionalString(body?.status),
    tags: stringArray(body?.tags),
    customFields: stringRecord(body?.customFields)
  };
}
