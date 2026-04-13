import { useCallback, useEffect, useState } from "react";
import {
  getMobileBootstrap,
  updateMobileAvailability,
  updateMobileNotificationPreferences,
  updateMobilePassword as postMobilePasswordChange,
  updateMobileProfile as postMobileProfileUpdate
} from "./mobile-workspace-api";
import type {
  DashboardSavedReply,
  DashboardTeamMember,
  MobileAvailability,
  MobileNotificationPreferences,
  MobileProfile,
  MobileSession
} from "./types";

const DEFAULT_NOTIFICATION_PREFERENCES = {
  allMessagesEnabled: false,
  assignedEnabled: true,
  newConversationEnabled: true,
  pushEnabled: true,
  soundName: "chime",
  vibrationEnabled: true
} satisfies MobileNotificationPreferences;

export function useMobileWorkspace(session: MobileSession | null) {
  const [profile, setProfile] = useState<MobileProfile>({
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    avatarDataUrl: null
  });
  const [teamMembers, setTeamMembers] = useState<DashboardTeamMember[]>([]);
  const [savedReplies, setSavedReplies] = useState<DashboardSavedReply[]>([]);
  const [availability, setAvailability] = useState<MobileAvailability>("online");
  const [notificationPreferences, setNotificationPreferences] = useState<MobileNotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!session) {
      setProfile({ firstName: "", lastName: "", email: "", jobTitle: "", avatarDataUrl: null });
      setTeamMembers([]);
      setSavedReplies([]);
      setAvailability("online");
      setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
      return;
    }

    setLoading(true);
    try {
      const next = await getMobileBootstrap(session.baseUrl, session.token);
      setProfile(next.profile);
      setTeamMembers(next.teamMembers);
      setSavedReplies(next.savedReplies);
      setAvailability(next.availability);
      setNotificationPreferences(next.notificationPreferences);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveAvailability = useCallback(async (nextAvailability: MobileAvailability) => {
    if (!session) {
      return;
    }

    const previous = availability;
    setAvailability(nextAvailability);
    try {
      setAvailability(
        await updateMobileAvailability(
          session.baseUrl,
          session.token,
          nextAvailability
        )
      );
    } catch (error) {
      setAvailability(previous);
      throw error;
    }
  }, [availability, session]);

  const saveNotificationPreferences = useCallback(async (next: MobileNotificationPreferences) => {
    if (!session) {
      return;
    }

    const previous = notificationPreferences;
    setNotificationPreferences(next);
    try {
      setNotificationPreferences(
        await updateMobileNotificationPreferences(session.baseUrl, session.token, next)
      );
    } catch (error) {
      setNotificationPreferences(previous);
      throw error;
    }
  }, [notificationPreferences, session]);

  const saveProfile = useCallback(async (next: MobileProfile) => {
    if (!session) {
      return;
    }

    const previous = profile;
    setProfile(next);
    try {
      setProfile(
        await postMobileProfileUpdate(session.baseUrl, session.token, {
          firstName: next.firstName,
          lastName: next.lastName,
          jobTitle: next.jobTitle,
          avatarDataUrl: next.avatarDataUrl
        })
      );
    } catch (error) {
      setProfile(previous);
      throw error;
    }
  }, [profile, session]);

  const updatePassword = useCallback(async (input: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!session) {
      return;
    }

    await postMobilePasswordChange(session.baseUrl, session.token, input);
  }, [session]);

  return {
    availability,
    loading,
    notificationPreferences,
    profile,
    refresh,
    savedReplies,
    saveAvailability,
    saveNotificationPreferences,
    saveProfile,
    setSavedReplies,
    teamMembers,
    updatePassword
  };
}
