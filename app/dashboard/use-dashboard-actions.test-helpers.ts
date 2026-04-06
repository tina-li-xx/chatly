import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { vi } from "vitest";
import { createDefaultOperatingHours } from "@/lib/widget-settings";
import type { BannerState } from "./dashboard-client.types";
import { createDashboardActions } from "./use-dashboard-actions";
import type { ConversationSummary, ConversationThread, Site } from "@/lib/types";

type StateRecorder<T> = {
  get current(): T;
  set: Dispatch<SetStateAction<T>>;
};

function createStateRecorder<T>(initialValue: T): StateRecorder<T> {
  let current = initialValue;

  return {
    get current() {
      return current;
    },
    set(value) {
      current = typeof value === "function" ? (value as (previous: T) => T)(current) : value;
    }
  };
}

export function createSite(overrides: Partial<Site> = {}): Site {
  return {
    id: "site_1",
    userId: "user_1",
    name: "Main site",
    domain: "https://example.com",
    brandColor: "#2563EB",
    widgetTitle: "Talk to us",
    greetingText: "Hi there",
    launcherPosition: "right",
    avatarStyle: "initials",
    teamPhotoUrl: null,
    showOnlineStatus: true,
    requireEmailOffline: false,
    offlineTitle: "We're not online right now",
    offlineMessage: "Leave a message and we'll get back to you via email.",
    awayTitle: "We're away right now",
    awayMessage: "Leave a message and we'll get back to you via email.",
    soundNotifications: true,
    autoOpenPaths: ["/pricing"],
    responseTimeMode: "minutes",
    operatingHoursEnabled: true,
    operatingHoursTimezone: "UTC",
    operatingHours: createDefaultOperatingHours(),
    widgetInstallVerifiedAt: null,
    widgetInstallVerifiedUrl: null,
    widgetLastSeenAt: null,
    widgetLastSeenUrl: null,
    createdAt: "2026-03-29T10:00:00.000Z",
    conversationCount: 2,
    ...overrides
  };
}

export function createConversationSummary(
  overrides: Partial<ConversationSummary> = {}
): ConversationSummary {
  return {
    id: "conv_1",
    siteId: "site_1",
    siteName: "Main site",
    email: "visitor@example.com",
    assignedUserId: null,
    sessionId: "session_1",
    status: "open",
    createdAt: "2026-03-29T10:00:00.000Z",
    updatedAt: "2026-03-29T10:05:00.000Z",
    pageUrl: "https://example.com/pricing",
    recordedPageUrl: "https://example.com/pricing",
    referrer: null,
    userAgent: null,
    country: "UK",
    region: "London",
    city: "London",
    timezone: "Europe/London",
    locale: "en-GB",
    lastMessageAt: "2026-03-29T10:05:00.000Z",
    lastMessagePreview: "Need help with pricing",
    unreadCount: 1,
    rating: null,
    tags: ["pricing"],
    ...overrides
  };
}

export function createConversationThread(
  overrides: Partial<ConversationThread> = {}
): ConversationThread {
  return {
    ...createConversationSummary(),
    messages: [
      {
        id: "msg_1",
        conversationId: "conv_1",
        sender: "user",
        content: "Need help with pricing",
        createdAt: "2026-03-29T10:05:00.000Z",
        attachments: []
      }
    ],
    visitorActivity: null,
    ...overrides
  };
}

function resolveActiveConversation(
  options?: { activeConversation?: ConversationThread | null }
) {
  if (!options || !("activeConversation" in options)) {
    return createConversationThread();
  }

  return options.activeConversation ?? null;
}

export function createDashboardActionsHarness(options?: {
  activeConversation?: ConversationThread | null;
  conversations?: ConversationSummary[];
  sites?: Site[];
  sendingReply?: boolean;
}) {
  const activeConversation = resolveActiveConversation(options);
  const conversations = options?.conversations ?? [createConversationSummary()];
  const sites = options?.sites ?? [createSite()];
  const sitesState = createStateRecorder(sites);
  const conversationsState = createStateRecorder(conversations);
  const activeConversationState = createStateRecorder<ConversationThread | null>(activeConversation);
  const savingSiteIdState = createStateRecorder<string | null>(null);
  const savingEmailState = createStateRecorder(false);
  const assigningConversationState = createStateRecorder(false);
  const sendingReplyState = createStateRecorder(Boolean(options?.sendingReply));
  const updatingStatusState = createStateRecorder(false);
  const answeredConversationsState = createStateRecorder(0);
  const bannerState = createStateRecorder<BannerState>(null);
  const conversationCacheRef: MutableRefObject<Map<string, ConversationThread>> = {
    current: activeConversation ? new Map([[activeConversation.id, activeConversation]]) : new Map()
  };
  const recentOptimisticReplyAtRef: MutableRefObject<Map<string, number>> = { current: new Map() };
  const pendingTagMutationsRef: MutableRefObject<Set<string>> = { current: new Set() };
  const activeTypingConversationIdRef: MutableRefObject<string | null> = { current: null };
  const lastTypingSentAtRef: MutableRefObject<number> = { current: 0 };
  const showBanner = vi.fn((tone: "success" | "error", text: string) => {
    bannerState.set({ tone, text });
  });
  const clearTypingSignal = vi.fn().mockResolvedValue(undefined);
  const postTypingSignal = vi.fn().mockResolvedValue(undefined);

  const actions = createDashboardActions({
    activeConversation,
    conversations,
    sendingReply: sendingReplyState.current,
    setSites: sitesState.set,
    setConversations: conversationsState.set,
    setActiveConversation: activeConversationState.set,
    setSavingSiteId: savingSiteIdState.set,
    setSavingEmail: savingEmailState.set,
    setAssigningConversation: assigningConversationState.set,
    setSendingReply: sendingReplyState.set,
    setUpdatingStatus: updatingStatusState.set,
    setAnsweredConversations: answeredConversationsState.set,
    setBanner: bannerState.set,
    conversationCacheRef,
    recentOptimisticReplyAtRef,
    pendingTagMutationsRef,
    activeTypingConversationIdRef,
    lastTypingSentAtRef,
    showBanner,
    clearTypingSignal,
    postTypingSignal
  });

  return {
    actions,
    activeConversationState,
    activeTypingConversationIdRef,
    assigningConversationState,
    answeredConversationsState,
    bannerState,
    clearTypingSignal,
    conversationCacheRef,
    conversationsState,
    lastTypingSentAtRef,
    pendingTagMutationsRef,
    postTypingSignal,
    recentOptimisticReplyAtRef,
    savingEmailState,
    savingSiteIdState,
    sendingReplyState,
    showBanner,
    sitesState,
    updatingStatusState
  };
}
