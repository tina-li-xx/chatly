"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ConversationSummary, VisitorPresenceSession } from "@/lib/types";
import { subscribeDashboardLiveClient } from "./dashboard-live-client";
import { fetchVisitorConversationSummaries, fetchVisitorsData } from "./dashboard-visitors-requests";
import {
  upsertVisitorConversationSummary,
  upsertVisitorPresenceSession
} from "./dashboard-visitors-live-state";
import type { VisitorRecord } from "./visitors-data";

export function useDashboardVisitorsData(input: {
  initialConversations: ConversationSummary[];
  initialLiveSessions: VisitorPresenceSession[];
}) {
  const [conversations, setConversations] = useState(input.initialConversations);
  const [liveSessions, setLiveSessions] = useState(input.initialLiveSessions);
  const [refreshing, setRefreshing] = useState(false);
  const [, setClockTick] = useState(0);
  const hydratedVisitorIdsRef = useRef(new Set<string>());
  const intervalIdRef = useRef<number | null>(null);
  const unsubscribeLiveRef = useRef<(() => void) | null>(null);
  const flushLivePatchesQueuedRef = useRef(false);
  const pendingConversationSummariesRef = useRef<ConversationSummary[]>([]);
  const pendingLiveSessionsRef = useRef<VisitorPresenceSession[]>([]);

  const flushLivePatches = useCallback(() => {
    flushLivePatchesQueuedRef.current = false;

    if (pendingConversationSummariesRef.current.length) {
      const pendingSummaries = pendingConversationSummariesRef.current;
      pendingConversationSummariesRef.current = [];
      setConversations((current) =>
        pendingSummaries.reduce(upsertVisitorConversationSummary, current)
      );
    }

    if (pendingLiveSessionsRef.current.length) {
      const pendingSessions = pendingLiveSessionsRef.current;
      pendingLiveSessionsRef.current = [];
      setLiveSessions((current) =>
        pendingSessions.reduce(upsertVisitorPresenceSession, current)
      );
    }
  }, []);

  const queueLivePatchFlush = useCallback(() => {
    if (flushLivePatchesQueuedRef.current) {
      return;
    }

    flushLivePatchesQueuedRef.current = true;
    void Promise.resolve().then(flushLivePatches);
  }, [flushLivePatches]);

  const queueConversationSummaryPatch = useCallback((summary: ConversationSummary) => {
    pendingConversationSummariesRef.current.push(summary);
    queueLivePatchFlush();
  }, [queueLivePatchFlush]);

  const queueLiveSessionPatch = useCallback((session: VisitorPresenceSession) => {
    pendingLiveSessionsRef.current.push(session);
    queueLivePatchFlush();
  }, [queueLivePatchFlush]);

  const loadVisitorDetails = useCallback(async (visitor: VisitorRecord) => {
    if ((!visitor.hasConversation && !visitor.hasEmail) || hydratedVisitorIdsRef.current.has(visitor.id)) {
      return false;
    }

    const payload = await fetchVisitorConversationSummaries({
      email: visitor.email,
      sessionId: visitor.sessionId,
      siteId: visitor.siteId
    });
    if (!payload) {
      return false;
    }

    hydratedVisitorIdsRef.current.add(visitor.id);
    setConversations((current) =>
      payload.summaries.reduce(upsertVisitorConversationSummary, current)
    );
    return true;
  }, []);

  const refreshVisitors = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    }

    try {
      const payload = await fetchVisitorsData();
      if (!payload) {
        return;
      }

      flushLivePatchesQueuedRef.current = false;
      pendingConversationSummariesRef.current = [];
      pendingLiveSessionsRef.current = [];
      hydratedVisitorIdsRef.current.clear();
      setConversations(payload.conversations);
      setLiveSessions(payload.liveSessions);
    } catch {
      // Keep the current UI steady if a refresh misses.
    } finally {
      if (manual) {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    flushLivePatchesQueuedRef.current = false;
    pendingConversationSummariesRef.current = [];
    pendingLiveSessionsRef.current = [];
    hydratedVisitorIdsRef.current.clear();
    setConversations(input.initialConversations);
    setLiveSessions(input.initialLiveSessions);
  }, [input.initialConversations, input.initialLiveSessions]);

  useEffect(() => {
    if (intervalIdRef.current !== null) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setClockTick((current) => current + 1);
    }, 30000);
    intervalIdRef.current = intervalId;

    return () => {
      if (intervalIdRef.current !== null) {
        window.clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (unsubscribeLiveRef.current) {
      return;
    }

    const unsubscribe = subscribeDashboardLiveClient({
      onError() {
        void refreshVisitors();
      },
      onMessage(event) {
        if (event.type === "visitor.presence.updated" && event.session) {
          queueLiveSessionPatch(event.session);
          return;
        }

        if (event.type === "message.created" && event.sender === "user" && event.summary) {
          queueConversationSummaryPatch(event.summary);
        }
      }
    });
    unsubscribeLiveRef.current = unsubscribe;

    return () => {
      unsubscribeLiveRef.current?.();
      unsubscribeLiveRef.current = null;
    };
  }, [queueConversationSummaryPatch, queueLiveSessionPatch, refreshVisitors]);

  return {
    conversations,
    liveSessions,
    loadVisitorDetails,
    refreshing,
    refreshVisitors
  };
}
