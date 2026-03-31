"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ConversationThreadShell,
  type ConversationThreadMessage
} from "../conversation-thread-shell";

type ConversationPreviewClientProps = {
  agentName: string;
  brandColor: string;
  brandingLabel: string;
  brandingUrl: string;
  initialMessages: ConversationThreadMessage[];
  showBranding: boolean;
  teamPhotoUrl: string | null;
  teamName: string;
  widgetTitle: string;
};

export function ConversationPreviewClient({
  agentName,
  brandColor,
  brandingLabel,
  brandingUrl,
  initialMessages,
  showBranding,
  teamPhotoUrl,
  teamName,
  widgetTitle
}: ConversationPreviewClientProps) {
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [sending, setSending] = useState(false);
  const replyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) {
        window.clearTimeout(replyTimeoutRef.current);
      }
    };
  }, []);

  function queuePreviewReply() {
    replyTimeoutRef.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `preview-team-${Date.now()}`,
          content: `Thanks for the message. ${agentName} from ${teamName} will follow up here shortly.`,
          createdAt: new Date().toISOString(),
          sender: "team",
          attachments: []
        }
      ]);
      setSending(false);
    }, 420);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextContent = content.trim();

    if (!nextContent || sending) {
      return;
    }

    if (replyTimeoutRef.current) {
      window.clearTimeout(replyTimeoutRef.current);
    }

    setSending(true);
    setContent("");
    setMessages((current) => [
      ...current,
      {
        id: `preview-user-${Date.now()}`,
        content: nextContent,
        createdAt: new Date().toISOString(),
        sender: "user",
        attachments: []
      }
    ]);
    queuePreviewReply();
  }

  return (
    <ConversationThreadShell
      brandingLabel={brandingLabel}
      brandingUrl={brandingUrl}
      brandColor={brandColor}
      content={content}
      messages={messages}
      onChangeContent={setContent}
      onSubmit={handleSubmit}
      sending={sending}
      showBranding={showBranding}
      teamPhotoUrl={teamPhotoUrl}
      widgetTitle={widgetTitle}
    />
  );
}
