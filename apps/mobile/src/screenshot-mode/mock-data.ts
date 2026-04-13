import type {
  ConversationSummary,
  DashboardTeamMember,
  MobileProfile,
  ReplyAttachmentDraft
} from "../types";

function minutesAgo(value: number) {
  return new Date(Date.now() - value * 60 * 1000).toISOString();
}

function conversation(input: Partial<ConversationSummary> & Pick<ConversationSummary, "id" | "email" | "lastMessagePreview">): ConversationSummary {
  return {
    id: input.id,
    siteId: "site_1",
    siteName: "Chatting",
    email: input.email,
    assignedUserId: input.assignedUserId ?? null,
    sessionId: `session_${input.id}`,
    status: input.status ?? "open",
    createdAt: input.createdAt ?? minutesAgo(90),
    updatedAt: input.updatedAt ?? minutesAgo(2),
    pageUrl: input.pageUrl ?? null,
    recordedPageUrl: input.recordedPageUrl ?? null,
    referrer: null,
    userAgent: null,
    country: input.country ?? "UK",
    region: input.region ?? null,
    city: input.city ?? null,
    timezone: "Europe/London",
    locale: "en-GB",
    lastMessageAt: input.lastMessageAt ?? input.updatedAt ?? minutesAgo(2),
    lastMessagePreview: input.lastMessagePreview,
    unreadCount: input.unreadCount ?? 0,
    tags: input.tags ?? []
  };
}

export const screenshotProfile: MobileProfile = {
  firstName: "Sarah",
  lastName: "Mitchell",
  email: "sarah@company.com",
  jobTitle: "Support Lead",
  avatarDataUrl: null
};

export const screenshotConversations: ConversationSummary[] = [
  conversation({ id: "james", email: "James Mitchell", lastMessagePreview: "Quick question about pricing...", pageUrl: "https://usechatting.com/pricing", city: "London", lastMessageAt: minutesAgo(2), updatedAt: minutesAgo(2), unreadCount: 1 }),
  conversation({ id: "sarah", email: "Sarah Chen", lastMessagePreview: "Is there a free trial?", pageUrl: "https://usechatting.com/features", city: "NYC", lastMessageAt: minutesAgo(8), updatedAt: minutesAgo(8) }),
  conversation({ id: "mike", email: "Mike Johnson", lastMessagePreview: "Thanks for the help!", pageUrl: "https://usechatting.com/docs", city: "Berlin", lastMessageAt: minutesAgo(24), updatedAt: minutesAgo(24) }),
  conversation({ id: "emma", email: "Emma Wilson", lastMessagePreview: "Do you integrate with...", pageUrl: "https://usechatting.com/pricing", city: "Toronto", lastMessageAt: minutesAgo(60), updatedAt: minutesAgo(60) })
];

export const screenshotTeamMembers: DashboardTeamMember[] = [
  { id: "sarah", name: "Sarah Mitchell", email: "sarah@company.com", initials: "SM", role: "owner", status: "online", lastActiveLabel: "Now", isCurrentUser: true, avatarDataUrl: null },
  { id: "mike", name: "Mike Chen", email: "mike@company.com", initials: "MC", role: "member", status: "online", lastActiveLabel: "Now", isCurrentUser: false, avatarDataUrl: null },
  { id: "lisa", name: "Lisa Park", email: "lisa@company.com", initials: "LP", role: "member", status: "online", lastActiveLabel: "Now", isCurrentUser: false, avatarDataUrl: null },
  { id: "tom", name: "Tom Wilson", email: "tom@company.com", initials: "TW", role: "member", status: "offline", lastActiveLabel: "10m ago", isCurrentUser: false, avatarDataUrl: null }
];

export const screenshotChat = {
  title: "James Mitchell",
  subtitle: "/pricing · London",
  visitorMessages: [
    { id: "m1", text: "Quick question\nabout pricing", time: "10:42" },
    { id: "m3", text: "Do you have\nmonthly billing\nor just annual?", time: "10:43" }
  ],
  teamMessage: { id: "m2", text: "Hey! Happy to\nhelp. What\nwould you like\nto know?", time: "10:42", seen: "✓✓" }
};

export const screenshotDraft = "Type a message";
export const screenshotTypingLabel = "James is typing…";
export const screenshotAttachments: ReplyAttachmentDraft[] = [];

export const screenshotNotification = {
  appName: "CHATTING",
  title: "New message from James Mitchell",
  body: "Quick question about\nyour pricing plans"
};
