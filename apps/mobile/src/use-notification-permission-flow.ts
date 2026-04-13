import { useCallback, useEffect, useState } from "react";
import {
  loadNotificationPermissionState,
  saveNotificationPermissionState
} from "./notification-permission-storage";

type PermissionStatus = "denied" | "granted" | "unavailable" | "undetermined";

export function useNotificationPermissionFlow(input: {
  permissionStatus: PermissionStatus;
  unreadCount: number;
  userId: string | null;
  onOpenSettings(): Promise<void>;
  onRequestPermission(): Promise<PermissionStatus>;
}) {
  const [loaded, setLoaded] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState<"prompt" | "success">("prompt");
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [state, setState] = useState({ nudgeDismissedUntil: null as string | null, onboardingSeenAt: null as string | null });

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (!input.userId) {
        setLoaded(true);
        setState({ nudgeDismissedUntil: null, onboardingSeenAt: null });
        return;
      }
      const next = await loadNotificationPermissionState(input.userId);
      if (!cancelled) {
        setState(next);
        setLoaded(true);
      }
    }
    setLoaded(false);
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [input.userId]);

  useEffect(() => {
    if (!loaded || !input.userId) {
      return;
    }
    if (input.permissionStatus === "granted") {
      setOnboardingVisible(false);
      setNudgeVisible(false);
      return;
    }
    if (!state.onboardingSeenAt) {
      setOnboardingMode("prompt");
      setOnboardingVisible(true);
      return;
    }
    const dismissedUntil = state.nudgeDismissedUntil ? new Date(state.nudgeDismissedUntil).getTime() : 0;
    setNudgeVisible(input.unreadCount > 0 && Date.now() > dismissedUntil);
  }, [input.permissionStatus, input.unreadCount, input.userId, loaded, state]);

  const save = useCallback(async (next: typeof state) => {
    setState(next);
    if (input.userId) {
      await saveNotificationPermissionState(input.userId, next);
    }
  }, [input.userId, state]);

  const skipOnboarding = useCallback(async () => {
    await save({ ...state, onboardingSeenAt: new Date().toISOString() });
    setOnboardingVisible(false);
  }, [save, state]);

  const enableNotifications = useCallback(async () => {
    const status = await input.onRequestPermission();
    await save({ ...state, onboardingSeenAt: new Date().toISOString() });
    if (status === "granted") {
      setOnboardingMode("success");
      setOnboardingVisible(true);
      setNudgeVisible(false);
      return;
    }
    setOnboardingVisible(false);
  }, [input, save, state]);

  const dismissNudge = useCallback(async () => {
    const next = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await save({ ...state, nudgeDismissedUntil: next });
    setNudgeVisible(false);
  }, [save, state]);

  return {
    dismissNudge,
    enableNotifications,
    nudgeVisible,
    onboardingMode,
    onboardingVisible,
    openSettings: input.onOpenSettings,
    skipOnboarding
  };
}
