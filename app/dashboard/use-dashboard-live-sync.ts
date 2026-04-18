"use client";

import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from "react";
import { subscribeDashboardLiveClient } from "./dashboard-live-client";

export function useDashboardLiveSync({
  activeConversationIdRef,
  recentOptimisticReplyAtRef,
  applyReadState,
  refreshConversationList,
  refreshConversationSummary,
  refreshConversation,
  markConversationAsRead,
  setVisitorTypingConversationId,
  setLiveConnectionState
}: {
  activeConversationIdRef: MutableRefObject<string | null>;
  recentOptimisticReplyAtRef: MutableRefObject<Map<string, number>>;
  applyReadState: (conversationId: string) => void;
  refreshConversationList: () => Promise<void>;
  refreshConversationSummary: (conversationId: string) => Promise<{ id: string } | null>;
  refreshConversation: (conversationId: string) => Promise<{ id: string } | null>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  setVisitorTypingConversationId: Dispatch<SetStateAction<string | null>>;
  setLiveConnectionState: Dispatch<SetStateAction<"connected" | "reconnecting">>;
}) {
  useEffect(() => {
    const unsubscribe = subscribeDashboardLiveClient({
      onOpen() {
        setLiveConnectionState("connected");
      },
      onMessage(event) {
        setLiveConnectionState("connected");

        if (event.type === "connected") {
          return;
        }

        if (event.type === "team.presence.updated" || event.type === "team.members.updated") {
          return;
        }

        if (event.type === "typing.updated" && event.actor === "visitor" && event.conversationId) {
          setVisitorTypingConversationId((current) =>
            event.typing ? event.conversationId! : current === event.conversationId ? null : current
          );
          return;
        }

        if (event.type === "visitor.presence.updated") {
          if (!event.conversationId) {
            return;
          }

          if (activeConversationIdRef.current === event.conversationId) {
            void refreshConversation(event.conversationId);
            return;
          }

          void refreshConversationSummary(event.conversationId);
          return;
        }

        if (event.type === "conversation.read" && event.conversationId) {
          applyReadState(event.conversationId);
          return;
        }

        const skipTeamThreadRefresh =
          event.type === "message.created" &&
          event.sender === "team" &&
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

        if (skipTeamThreadRefresh) {
          return;
        }

        if (event.type === "conversation.updated" && event.conversationId) {
          if (activeConversationIdRef.current === event.conversationId) {
            void refreshConversation(event.conversationId);
            return;
          }

          void refreshConversationSummary(event.conversationId);
          return;
        }

        if (!event.conversationId) {
          return;
        }

        if (activeConversationIdRef.current === event.conversationId) {
          void refreshConversation(event.conversationId).then((conversation) => {
            if (conversation && event.type === "message.created" && event.sender === "user") {
              void markConversationAsRead(conversation.id);
            }
          });
          return;
        }

        void refreshConversationSummary(event.conversationId);
      },
      onError() {
        setLiveConnectionState("reconnecting");
        void refreshConversationList();
        if (activeConversationIdRef.current) {
          void refreshConversation(activeConversationIdRef.current);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [
    activeConversationIdRef,
    applyReadState,
    markConversationAsRead,
    recentOptimisticReplyAtRef,
    refreshConversation,
    refreshConversationList,
    refreshConversationSummary,
    setLiveConnectionState,
    setVisitorTypingConversationId
  ]);
}
