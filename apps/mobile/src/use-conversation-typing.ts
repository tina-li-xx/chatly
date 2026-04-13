import { useEffect, useRef, useState } from "react";
import { setConversationTyping } from "./api";

const TYPING_IDLE_MS = 1500;

export function useConversationTyping(input: {
  baseUrl: string;
  token: string;
  conversationId: string;
  draft: string;
}) {
  const activeRef = useRef(false);
  const [localTypingActive, setLocalTypingActive] = useState(false);

  useEffect(() => {
    const trimmed = input.draft.trim();
    if (!trimmed) {
      if (activeRef.current) {
        activeRef.current = false;
        setLocalTypingActive(false);
        void setConversationTyping(input.baseUrl, input.token, input.conversationId, false);
      }
      return;
    }

    if (!activeRef.current) {
      activeRef.current = true;
      setLocalTypingActive(true);
      void setConversationTyping(input.baseUrl, input.token, input.conversationId, true);
    }

    const timeout = setTimeout(() => {
      activeRef.current = false;
      setLocalTypingActive(false);
      void setConversationTyping(input.baseUrl, input.token, input.conversationId, false);
    }, TYPING_IDLE_MS);

    return () => clearTimeout(timeout);
  }, [input.baseUrl, input.conversationId, input.draft, input.token]);

  useEffect(() => () => {
    if (activeRef.current) {
      activeRef.current = false;
      void setConversationTyping(input.baseUrl, input.token, input.conversationId, false);
    }
  }, [input.baseUrl, input.conversationId, input.token]);

  return { localTypingActive };
}
