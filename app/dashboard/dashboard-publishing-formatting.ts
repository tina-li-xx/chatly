import { formatBlogDate } from "@/lib/blog-utils";

export function formatPublishingPriorityLabel(value: number) {
  return `Priority ${value}`;
}

export function formatPublishingSnapshotDate(value: string | null) {
  return value ? formatBlogDate(value) : "Not generated yet";
}

export function formatPublishingStatusLabel(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
