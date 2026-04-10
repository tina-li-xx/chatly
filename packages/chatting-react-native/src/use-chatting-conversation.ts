import { useEffect, useRef, useState } from "react";
import { ChattingClient } from "./chatting-client";
import { applyConversation, startConversationSync, syncTyping } from "./chatting-hook-helpers";
import type {
  ChattingFAQSuggestions,
  ChattingMessage,
  ChattingSiteConfig,
  ChattingSiteStatus,
  ChattingVisitorContext,
  ChattingVisitorProfile
} from "./chatting-types";
import { normalizeText, toErrorMessage } from "./chatting-utils";

export function useChattingConversation(input: {
  client: ChattingClient;
  context?: ChattingVisitorContext;
  profile?: ChattingVisitorProfile | null;
  draftVisitorEmail?: string | null;
  pollIntervalMs?: number;
}) {
  const [siteConfig, setSiteConfig] = useState<ChattingSiteConfig | null>(null);
  const [siteStatus, setSiteStatus] = useState<ChattingSiteStatus | null>(null);
  const [messages, setMessages] = useState<ChattingMessage[]>([]);
  const [faqSuggestions, setFaqSuggestions] = useState<ChattingFAQSuggestions | null>(null);
  const [draftMessage, setDraftMessageState] = useState("");
  const [emailAddress, setEmailAddress] = useState(input.draftVisitorEmail ?? "");
  const [teamTyping, setTeamTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const stopSyncRef = useRef<null | (() => void)>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshConversation = () => input.client.fetchConversation();

  const refreshConversationState = async () => {
    const conversation = await refreshConversation();
    setTeamTyping(false);
    applyConversation(conversation, setMessages, setFaqSuggestions);
    await startConversationSync({
      client: input.client,
      pollIntervalMs: input.pollIntervalMs,
      stopSyncRef,
      activeConversationIdRef,
      setMessages,
      setFaqSuggestions,
      setTeamTyping,
      setErrorMessage,
      refreshConversation
    });
  };

  useEffect(() => {
    if (typeof input.draftVisitorEmail === "string") {
      setEmailAddress(input.draftVisitorEmail);
    }
  }, [input.draftVisitorEmail]);

  useEffect(() => {
    let cancelled = false;
    stopSyncRef.current?.();
    stopSyncRef.current = null;
    activeConversationIdRef.current = null;
    setMessages([]);
    setFaqSuggestions(null);
    setTeamTyping(false);

    const bootstrap = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        if (input.draftVisitorEmail) {
          await input.client.saveEmail(input.draftVisitorEmail);
        }
        if (input.profile) {
          await input.client.identify(input.profile, input.context);
        }

        const [nextConfig, nextStatus, nextConversation] = await Promise.all([
          input.client.fetchSiteConfig(input.context),
          input.client.fetchSiteStatus(input.context),
          input.client.fetchConversationIfAvailable()
        ]);
        if (cancelled) {
          return;
        }

        setSiteConfig(nextConfig);
        setSiteStatus(nextStatus);
        if (!nextConversation) {
          return;
        }

        await input.client.syncPushToken();
        applyConversation(nextConversation, setMessages, setFaqSuggestions);
        await startConversationSync({
          client: input.client,
          pollIntervalMs: input.pollIntervalMs,
          stopSyncRef,
          activeConversationIdRef,
          setMessages,
          setFaqSuggestions,
          setTeamTyping,
          setErrorMessage,
          refreshConversation
        });
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(toErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
      stopSyncRef.current?.();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [input.client, input.context, input.draftVisitorEmail, input.pollIntervalMs, input.profile]);

  const setDraftMessage = (value: string) => {
    setDraftMessageState(value);
    void syncTyping({ client: input.client, value, typingTimeoutRef });
  };

  const sendMessage = async () => {
    const nextMessage = normalizeText(draftMessage);
    if (!nextMessage) {
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    try {
      await input.client.sendMessage(nextMessage, { context: input.context, email: emailAddress });
      setDraftMessageState("");
      setTeamTyping(false);
      await refreshConversationState();
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
    } finally {
      setIsSending(false);
    }
  };

  const saveEmail = async () => {
    setIsSavingEmail(true);
    setErrorMessage(null);
    try {
      await input.client.saveEmail(emailAddress);
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
    } finally {
      setIsSavingEmail(false);
    }
  };

  return {
    siteConfig,
    siteStatus,
    messages,
    faqSuggestions,
    draftMessage,
    emailAddress,
    teamTyping,
    errorMessage,
    isLoading,
    isSending,
    isSavingEmail,
    setDraftMessage,
    setEmailAddress,
    refreshConversation: refreshConversationState,
    sendMessage,
    saveEmail
  };
}
