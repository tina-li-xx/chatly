import type { ConversationSummary } from "@/lib/types";
import { displayNameFromEmail, initialsFromLabel } from "@/lib/user-display";
import { pageLabelFromUrl } from "./dashboard-ui";

export const LIVE_VISITOR_WINDOW_MS = 5 * 60 * 1000;
export const VISITORS_PAGE_SIZE = 25;

export type VisitorsPrimaryFilter = "all" | "online" | "returned" | "new";
export type VisitorsTimeRange = "24h" | "7d" | "30d" | "all";
export type VisitorsSourceFilter = "all" | "direct" | "google" | "social" | "email" | "other";

export type VisitorPageEvent = {
  page: string;
  seenAt: string;
  durationSeconds: number;
};

export type VisitorVisit = {
  conversationId: string;
  startedAt: string;
  lastSeenAt: string;
  page: string;
  source: string;
};

export type VisitorRecord = {
  id: string;
  name: string;
  initials: string;
  email: string | null;
  location: string | null;
  browser: string;
  currentPage: string;
  source: string;
  sourceCategory: VisitorsSourceFilter;
  firstSeenAt: string;
  lastSeenAt: string;
  timeOnSiteSeconds: number;
  pagesViewed: number;
  conversationCount: number;
  pageHistory: VisitorPageEvent[];
  visitHistory: VisitorVisit[];
  tags: string[];
  latestConversationId: string;
  online: boolean;
  returnedVisitor: boolean;
  newVisitor: boolean;
  hasEmail: boolean;
  hasConversation: boolean;
};

export type VisitorFilterState = {
  status: "all" | "online" | "offline";
  locationQuery: string;
  source: VisitorsSourceFilter;
  pageQuery: string;
  visitCount: "all" | "first" | "2-5" | "5+";
  timeOnSite: "all" | "<1" | "1-5" | "5+";
  hasEmail: "all" | "yes" | "no";
  hasConversation: "all" | "yes" | "no";
};

export const DEFAULT_VISITOR_FILTERS: VisitorFilterState = {
  status: "all",
  locationQuery: "",
  source: "all",
  pageQuery: "",
  visitCount: "all",
  timeOnSite: "all",
  hasEmail: "all",
  hasConversation: "all"
};

function identityKey(conversation: ConversationSummary) {
  if (conversation.email) {
    return `email:${conversation.email.trim().toLowerCase()}`;
  }

  return `session:${conversation.siteId}:${conversation.sessionId}`;
}

function browserLabel(userAgent: string | null) {
  if (!userAgent) {
    return "Unknown browser";
  }

  const source = userAgent.toLowerCase();
  const browser = source.includes("edg/")
    ? "Edge"
    : source.includes("chrome") && !source.includes("edg/")
      ? "Chrome"
      : source.includes("safari") && !source.includes("chrome")
        ? "Safari"
        : source.includes("firefox")
          ? "Firefox"
          : "Browser";
  const os = source.includes("mac os")
    ? "macOS"
    : source.includes("windows")
      ? "Windows"
      : source.includes("iphone") || source.includes("ipad")
        ? "iOS"
        : source.includes("android")
          ? "Android"
          : "OS";

  return `${browser} on ${os}`;
}

function sourceLabel(referrer: string | null) {
  if (!referrer) {
    return "Direct";
  }

  try {
    return new URL(referrer).host.replace(/^www\./, "");
  } catch (error) {
    return referrer;
  }
}

function sourceCategory(referrer: string | null): VisitorsSourceFilter {
  const source = sourceLabel(referrer).toLowerCase();

  if (source === "direct") {
    return "direct";
  }

  if (source.includes("google")) {
    return "google";
  }

  if (
    source.includes("twitter") ||
    source.includes("x.com") ||
    source.includes("facebook") ||
    source.includes("linkedin") ||
    source.includes("instagram")
  ) {
    return "social";
  }

  if (source.includes("mail") || source.includes("email")) {
    return "email";
  }

  return "other";
}

function locationLabel(conversation: ConversationSummary) {
  return [conversation.city, conversation.region, conversation.country].filter(Boolean).join(", ") || null;
}

function durationSeconds(start: string, end: string) {
  return Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000));
}

export function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0s";
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${remainderSeconds.toString().padStart(2, "0")}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainderMinutes = minutes % 60;
  return `${hours}h ${remainderMinutes}m`;
}

export function buildVisitorRecords(conversations: ConversationSummary[]) {
  const grouped = new Map<string, ConversationSummary[]>();

  for (const conversation of conversations) {
    const key = identityKey(conversation);
    const current = grouped.get(key) ?? [];
    current.push(conversation);
    grouped.set(key, current);
  }

  return Array.from(grouped.values())
    .map((group) => {
      const sorted = [...group].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      const latest = sorted[0];
      const email = latest.email;
      const name = email ? displayNameFromEmail(email) : "Visitor";
      const pageHistory = sorted
        .filter((conversation) => conversation.pageUrl)
        .map((conversation) => ({
          page: pageLabelFromUrl(conversation.pageUrl),
          seenAt: conversation.updatedAt,
          durationSeconds: durationSeconds(conversation.createdAt, conversation.updatedAt)
        }));
      const currentLocation = locationLabel(latest);
      const firstSeenAt = sorted.reduce((earliest, conversation) => {
        return new Date(conversation.createdAt).getTime() < new Date(earliest).getTime()
          ? conversation.createdAt
          : earliest;
      }, sorted[0].createdAt);
      const pagesViewed = new Set(pageHistory.map((page) => page.page)).size || sorted.length;
      const tags = Array.from(new Set(sorted.flatMap((conversation) => conversation.tags))).sort();
      const visitHistory = sorted.map((conversation) => ({
        conversationId: conversation.id,
        startedAt: conversation.createdAt,
        lastSeenAt: conversation.updatedAt,
        page: pageLabelFromUrl(conversation.pageUrl),
        source: sourceLabel(conversation.referrer)
      }));
      const lastSeenAt = latest.updatedAt;
      const online = Date.now() - new Date(lastSeenAt).getTime() <= LIVE_VISITOR_WINDOW_MS;

      return {
        id: identityKey(latest),
        name,
        initials: initialsFromLabel(name),
        email,
        location: currentLocation,
        browser: browserLabel(latest.userAgent),
        currentPage: pageLabelFromUrl(latest.pageUrl),
        source: sourceLabel(latest.referrer),
        sourceCategory: sourceCategory(latest.referrer),
        firstSeenAt,
        lastSeenAt,
        timeOnSiteSeconds: durationSeconds(latest.createdAt, latest.updatedAt),
        pagesViewed,
        conversationCount: sorted.length,
        pageHistory,
        visitHistory,
        tags,
        latestConversationId: latest.id,
        online,
        returnedVisitor: sorted.length > 1,
        newVisitor: sorted.length === 1,
        hasEmail: Boolean(email),
        hasConversation: true
      } satisfies VisitorRecord;
    })
    .sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());
}
