"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { ConversationSummary, ConversationThread } from "@/lib/types";
import type { BannerState, DashboardClientProps } from "./dashboard-client.types";
import { topTagsFromConversations } from "./dashboard-client.utils";
import { toSummary } from "./dashboard-state-helpers";
import { useDashboardLiveSync } from "./use-dashboard-live-sync";
import { createDashboardActions } from "./use-dashboard-actions";

type ThreadFilter = "all" | "open" | "resolved";

export function useDashboardState({
  initialStats,
  initialSites,
  initialConversations,
  initialActiveConversation
}: Pick<
  DashboardClientProps,
  "initialStats" | "initialSites" | "initialConversations" | "initialActiveConversation"
>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeConversationId = searchParams?.get("id")?.trim() || null;
  const [sites, setSites] = useState(initialSites);
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversation, setActiveConversation] = useState(initialActiveConversation);
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(routeConversationId);
  const [answeredConversations, setAnsweredConversations] = useState(initialStats.answeredConversations);
  const [ratedConversations, setRatedConversations] = useState(initialStats.ratedConversations);
  const [banner, setBanner] = useState<BannerState>(null);
  const [savingSiteId, setSavingSiteId] = useState<string | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [threadFilter, setThreadFilter] = useState<ThreadFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visitorTypingConversationId, setVisitorTypingConversationId] = useState<string | null>(null);
  const [liveConnectionState, setLiveConnectionState] = useState<"connected" | "reconnecting">("connected");
  const activeTypingConversationIdRef = useRef<string | null>(null);
  const activeConversationIdRef = useRef<string | null>(initialActiveConversation?.id ?? null);
  const conversationsRef = useRef(initialConversations);
  const conversationCacheRef = useRef<Map<string, ConversationThread>>(
    initialActiveConversation ? new Map([[initialActiveConversation.id, initialActiveConversation]]) : new Map()
  );
  const openRequestIdRef = useRef(0);
  const lastTypingSentAtRef = useRef(0);
  const recentOptimisticReplyAtRef = useRef<Map<string, number>>(new Map());
  const pendingTagMutationsRef = useRef<Set<string>>(new Set());

  function showBanner(tone: NonNullable<BannerState>["tone"], text: string) {
    setBanner({ tone, text });
  }

  function syncSummary(summary: ConversationSummary, moveToTop = false) {
    setConversations((current) => {
      const exists = current.some((conversation) => conversation.id === summary.id);
      if (!exists) {
        return [summary, ...current];
      }

      const updated = current.map((conversation) => (conversation.id === summary.id ? summary : conversation));
      if (!moveToTop) {
        return updated;
      }

      const next = updated.find((conversation) => conversation.id === summary.id);
      return next ? [next, ...updated.filter((conversation) => conversation.id !== summary.id)] : updated;
    });
  }

  function applyReadState(conversationId: string) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
      )
    );
    setActiveConversation((current) =>
      current && current.id === conversationId ? { ...current, unreadCount: 0 } : current
    );
  }

  async function refreshConversationList() {
    try {
      const response = await fetch("/dashboard/conversations", {
        method: "GET",
        cache: "no-store"
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { ok: true; conversations: ConversationSummary[] };
      setConversations(payload.conversations);
    } catch {
      return;
    }
  }

  async function fetchConversationById(conversationId: string) {
    try {
      const response = await fetch(`/dashboard/conversation?conversationId=${encodeURIComponent(conversationId)}`, {
        method: "GET",
        cache: "no-store"
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as { ok: true; conversation: ConversationThread };
      conversationCacheRef.current.set(payload.conversation.id, payload.conversation);
      return payload.conversation;
    } catch {
      return null;
    }
  }

  async function refreshConversation(conversationId: string) {
    const conversation = await fetchConversationById(conversationId);
    if (!conversation) {
      return null;
    }

    setActiveConversation(conversation);
    syncSummary(toSummary(conversation), true);
    return conversation;
  }

  async function openConversation(conversationId: string) {
    const requestId = ++openRequestIdRef.current;
    setLoadingConversationId(conversationId);

    const cached = conversationCacheRef.current.get(conversationId);
    if (cached) {
      setActiveConversation(cached);
      syncSummary(toSummary(cached), true);
      setLoadingConversationId(null);
      void markConversationAsRead(conversationId);
      return cached;
    }

    const conversation = await fetchConversationById(conversationId);
    if (openRequestIdRef.current !== requestId) {
      return conversation;
    }

    if (conversation) {
      setActiveConversation(conversation);
      syncSummary(toSummary(conversation), true);
      void markConversationAsRead(conversationId);
    }

    setLoadingConversationId(null);
    return conversation;
  }

  function clearActiveConversation() {
    setLoadingConversationId(null);
    setActiveConversation(null);
  }

  async function markConversationAsRead(conversationId: string) {
    applyReadState(conversationId);
    await fetch("/dashboard/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
      keepalive: true
    }).catch(() => {});
  }

  async function postTypingSignal(conversationId: string, typing: boolean) {
    await fetch("/dashboard/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, typing }),
      keepalive: !typing
    }).catch(() => {});
  }

  async function clearTypingSignal() {
    const conversationId = activeTypingConversationIdRef.current;
    if (!conversationId) {
      return;
    }

    activeTypingConversationIdRef.current = null;
    lastTypingSentAtRef.current = 0;
    await postTypingSignal(conversationId, false);
  }

  useEffect(() => {
    setSites(initialSites);
    setConversations(initialConversations);
    setActiveConversation(initialActiveConversation);
    setAnsweredConversations(initialStats.answeredConversations);
    setRatedConversations(initialStats.ratedConversations);
    setBanner(null);
  }, [initialActiveConversation, initialConversations, initialSites, initialStats]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    if (activeConversation) {
      conversationCacheRef.current.set(activeConversation.id, activeConversation);
    }
  }, [activeConversation]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversation?.id ?? null;
  }, [activeConversation?.id]);

  useEffect(() => {
    if (pathname !== "/dashboard/inbox") {
      return;
    }

    if (!routeConversationId) {
      clearActiveConversation();
      return;
    }

    if (
      routeConversationId === activeConversationIdRef.current ||
      routeConversationId === loadingConversationId
    ) {
      return;
    }

    void openConversation(routeConversationId);
  }, [pathname, routeConversationId, loadingConversationId]);

  useEffect(() => {
    const currentTypingConversationId = activeTypingConversationIdRef.current;

    if (
      currentTypingConversationId &&
      currentTypingConversationId !== (activeConversation?.id ?? null)
    ) {
      void clearTypingSignal();
    }
  }, [activeConversation?.id]);

  useEffect(
    () => () => {
      void clearTypingSignal();
    },
    []
  );

  useEffect(() => {
    if (!activeConversation?.id) {
      return;
    }

    setVisitorTypingConversationId((current) =>
      current === activeConversation.id ? current : null
    );
    void markConversationAsRead(activeConversation.id);
  }, [activeConversation?.id]);

  useEffect(() => {
    if (!searchParams) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    const hadSuccess = nextParams.has("success");
    const hadError = nextParams.has("error");

    nextParams.delete("success");
    nextParams.delete("error");

    if (!hadSuccess && !hadError) {
      return;
    }

    const nextUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [pathname, searchParams]);

  useDashboardLiveSync({
    activeConversationIdRef,
    recentOptimisticReplyAtRef,
    applyReadState,
    refreshConversationList,
    refreshConversation,
    markConversationAsRead,
    setVisitorTypingConversationId,
    setLiveConnectionState
  });

  const {
    handleSiteTitleSave,
    handleSaveConversationEmail,
    handleReplySend,
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
    setSendingReply,
    setUpdatingStatus,
    setAnsweredConversations,
    setBanner,
    recentOptimisticReplyAtRef,
    pendingTagMutationsRef,
    activeTypingConversationIdRef,
    lastTypingSentAtRef,
    showBanner,
    clearTypingSignal,
    postTypingSignal
  });

  const filteredConversations = conversations.filter((conversation) => {
    if (threadFilter === "open" && conversation.status !== "open") {
      return false;
    }

    if (threadFilter === "resolved" && conversation.status !== "resolved") {
      return false;
    }

    const needle = searchQuery.trim().toLowerCase();
    if (!needle) {
      return true;
    }

    const haystack = [
      conversation.email,
      conversation.siteName,
      conversation.pageUrl,
      conversation.lastMessagePreview,
      conversation.city,
      conversation.country
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(needle);
  });

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
    sendingReply,
    updatingStatus,
    threadFilter,
    searchQuery,
    visitorTypingConversationId,
    liveConnectionState,
    loadingConversationId,
    topTags: topTagsFromConversations(conversations),
    handleSiteTitleSave,
    handleSaveConversationEmail,
    handleReplySend,
    handleConversationStatusChange,
    handleReplyComposerBlur,
    handleReplyComposerFocus,
    handleReplyComposerInput,
    handleTagToggle,
    openConversation,
    clearActiveConversation,
    setThreadFilter,
    setSearchQuery
  };
}
