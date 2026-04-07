"use client";

import type { ContactSummary } from "@/lib/contact-types";

export type ContactLastSeenFilter = "any" | "today" | "7d" | "30d" | "90d";
export type ContactSortKey =
  | "lastSeenDesc"
  | "lastSeenAsc"
  | "firstSeenDesc"
  | "firstSeenAsc"
  | "nameAsc"
  | "nameDesc"
  | "conversationsDesc"
  | "conversationsAsc";

export type ContactFilterState = {
  status: string;
  tag: string;
  lastSeen: ContactLastSeenFilter;
  customFieldValues: Record<string, string>;
};

export const DEFAULT_CONTACT_FILTERS: ContactFilterState = {
  status: "",
  tag: "",
  lastSeen: "any",
  customFieldValues: {}
};

function withinLastSeenRange(value: string, filter: ContactLastSeenFilter) {
  if (filter === "any") {
    return true;
  }

  const ageMs = Date.now() - new Date(value).getTime();
  const limits = {
    today: 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "90d": 90 * 24 * 60 * 60 * 1000
  };

  return ageMs <= limits[filter];
}

export function filterContacts(
  contacts: ContactSummary[],
  searchQuery: string,
  filters: ContactFilterState
) {
  const needle = searchQuery.trim().toLowerCase();

  return contacts.filter((contact) => {
    if (filters.status && contact.status !== filters.status) {
      return false;
    }

    if (filters.tag && !contact.tags.includes(filters.tag)) {
      return false;
    }

    if (!withinLastSeenRange(contact.lastSeenAt, filters.lastSeen)) {
      return false;
    }

    for (const [fieldKey, fieldValue] of Object.entries(filters.customFieldValues)) {
      if (fieldValue && contact.customFields[fieldKey] !== fieldValue) {
        return false;
      }
    }

    if (!needle) {
      return true;
    }

    return [contact.name, contact.email, contact.company ?? ""].join(" ").toLowerCase().includes(needle);
  });
}

export function sortContacts(contacts: ContactSummary[], sortKey: ContactSortKey) {
  return [...contacts].sort((left, right) => {
    switch (sortKey) {
      case "lastSeenAsc":
        return new Date(left.lastSeenAt).getTime() - new Date(right.lastSeenAt).getTime();
      case "firstSeenDesc":
        return new Date(right.firstSeenAt).getTime() - new Date(left.firstSeenAt).getTime();
      case "firstSeenAsc":
        return new Date(left.firstSeenAt).getTime() - new Date(right.firstSeenAt).getTime();
      case "nameAsc":
        return left.name.localeCompare(right.name);
      case "nameDesc":
        return right.name.localeCompare(left.name);
      case "conversationsDesc":
        return right.conversationCount - left.conversationCount;
      case "conversationsAsc":
        return left.conversationCount - right.conversationCount;
      case "lastSeenDesc":
      default:
        return new Date(right.lastSeenAt).getTime() - new Date(left.lastSeenAt).getTime();
    }
  });
}

function csvEscape(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

export function exportContactsCsv(contacts: ContactSummary[], fields: string[]) {
  const rows = contacts.map((contact) =>
    fields.map((field) => {
      switch (field) {
        case "name":
          return contact.name;
        case "email":
          return contact.email;
        case "company":
          return contact.company ?? "";
        case "phone":
          return contact.phone ?? "";
        case "status":
          return contact.status;
        case "tags":
          return contact.tags.join(", ");
        case "firstSeen":
          return contact.firstSeenAt;
        case "lastSeen":
          return contact.lastSeenAt;
        case "conversations":
          return contact.conversationCount;
        case "source":
          return contact.source.referrer ?? "";
        default:
          return contact.customFields[field] ?? "";
      }
    })
  );

  const csv = [fields, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `chatting-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
