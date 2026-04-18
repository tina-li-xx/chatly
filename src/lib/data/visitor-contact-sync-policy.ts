import type { VisitorPresenceSession } from "@/lib/types";
import type { VisitorPresenceRow } from "@/lib/repositories/visitor-presence-repository";
import { optionalText } from "@/lib/utils";

function normalizeTags(tags: string[] | null | undefined) {
  return JSON.stringify(
    Array.from(new Set((tags ?? []).map((tag) => optionalText(tag)).filter(Boolean) as string[])).sort()
  );
}

function normalizeCustomFields(fields: Record<string, string> | null | undefined) {
  return JSON.stringify(
    Object.entries(fields ?? {})
      .map(([key, value]) => [optionalText(key), optionalText(value)] as const)
      .filter(
        (entry): entry is readonly [string, string] => Boolean(entry[0] && entry[1])
      )
      .sort(([left], [right]) => left.localeCompare(right))
  );
}

export function shouldSyncVisitorContact(
  previous: VisitorPresenceRow | null,
  next: VisitorPresenceSession | null
) {
  if (!next?.email) {
    return false;
  }

  if (!previous) {
    return true;
  }

  return (
    optionalText(previous.email) !== next.email ||
    optionalText(previous.conversation_id) !== next.conversationId ||
    optionalText(previous.current_page_url) !== next.currentPageUrl ||
    optionalText(previous.referrer) !== next.referrer ||
    optionalText(previous.city) !== next.city ||
    optionalText(previous.region) !== next.region ||
    optionalText(previous.country) !== next.country ||
    normalizeTags(previous.tags_json) !== normalizeTags(next.tags) ||
    normalizeCustomFields(previous.custom_fields_json) !== normalizeCustomFields(next.customFields)
  );
}
