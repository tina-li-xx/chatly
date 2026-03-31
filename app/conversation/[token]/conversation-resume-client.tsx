"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useToast } from "../../ui/toast-provider";
import { ConversationThreadShell, type ConversationThreadMessage } from "../conversation-thread-shell";
import type { ConversationResumeIdentity } from "@/lib/conversation-resume-types";
type ConversationResumeClientProps = {
  brandingLabel: string;
  brandingUrl: string;
  brandColor: string;
  identity: ConversationResumeIdentity;
  initialMessages: ConversationThreadMessage[];
  showBranding: boolean;
  teamPhotoUrl: string | null;
  widgetTitle: string;
};

export function ConversationResumeClient({
  brandingLabel,
  brandingUrl,
  brandColor,
  identity,
  initialMessages,
  showBranding,
  teamPhotoUrl,
  widgetTitle
}: ConversationResumeClientProps) {
  const { showToast } = useToast();
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [sending, setSending] = useState(false);
  const [teamTyping, setTeamTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const query = useMemo(
    () => new URLSearchParams(identity).toString(),
    [identity.conversationId, identity.sessionId, identity.siteId]
  );

  async function refreshConversation() {
    const response = await fetch(`/api/public/conversation?${query}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("THREAD_REFRESH_FAILED");
    }

    const payload = (await response.json()) as { messages: ConversationThreadMessage[] };
    setMessages(payload.messages);
  }

  function sendTyping(typing: boolean) {
    void fetch("/api/public/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...identity, typing })
    }).catch(() => undefined);
  }
  useEffect(() => {
    void fetch(`/api/public/site-config?${query}&pageUrl=${encodeURIComponent(window.location.href)}`, {
      cache: "no-store"
    }).catch(() => undefined);

    const source = new EventSource(`/api/public/conversation-live?${query}`);
    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { type?: string; actor?: string; typing?: boolean };
        if (payload.type === "typing.updated" && payload.actor === "team") {
          setTeamTyping(Boolean(payload.typing));
          return;
        }
        if (payload.type === "message.created" || payload.type === "conversation.updated") {
          void refreshConversation().catch(() => undefined);
        }
      } catch {
        return;
      }
    };

    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      sendTyping(false);
      source.close();
    };
  }, [query]);

  function handleContentChange(nextValue: string) {
    setContent(nextValue);
    sendTyping(Boolean(nextValue.trim()));
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => sendTyping(false), 1500);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextContent = content.trim();
    if (!nextContent || sending) {
      return;
    }

    const optimisticId = `pending-${Date.now()}`;
    setSending(true);
    setContent("");
    setTeamTyping(false);
    setMessages((current) => [
      ...current,
      { id: optimisticId, content: nextContent, createdAt: new Date().toISOString(), sender: "user", attachments: [] }
    ]);
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    sendTyping(false);

    try {
      const response = await fetch("/api/public/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...identity, content: nextContent, pageUrl: window.location.href })
      });
      if (!response.ok) {
        throw new Error("SEND_FAILED");
      }
      await refreshConversation();
    } catch {
      setMessages((current) => current.filter((message) => message.id !== optimisticId));
      setContent(nextContent);
      showToast("error", "We couldn't send that message.", "Please try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <ConversationThreadShell
      brandingLabel={brandingLabel}
      brandingUrl={brandingUrl}
      brandColor={brandColor}
      content={content}
      messages={messages}
      onChangeContent={handleContentChange}
      onSubmit={handleSubmit}
      sending={sending}
      showBranding={showBranding}
      teamPhotoUrl={teamPhotoUrl}
      teamTyping={teamTyping}
      widgetTitle={widgetTitle}
    />
  );
}
