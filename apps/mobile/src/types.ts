export type SessionUser = {
  id: string;
  email: string;
  createdAt: string;
  workspaceOwnerId: string;
  workspaceRole: "owner" | "admin" | "member";
};

export type MobileSession = {
  baseUrl: string;
  token: string;
  user: SessionUser;
};

export type MobileAvailability = "online" | "offline";

export type MobileNotificationSound =
  | "none"
  | "chime"
  | "ding"
  | "pop"
  | "swoosh"
  | "default";

export type MobileNotificationPreferences = {
  allMessagesEnabled: boolean;
  assignedEnabled: boolean;
  newConversationEnabled: boolean;
  pushEnabled: boolean;
  soundName: MobileNotificationSound;
  vibrationEnabled: boolean;
};

export type MobileProfile = {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  avatarDataUrl: string | null;
};

export type MobileThemeMode = "light" | "dark" | "system";

export type MobileAppearanceSettings = {
  themeMode: MobileThemeMode;
  textScale: number;
};

export type DashboardSavedReply = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

export type DashboardTeamMember = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: "owner" | "admin" | "member";
  status: "online" | "offline";
  lastActiveLabel: string;
  isCurrentUser: boolean;
  avatarDataUrl: string | null;
};

export type VisitorActivity = {
  matchType: "email" | "session";
  otherQuestionsLastMonth: number;
  otherConversationsLastMonth: number;
  otherConversationsTotal: number;
  lastSeenAt: string | null;
};

export type ConversationSummary = {
  id: string;
  siteId: string;
  siteName: string;
  email: string | null;
  assignedUserId: string | null;
  sessionId: string;
  status: "open" | "resolved";
  createdAt: string;
  updatedAt: string;
  pageUrl: string | null;
  recordedPageUrl?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone?: string | null;
  locale?: string | null;
  lastMessageAt?: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  tags: string[];
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
  sender: "user" | "team";
  content: string;
  createdAt: string;
  attachments: MessageAttachment[];
};

export type ConversationThread = ConversationSummary & {
  messages: ThreadMessage[];
  visitorActivity: VisitorActivity | null;
};

export type MobileBootstrap = {
  profile: MobileProfile;
  teamMembers: DashboardTeamMember[];
  savedReplies: DashboardSavedReply[];
  availability: MobileAvailability;
  notificationPreferences: MobileNotificationPreferences;
};

export type ReplyAttachmentDraft = {
  id: string;
  uri: string;
  previewUri: string;
  fileName: string;
  contentType: string;
  sizeBytes: number | null;
};
