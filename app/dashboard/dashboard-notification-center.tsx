"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { DashboardSettingsNotifications } from "@/lib/data/settings";
import type { DashboardLiveEvent } from "@/lib/live-events";
import { pageLabelFromUrl, XIcon } from "./dashboard-ui";
import { useDashboardNavigation } from "./dashboard-shell";

type DashboardNotificationCenterProps = {
  initialSettings: DashboardSettingsNotifications;
};

type DashboardToast = {
  conversationId: string;
  title: string;
  preview: string;
};

function playAlertSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    gain.gain.setValueAtTime(0.035, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.16);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.16);
    oscillator.onended = () => {
      void context.close().catch(() => {});
    };
  } catch (error) {
    // Ignore browser autoplay and audio-context errors.
  }
}

export function DashboardNotificationCenter({
  initialSettings
}: DashboardNotificationCenterProps) {
  const navigation = useDashboardNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeConversationId = pathname === "/dashboard/inbox" ? searchParams?.get("id")?.trim() || null : null;
  const [settings, setSettings] = useState(initialSettings);
  const [toast, setToast] = useState<DashboardToast | null>(null);
  const settingsRef = useRef(settings);
  const activeConversationIdRef = useRef(activeConversationId);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (
      !settings.browserNotifications ||
      !("Notification" in window) ||
      Notification.permission !== "default"
    ) {
      return;
    }

    void Notification.requestPermission().catch(() => {});
  }, [settings.browserNotifications]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    const handleSettingsUpdate = (event: Event) => {
      const detail = (event as CustomEvent<DashboardSettingsNotifications>).detail;
      if (detail) {
        setSettings(detail);
      }
    };

    window.addEventListener("chatly:notification-settings-updated", handleSettingsUpdate as EventListener);
    return () => {
      window.removeEventListener("chatly:notification-settings-updated", handleSettingsUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  useEffect(() => {
    const eventSource = new EventSource("/dashboard/live");

    const pushBrowserNotification = (title: string, body: string) => {
      if (
        !settingsRef.current.browserNotifications ||
        document.visibilityState === "visible" ||
        !("Notification" in window) ||
        Notification.permission !== "granted"
      ) {
        return;
      }

      try {
        new Notification(title, { body });
      } catch (error) {
        // Ignore browser notification errors.
      }
    };

    eventSource.onmessage = (messageEvent) => {
      let event: DashboardLiveEvent | { type: "connected" };

      try {
        event = JSON.parse(messageEvent.data);
      } catch (error) {
        return;
      }

      if (event.type === "connected") {
        return;
      }

      const currentSettings = settingsRef.current;
      if (event.type === "message.created" && event.sender === "user") {
        const messagePreview = event.preview?.trim() || "A visitor sent a new message.";
        const pageLabel = pageLabelFromUrl(event.pageUrl ?? null);
        const messageTitle = event.visitorLabel || event.siteName || "New visitor message";
        const genericToast =
          activeConversationIdRef.current !== event.conversationId
            ? {
                conversationId: event.conversationId,
                title: messageTitle,
                preview: messagePreview
              }
            : null;

        const specialToast =
          event.highIntent && currentSettings.highIntentAlerts
            ? {
                conversationId: event.conversationId,
                title: `High-intent visitor on ${pageLabel}`,
                preview: event.location ? `${event.location} • ${messagePreview}` : messagePreview
              }
            : event.isNewVisitor && currentSettings.newVisitorAlerts
              ? {
                  conversationId: event.conversationId,
                  title: event.location ? `New visitor from ${event.location}` : `New visitor on ${pageLabel}`,
                  preview: messagePreview
                }
              : null;

        const nextToast = specialToast ?? genericToast;
        if (nextToast) {
          setToast(nextToast);
        }

        if (currentSettings.soundAlerts) {
          playAlertSound();
        }

        const browserTitle = nextToast?.title ?? messageTitle;
        const browserBody = nextToast?.preview ?? messagePreview;
        pushBrowserNotification(browserTitle, browserBody);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (!toast) {
    return null;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        setToast(null);
        navigation?.navigate(`/dashboard/inbox?id=${toast.conversationId}`);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setToast(null);
          navigation?.navigate(`/dashboard/inbox?id=${toast.conversationId}`);
        }
      }}
      className="fixed right-4 top-20 z-40 w-[320px] rounded-lg border border-slate-200 bg-white px-4 py-3 text-left shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition hover:border-blue-200 sm:right-6"
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">{toast.title}</p>
          <p className="mt-1 truncate text-[13px] text-slate-500">{toast.preview}</p>
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={(event) => {
            event.stopPropagation();
            setToast(null);
          }}
          className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
