import type { ConversationSummary, VisitorPresenceSession } from "@/lib/types";

type VisitorsDataResponse = {
  ok: true;
  conversations: ConversationSummary[];
  liveSessions: VisitorPresenceSession[];
};

type VisitorConversationSummariesResponse = {
  ok: true;
  summaries: ConversationSummary[];
};

async function fetchJson<T>(url: string) {
  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function fetchVisitorConversationSummaries(input: {
  email: string | null;
  sessionId: string;
  siteId: string;
}) {
  const searchParams = new URLSearchParams({
    siteId: input.siteId,
    sessionId: input.sessionId
  });

  if (input.email) {
    searchParams.set("email", input.email);
  }

  return fetchJson<VisitorConversationSummariesResponse>(
    `/dashboard/visitor-conversations?${searchParams.toString()}`
  );
}

export function fetchVisitorsData() {
  return fetchJson<VisitorsDataResponse>("/dashboard/visitors-data");
}
