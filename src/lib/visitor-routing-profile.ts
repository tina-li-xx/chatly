import { findVisitorContactRow } from "@/lib/repositories/visitor-contacts-repository";
import { findVisitorPresenceSessionRow } from "@/lib/repositories/visitor-presence-repository";
import { optionalText } from "@/lib/utils";

export type VisitorRoutingProfile = {
  tags: string[];
  customFields: Record<string, string>;
};

function parseStructuredValue(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  try {
    return JSON.parse(normalized);
  } catch {
    return normalized;
  }
}

export function normalizeVisitorTags(value: unknown) {
  const parsed = parseStructuredValue(value);
  const values = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "string"
      ? parsed.split(",")
      : [];

  return Array.from(
    new Set(
      values
        .map((entry) => optionalText(String(entry))?.toLowerCase())
        .filter((entry): entry is string => Boolean(entry))
    )
  ).slice(0, 25);
}

export function normalizeVisitorCustomFields(value: unknown) {
  const parsed = parseStructuredValue(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(parsed)
      .map(([key, fieldValue]) => [
        optionalText(String(key))?.toLowerCase(),
        optionalText(String(fieldValue))
      ])
      .filter((entry): entry is [string, string] => Boolean(entry[0] && entry[1]))
      .slice(0, 25)
  );
}

function mergeVisitorTags(...lists: Array<string[]>) {
  return Array.from(new Set(lists.flatMap((list) => list))).slice(0, 25);
}

export async function loadVisitorRoutingProfile(input: {
  siteId: string;
  sessionId: string;
  email?: string | null;
}): Promise<VisitorRoutingProfile> {
  const normalizedEmail = optionalText(input.email)?.toLowerCase() ?? null;
  const [presence, contact] = await Promise.all([
    findVisitorPresenceSessionRow(input.siteId, input.sessionId),
    normalizedEmail ? findVisitorContactRow(input.siteId, normalizedEmail) : Promise.resolve(null)
  ]);

  const presenceTags = normalizeVisitorTags(presence?.tags_json);
  const contactTags = normalizeVisitorTags(contact?.tags_json);
  const contactFields = normalizeVisitorCustomFields(contact?.custom_fields_json);
  const presenceFields = normalizeVisitorCustomFields(presence?.custom_fields_json);

  return {
    tags: mergeVisitorTags(contactTags, presenceTags),
    customFields: {
      ...contactFields,
      ...presenceFields
    }
  };
}
