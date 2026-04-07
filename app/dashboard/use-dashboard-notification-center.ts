"use client";

import { useEffect, useRef, useState } from "react";
import { DASHBOARD_NOTIFICATION_SETTINGS_UPDATED_EVENT } from "@/lib/browser-event-contracts";
import type { DashboardSettingsNotifications } from "@/lib/data/settings-types";
import { pageLabelFromUrl } from "./dashboard-ui";
import { subscribeDashboardLiveClient } from "./dashboard-live-client";

export type DashboardToast = {
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
  } catch {
    // Ignore browser autoplay and audio-context errors.
  }
}

function pushBrowserNotification(title: string, body: string, enabled: boolean) {
  if (
    !enabled ||
    document.visibilityState === "visible" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  try {
    new Notification(title, { body });
  } catch {
    // Ignore browser notification errors.
  }
}

export function useDashboardNotificationCenterState(input: {
  activeConversationId: string | null;
  initialSettings: DashboardSettingsNotifications;
}) {
  const [settings, setSettings] = useState(input.initialSettings);
  const [toast, setToast] = useState<DashboardToast | null>(null);
  const settingsRef = useRef(settings);
  const activeConversationIdRef = useRef(input.activeConversationId);

  useEffect(() => {
    setSettings(input.initialSettings);
  }, [input.initialSettings]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!settings.browserNotifications || !("Notification" in window) || Notification.permission !== "default") {
      return;
    }

    void Notification.requestPermission().catch(() => {});
  }, [settings.browserNotifications]);

  useEffect(() => {
    activeConversationIdRef.current = input.activeConversationId;
  }, [input.activeConversationId]);

  useEffect(() => {
    const handleSettingsUpdate = (event: Event) => {
      const detail = (event as CustomEvent<DashboardSettingsNotifications>).detail;
      if (detail) {
        setSettings(detail);
      }
    };

    window.addEventListener(
      DASHBOARD_NOTIFICATION_SETTINGS_UPDATED_EVENT,
      handleSettingsUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        DASHBOARD_NOTIFICATION_SETTINGS_UPDATED_EVENT,
        handleSettingsUpdate as EventListener
      );
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
    const unsubscribe = subscribeDashboardLiveClient({
      onMessage(event) {
        if (event.type !== "message.created" || event.sender !== "user") {
          return;
        }

        const currentSettings = settingsRef.current;
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

        pushBrowserNotification(
          nextToast?.title ?? messageTitle,
          nextToast?.preview ?? messagePreview,
          currentSettings.browserNotifications
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    toast,
    dismissToast() {
      setToast(null);
    }
  };
}
