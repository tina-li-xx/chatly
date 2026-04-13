const mocks = vi.hoisted(() => ({
  getMobileNotificationPreferences: vi.fn(),
  listActiveTeamMobilePushRegistrations: vi.fn(),
  sendTeamApnsPushNotifications: vi.fn(),
  sendTeamExpoPushNotifications: vi.fn(),
  sendTeamFcmPushNotifications: vi.fn()
}));

vi.mock("@/lib/data/mobile-preferences", () => ({
  getMobileNotificationPreferences: mocks.getMobileNotificationPreferences
}));

vi.mock("@/lib/repositories/team-mobile-device-repository", () => ({
  listActiveTeamMobilePushRegistrations: mocks.listActiveTeamMobilePushRegistrations
}));

vi.mock("@/lib/team-mobile-apns-push", () => ({
  sendTeamApnsPushNotifications: mocks.sendTeamApnsPushNotifications
}));

vi.mock("@/lib/team-mobile-expo-push", () => ({
  sendTeamExpoPushNotifications: mocks.sendTeamExpoPushNotifications
}));

vi.mock("@/lib/team-mobile-fcm-push", () => ({
  sendTeamFcmPushNotifications: mocks.sendTeamFcmPushNotifications
}));

import { sendTeamMobilePushNotifications } from "@/lib/team-mobile-push";

describe("team mobile push", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMobileNotificationPreferences.mockResolvedValue({
      allMessagesEnabled: true,
      assignedEnabled: true,
      newConversationEnabled: true,
      pushEnabled: true,
      soundName: "chime",
      vibrationEnabled: true
    });
    mocks.sendTeamApnsPushNotifications.mockResolvedValue({ sent: 0, disabled: 0 });
    mocks.sendTeamExpoPushNotifications.mockResolvedValue({ sent: 0, disabled: 0 });
    mocks.sendTeamFcmPushNotifications.mockResolvedValue({ sent: 0, disabled: 0 });
  });

  it("returns early when a teammate has no registered mobile devices", async () => {
    mocks.listActiveTeamMobilePushRegistrations.mockResolvedValueOnce([]);

    await expect(
      sendTeamMobilePushNotifications({
        body: "Need help",
        userId: "user_1",
        conversationId: "conv_1",
        notificationType: "new_conversation",
        senderName: null,
        title: "New conversation"
      })
    ).resolves.toEqual({ sent: 0, disabled: 0 });
  });

  it("fans out to expo, apns, and fcm senders", async () => {
    mocks.listActiveTeamMobilePushRegistrations.mockResolvedValueOnce([
      { provider: "expo", pushToken: "ExponentPushToken[first]", bundleId: null, environment: null },
      { provider: "apns", pushToken: "ios-token", bundleId: "com.usechatting.app", environment: "production" },
      { provider: "fcm", pushToken: "android-token", bundleId: null, environment: null }
    ]);
    mocks.sendTeamExpoPushNotifications.mockResolvedValueOnce({ sent: 1, disabled: 0 });
    mocks.sendTeamApnsPushNotifications.mockResolvedValueOnce({ sent: 1, disabled: 0 });
    mocks.sendTeamFcmPushNotifications.mockResolvedValueOnce({ sent: 1, disabled: 0 });

    await expect(
      sendTeamMobilePushNotifications({
        body: "Need help",
        userId: "user_1",
        conversationId: "conv_1",
        notificationType: "new_message",
        senderName: "Alex",
        title: "New message from Alex"
      })
    ).resolves.toEqual({ sent: 3, disabled: 0 });

    expect(mocks.sendTeamExpoPushNotifications).toHaveBeenCalledWith({
      notificationType: "new_message",
      pushTokens: ["ExponentPushToken[first]"],
      conversationId: "conv_1",
      senderName: "Alex",
      soundName: "default",
      title: "New message from Alex",
      body: "Need help"
    });
    expect(mocks.sendTeamApnsPushNotifications).toHaveBeenCalledWith({
      notificationType: "new_message",
      registrations: [
        {
          pushToken: "ios-token",
          bundleId: "com.usechatting.app",
          environment: "production"
        }
      ],
      conversationId: "conv_1",
      senderName: "Alex",
      soundName: "default",
      title: "New message from Alex",
      body: "Need help"
    });
    expect(mocks.sendTeamFcmPushNotifications).toHaveBeenCalledWith({
      notificationType: "new_message",
      pushTokens: ["android-token"],
      conversationId: "conv_1",
      senderName: "Alex",
      soundName: "default",
      title: "New message from Alex",
      body: "Need help"
    });
  });
});
