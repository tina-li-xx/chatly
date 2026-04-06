"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { ConversationThread } from "@/lib/types";
import type { BannerState, DashboardClientProps } from "./dashboard-client.types";
import { topTagsFromConversations } from "./dashboard-client.utils";
import { filterDashboardConversations } from "./dashboard-state-helpers";
import { useDashboardStateEffects } from "./use-dashboard-state-effects";
import { createDashboardActions } from "./use-dashboard-actions";
import { useDashboardStateNetwork } from "./use-dashboard-state-network";

export type ThreadFilter = "all" | "open" | "resolved";
export type AssignmentFilter = "all" | "unassigned" | "mine" | "assignedToTeammate";
export function useDashboardState({
  initialStats,
  initialSites,
  initialConversations,
  initialActiveConversation,
  initialTeamMembers
}: Pick<
  DashboardClientProps,
  "initialStats" | "initialSites" | "initialConversations" | "initialActiveConversation" | "initialTeamMembers"
>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeConversationId = searchParams?.get("id")?.trim() || null;
  const initialLoadingConversationId = routeConversationId && routeConversationId !== initialActiveConversation?.id ? routeConversationId : null;
  const [sites, setSites] = useState(initialSites);
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversation, setActiveConversation] = useState(initialActiveConversation);
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(initialLoadingConversationId);
  const [answeredConversations, setAnsweredConversations] = useState(initialStats.answeredConversations);
  const [ratedConversations, setRatedConversations] = useState(initialStats.ratedConversations);
  const [banner, setBanner] = useState<BannerState>(null);
  const [savingSiteId, setSavingSiteId] = useState<string | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);
  const [assigningConversation, setAssigningConversation] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [threadFilter, setThreadFilter] = useState<ThreadFilter>("all");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visitorTypingConversationId, setVisitorTypingConversationId] = useState<string | null>(null);
  const [liveConnectionState, setLiveConnectionState] = useState<"connected" | "reconnecting">("connected");
  const currentUserId = initialTeamMembers?.find((member) => member.isCurrentUser)?.id ?? null;
  const activeTypingConversationIdRef = useRef<string | null>(null);
  const activeConversationIdRef = useRef<string | null>(initialActiveConversation?.id ?? null);
  const conversationsRef = useRef(initialConversations);
  const conversationCacheRef = useRef<Map<string, ConversationThread>>(
    initialActiveConversation ? new Map([[initialActiveConversation.id, initialActiveConversation]]) : new Map()
  );
  const openRequestIdRef = useRef(0);
  const lastTypingSentAtRef = useRef(0);
  const visitorActivityRequestedRef = useRef<Set<string>>(new Set());
  const recentOptimisticReplyAtRef = useRef<Map<string, number>>(new Map());
  const pendingTagMutationsRef = useRef<Set<string>>(new Set());
  const {
    showBanner,
    applyReadState,
    refreshConversationList,
    refreshConversationSummary,
    refreshConversation,
    hydrateConversationVisitorActivity,
    openConversation,
    clearActiveConversation,
    markConversationAsRead,
    postTypingSignal,
    clearTypingSignal
  } = useDashboardStateNetwork({
    setBanner,
    setConversations,
    setActiveConversation,
    setLoadingConversationId,
    conversationCacheRef,
    visitorActivityRequestedRef,
    openRequestIdRef,
    activeTypingConversationIdRef,
    lastTypingSentAtRef
  });

  useEffect(() => {
    if (activeConversation) {
      conversationCacheRef.current.set(activeConversation.id, activeConversation);
    }
  }, [activeConversation]);

  useDashboardStateEffects({
    pathname,
    searchParams: searchParams ? new URLSearchParams(searchParams.toString()) : null,
    routeConversationId,
    initialSites,
    initialConversations,
    initialActiveConversation,
    initialAnsweredConversations: initialStats.answeredConversations,
    initialRatedConversations: initialStats.ratedConversations,
    conversations,
    activeConversation,
    loadingConversationId,
    setSites,
    setConversations,
    setActiveConversation,
    setAnsweredConversations,
    setRatedConversations,
    setBanner,
    setLoadingConversationId,
    setVisitorTypingConversationId,
    setLiveConnectionState,
    activeTypingConversationIdRef,
    activeConversationIdRef,
    conversationsRef,
    recentOptimisticReplyAtRef,
    applyReadState,
    refreshConversationList,
    refreshConversationSummary,
    refreshConversation,
    hydrateConversationVisitorActivity,
    openConversation,
    clearActiveConversation,
    clearTypingSignal,
    markConversationAsRead
  });

  const {
    handleSiteTitleSave,
    handleSaveConversationEmail,
    handleConversationAssignmentChange,
    handleReplySend,
    handleReplyRetry,
    handleConversationStatusChange,
    handleTagToggle,
    handleReplyComposerInput,
    handleReplyComposerFocus,
    handleReplyComposerBlur
  } = createDashboardActions({
    activeConversation,
    conversations,
    sendingReply,
    setSites,
    setConversations,
    setActiveConversation,
    setSavingSiteId,
    setSavingEmail,
    setAssigningConversation,
    setSendingReply,
    setUpdatingStatus,
    setAnsweredConversations,
    setBanner,
    conversationCacheRef,
    recentOptimisticReplyAtRef,
    pendingTagMutationsRef,
    activeTypingConversationIdRef,
    lastTypingSentAtRef,
    showBanner,
    clearTypingSignal,
    postTypingSignal
  });

  const filteredConversations = filterDashboardConversations(
    conversations,
    threadFilter,
    assignmentFilter,
    searchQuery,
    currentUserId
  );
  return {
    sites,
    conversations,
    filteredConversations,
    activeConversation,
    answeredConversations,
    ratedConversations,
    banner,
    savingSiteId,
    savingEmail,
    assigningConversation,
    sendingReply,
    updatingStatus,
    threadFilter,
    assignmentFilter,
    searchQuery,
    visitorTypingConversationId,
    liveConnectionState,
    loadingConversationId,
    topTags: topTagsFromConversations(conversations),
    handleSiteTitleSave,
    handleSaveConversationEmail,
    handleConversationAssignmentChange,
    handleReplySend,
    handleReplyRetry,
    handleConversationStatusChange,
    handleReplyComposerBlur,
    handleReplyComposerFocus,
    handleReplyComposerInput,
    handleTagToggle,
    openConversation,
    clearActiveConversation,
    setThreadFilter,
    setAssignmentFilter,
    setSearchQuery
  };
}

export type DashboardState = ReturnType<typeof useDashboardState>;
