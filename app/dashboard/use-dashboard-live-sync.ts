"use client";

import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react";

type LiveEvent = {
  type: string;
  conversationId?: string;
  sender?: "user" | "founder";
  actor?: "visitor" | "team";
  typing?: boolean;
};

export function useDashboardLiveSync({
  activeConversationIdRef,
  recentOptimisticReplyAtRef,
  applyReadState,
  refreshConversationList,
  refreshConversation,
  markConversationAsRead,
  setVisitorTypingConversationId,
  setLiveConnectionState
}: {
  activeConversationIdRef: MutableRefObject<string | null>;
  recentOptimisticReplyAtRef: MutableRefObject<Map<string, number>>;
  applyReadState: (conversationId: string) => void;
  refreshConversationList: () => Promise<void>;
  refreshConversation: (conversationId: string) => Promise<{ id: string } | null>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  setVisitorTypingConversationId: Dispatch<SetStateAction<string | null>>;
  setLiveConnectionState: Dispatch<SetStateAction<"connected" | "reconnecting">>;
}) {
  useEffect(() => {
    const eventSource = new EventSource("/dashboard/live");

    eventSource.onopen = () => {
      setLiveConnectionState("connected");
    };

    eventSource.onmessage = (messageEvent) => {
      let event: LiveEvent;

      try {
        event = JSON.parse(messageEvent.data);
      } catch (error) {
        return;
      }

      setLiveConnectionState("connected");

      if (event.type === "connected") {
        return;
      }

      if (event.type === "typing.updated" && event.actor === "visitor" && event.conversationId) {
        setVisitorTypingConversationId((current) =>
          event.typing ? event.conversationId! : current === event.conversationId ? null : current
        );
        return;
      }

      if (event.type === "conversation.read" && event.conversationId) {
        applyReadState(event.conversationId);
        return;
      }

      const skipFounderThreadRefresh =
        event.type === "message.created" &&
        event.sender === "founder" &&
        Boolean(event.conversationId) &&
        (() => {
          const timestamp = recentOptimisticReplyAtRef.current.get(event.conversationId!);
          if (!timestamp) {
            return false;
          }

          if (Date.now() - timestamp > 5000) {
            recentOptimisticReplyAtRef.current.delete(event.conversationId!);
            return false;
          }

          return true;
        })();

      void refreshConversationList();

      if (
        event.conversationId &&
        activeConversationIdRef.current === event.conversationId &&
        !skipFounderThreadRefresh
      ) {
        void refreshConversation(event.conversationId).then((conversation) => {
          if (conversation && event.type === "message.created" && event.sender === "user") {
            void markConversationAsRead(conversation.id);
          }
        });
      }
    };

    eventSource.onerror = () => {
      setLiveConnectionState("reconnecting");
      void refreshConversationList();
      if (activeConversationIdRef.current) {
        void refreshConversation(activeConversationIdRef.current);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [
    activeConversationIdRef,
    applyReadState,
    markConversationAsRead,
    recentOptimisticReplyAtRef,
    refreshConversation,
    refreshConversationList,
    setLiveConnectionState,
    setVisitorTypingConversationId
  ]);
}
