import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { BannerState } from "./dashboard-client.types";
import type { ConversationSummary, ConversationThread, Site } from "@/lib/types";

export type StateSetter<T> = Dispatch<SetStateAction<T>>;

export type DashboardActionsParams = {
  activeConversation: ConversationThread | null;
  conversations: ConversationSummary[];
  sendingReply: boolean;
  setSites: StateSetter<Site[]>;
  setConversations: StateSetter<ConversationSummary[]>;
  setActiveConversation: StateSetter<ConversationThread | null>;
  setSavingSiteId: StateSetter<string | null>;
  setSavingEmail: StateSetter<boolean>;
  setAssigningConversation: StateSetter<boolean>;
  setSendingReply: StateSetter<boolean>;
  setUpdatingStatus: StateSetter<boolean>;
  setAnsweredConversations: StateSetter<number>;
  setBanner: StateSetter<BannerState>;
  conversationCacheRef: MutableRefObject<Map<string, ConversationThread>>;
  recentOptimisticReplyAtRef: MutableRefObject<Map<string, number>>;
  pendingTagMutationsRef: MutableRefObject<Set<string>>;
  activeTypingConversationIdRef: MutableRefObject<string | null>;
  lastTypingSentAtRef: MutableRefObject<number>;
  showBanner: (tone: NonNullable<BannerState>["tone"], text: string) => void;
  clearTypingSignal: () => Promise<void>;
  postTypingSignal: (conversationId: string, typing: boolean) => Promise<void>;
};
