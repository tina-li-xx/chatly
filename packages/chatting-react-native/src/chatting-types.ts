export type ChattingSender = "user" | "team";

export interface ChattingSessionState {
  sessionId: string;
  conversationId?: string | null;
  email?: string | null;
  pushToken?: string | null;
  pushPlatform?: string | null;
  pushAppId?: string | null;
  pushTokenSyncedConversationId?: string | null;
}

export interface ChattingSessionStore {
  load(): Promise<ChattingSessionState | null>;
  save(state: ChattingSessionState): Promise<void>;
  clear?(): Promise<void>;
}

export interface ChattingKeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem?(key: string): Promise<void>;
}

export interface ChattingVisitorContext {
  pageUrl?: string | null;
  referrer?: string | null;
  timezone?: string | null;
  locale?: string | null;
  tags?: string[];
  customFields?: Record<string, string>;
}

export interface ChattingVisitorProfile {
  email: string;
  name?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
  tags?: string[];
  customFields?: Record<string, string>;
}

export interface ChattingMessageAttachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  isImage: boolean;
}

export interface ChattingMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: ChattingSender;
  attachments: ChattingMessageAttachment[];
}

export interface ChattingFAQItem {
  id: string;
  question: string;
  answer: string;
  link?: string | null;
}

export interface ChattingFAQSuggestions {
  fallbackMessage: string;
  items: ChattingFAQItem[];
}

export interface ChattingConversationState {
  conversationId: string;
  messages: ChattingMessage[];
  faqSuggestions: ChattingFAQSuggestions | null;
}

export interface ChattingSendMessageResult {
  conversationId: string;
  message: ChattingMessage;
  faqSuggestions: ChattingFAQSuggestions | null;
}

export type ChattingLiveEventType =
  | "connected"
  | "message.created"
  | "typing.updated"
  | "conversation.updated";

export type ChattingTypingActor = "team" | "visitor";

export interface ChattingLiveEvent {
  type: ChattingLiveEventType;
  conversationId?: string | null;
  sender?: ChattingSender;
  actor?: ChattingTypingActor;
  typing?: boolean;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ChattingSiteConfig {
  id: string;
  widgetTitle: string;
  greetingText?: string | null;
  brandColor?: string | null;
  showOnlineStatus?: boolean | null;
}

export interface ChattingSiteStatus {
  online: boolean;
  lastSeenAt?: string | null;
}

export interface ChattingClientOptions {
  siteId: string;
  baseURL?: string;
  sessionStore?: ChattingSessionStore;
  fetchImpl?: typeof fetch;
}

export interface ChattingPushRegistrationInput {
  pushToken: string;
  platform?: string | null;
  appId?: string | null;
}
