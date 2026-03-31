export type Sender = "user" | "founder";
export type ConversationStatus = "open" | "resolved";
export type ConversationRating = 1 | 2 | 3 | 4 | 5;
export type OnboardingStep = "signup" | "team" | "customize" | "install" | "done";
export type WidgetLauncherPosition = "left" | "right";
export type WidgetAvatarStyle = "photos" | "initials" | "icon";
export type WidgetResponseTimeMode = "minutes" | "hours" | "day" | "hidden";
export type WidgetOperatingHoursDay = {
  enabled: boolean;
  from: string;
  to: string;
};
export type WidgetOperatingHours = {
  monday: WidgetOperatingHoursDay;
  tuesday: WidgetOperatingHoursDay;
  wednesday: WidgetOperatingHoursDay;
  thursday: WidgetOperatingHoursDay;
  friday: WidgetOperatingHoursDay;
  saturday: WidgetOperatingHoursDay;
  sunday: WidgetOperatingHoursDay;
};

export type CurrentUser = {
  id: string;
  email: string;
  createdAt: string;
  workspaceOwnerId: string;
  workspaceRole: "owner" | "admin" | "member";
};

export type Site = {
  id: string;
  userId: string;
  name: string;
  domain: string | null;
  brandColor: string;
  widgetTitle: string;
  greetingText: string;
  launcherPosition: WidgetLauncherPosition;
  avatarStyle: WidgetAvatarStyle;
  teamPhotoUrl: string | null;
  showOnlineStatus: boolean;
  requireEmailOffline: boolean;
  offlineTitle: string;
  offlineMessage: string;
  awayTitle: string;
  awayMessage: string;
  soundNotifications: boolean;
  autoOpenPaths: string[];
  responseTimeMode: WidgetResponseTimeMode;
  operatingHoursEnabled: boolean;
  operatingHoursTimezone: string | null;
  operatingHours: WidgetOperatingHours;
  widgetInstallVerifiedAt: string | null;
  widgetInstallVerifiedUrl: string | null;
  widgetLastSeenAt: string | null;
  widgetLastSeenUrl: string | null;
  createdAt: string;
  conversationCount: number;
};

export type ConversationSummary = {
  id: string;
  siteId: string;
  siteName: string;
  email: string | null;
  sessionId: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  pageUrl: string | null;
  recordedPageUrl?: string | null;
  referrer: string | null;
  userAgent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  locale: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  rating: ConversationRating | null;
  tags: string[];
};

export type VisitorPresenceSession = {
  siteId: string;
  sessionId: string;
  conversationId: string | null;
  email: string | null;
  currentPageUrl: string | null;
  referrer: string | null;
  userAgent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  locale: string | null;
  startedAt: string;
  lastSeenAt: string;
};

export type VisitorNoteIdentityType = "email" | "session";

export type VisitorNote = {
  siteId: string;
  identityType: VisitorNoteIdentityType;
  identityValue: string;
  note: string;
  updatedAt: string;
};

export type MessageAttachment = {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  isImage: boolean;
};

export type ThreadMessage = {
  id: string;
  conversationId: string;
  sender: Sender;
  content: string;
  createdAt: string;
  attachments: MessageAttachment[];
  pending?: boolean;
};

export type VisitorActivity = {
  matchType: "email" | "session";
  otherQuestionsLastMonth: number;
  otherConversationsLastMonth: number;
  otherConversationsTotal: number;
  lastSeenAt: string | null;
};

export type ConversationThread = ConversationSummary & {
  messages: ThreadMessage[];
  visitorActivity: VisitorActivity | null;
};

export type DashboardStats = {
  totalConversations: number;
  answeredConversations: number;
  ratedConversations: number;
  topTags: Array<{ tag: string; count: number }>;
};
