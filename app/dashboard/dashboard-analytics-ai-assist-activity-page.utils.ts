import type { AnalyticsAiAssistActivityPageData } from "@/lib/data/analytics";
import { addDays, toDateInputValue } from "@/lib/data/analytics-ai-assist-activity-filters";

export function groupAiAssistActivity(rows: AnalyticsAiAssistActivityPageData["activity"]) {
  const groups = new Map<string, AnalyticsAiAssistActivityPageData["activity"]>();

  for (const row of rows) {
    const key = row.createdAt.slice(0, 10);
    const current = groups.get(key);
    if (current) {
      current.push(row);
      continue;
    }
    groups.set(key, [row]);
  }

  return Array.from(groups.entries()).map(([date, activity]) => ({ date, activity }));
}

export function aiActivityDateHeading(value: string) {
  const today = toDateInputValue(new Date());
  const yesterday = toDateInputValue(addDays(new Date(), -1));
  if (value === today) return "Today";
  if (value === yesterday) return "Yesterday";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }).format(new Date(value));
}
