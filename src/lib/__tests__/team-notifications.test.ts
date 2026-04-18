const mocks = vi.hoisted(() => ({
  getDashboardNotificationDeliverySettings: vi.fn(),
  sendStarterUpgradePromptEmail: vi.fn(),
  normalizeBillingPlanKey: vi.fn((planKey: string | null | undefined) =>
    planKey === "growth" ? "growth" : "starter"
  ),
  sendTeamNewMessageEmail: vi.fn(),
  getPublicAppUrl: vi.fn(() => "https://usechatting.com"),
  maybeSendAnalyticsExpansionEmail: vi.fn(),
  maybeSendSlackConversationNotification: vi.fn(),
  publishDashboardLive: vi.fn(),
  sendTeamMobilePushNotifications: vi.fn(),
  findBillingAccountRow: vi.fn(),
  findBillingUsageRow: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getDashboardNotificationDeliverySettings: mocks.getDashboardNotificationDeliverySettings
}));

vi.mock("@/lib/billing-upgrade-email", () => ({
  sendStarterUpgradePromptEmail: mocks.sendStarterUpgradePromptEmail
}));

vi.mock("@/lib/billing-plans", () => ({
  normalizeBillingPlanKey: mocks.normalizeBillingPlanKey
}));

vi.mock("@/lib/email", () => ({
  sendTeamNewMessageEmail: mocks.sendTeamNewMessageEmail
}));

vi.mock("@/lib/env", () => ({
  getPublicAppUrl: mocks.getPublicAppUrl
}));

vi.mock("@/lib/growth-outreach", () => ({
  maybeSendAnalyticsExpansionEmail: mocks.maybeSendAnalyticsExpansionEmail
}));

vi.mock("@/lib/slack-conversation-notifications", () => ({
  maybeSendSlackConversationNotification: mocks.maybeSendSlackConversationNotification
}));

vi.mock("@/lib/live-events", () => ({
  publishDashboardLive: mocks.publishDashboardLive
}));

vi.mock("@/lib/team-mobile-push", () => ({
  sendTeamMobilePushNotifications: mocks.sendTeamMobilePushNotifications
}));

vi.mock("@/lib/repositories/billing-repository", () => ({
  findBillingAccountRow: mocks.findBillingAccountRow,
  findBillingUsageRow: mocks.findBillingUsageRow
}));

import { notifyIncomingVisitorMessage } from "@/lib/team-notifications";

const baseInput = {
  userId: "user_123",
  conversationId: "conv_123",
  createdAt: "2026-03-29T08:30:00.000Z",
  preview: "Need help with pricing", siteName: "Acme", visitorLabel: "alex@example.com",
  pageUrl: "https://acme.example/pricing", location: "London",
  attachmentsCount: 0,
  isNewConversation: true, isNewVisitor: true, highIntent: true
};

const liveSummary = {
  id: "conv_123", siteId: "site_1", siteName: "Acme", email: "alex@example.com", assignedUserId: null,
  sessionId: "session_1", status: "open" as const, createdAt: "2026-03-29T08:20:00.000Z",
  updatedAt: "2026-03-29T08:30:00.000Z", pageUrl: "https://acme.example/pricing",
  recordedPageUrl: "https://acme.example/pricing", referrer: "https://google.com", userAgent: "Chrome",
  country: "UK", region: "England", city: "London", timezone: "Europe/London", locale: "en-GB",
  lastMessageAt: "2026-03-29T08:30:00.000Z", lastMessagePreview: "Need help with pricing", unreadCount: 1,
  rating: null, tags: ["pricing"]
};

describe("team notifications", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getPublicAppUrl.mockReturnValue("https://usechatting.com");
    mocks.normalizeBillingPlanKey.mockImplementation((planKey: string | null | undefined) =>
      planKey === "growth" ? "growth" : "starter"
    );
    mocks.getDashboardNotificationDeliverySettings.mockResolvedValue({
      emailNotifications: true,
      notificationEmail: "team@usechatting.com"
    });
    mocks.findBillingAccountRow.mockResolvedValue({ plan_key: "starter" });
    mocks.findBillingUsageRow.mockResolvedValue({
      conversation_count: "30",
      site_count: "1"
    });
    mocks.sendTeamNewMessageEmail.mockResolvedValue(undefined);
    mocks.sendStarterUpgradePromptEmail.mockResolvedValue(undefined);
    mocks.maybeSendAnalyticsExpansionEmail.mockResolvedValue(undefined);
    mocks.maybeSendSlackConversationNotification.mockResolvedValue(undefined);
    mocks.sendTeamMobilePushNotifications.mockResolvedValue({ sent: 1, disabled: 0 });
  });

  it("sends the dedicated starter upgrade email at the 30-conversation trigger even if message emails are off", async () => {
    mocks.getDashboardNotificationDeliverySettings.mockResolvedValue({
      emailNotifications: false,
      notificationEmail: "team@usechatting.com"
    });
    const input = { ...baseInput, summary: liveSummary };

    await notifyIncomingVisitorMessage(input);

    expect(mocks.sendTeamNewMessageEmail).not.toHaveBeenCalled();
    expect(mocks.publishDashboardLive).toHaveBeenCalledWith(
      "user_123",
      expect.objectContaining({
        type: "message.created",
        summary: expect.objectContaining({ id: "conv_123", unreadCount: 1 })
      })
    );
    expect(mocks.maybeSendSlackConversationNotification).toHaveBeenCalledWith(input);
    expect(mocks.sendTeamMobilePushNotifications).toHaveBeenCalledWith({
      body: "Need help with pricing",
      userId: "user_123",
      conversationId: "conv_123",
      notificationType: "new_conversation",
      senderName: "alex@example.com",
      title: "New conversation"
    });
    expect(mocks.sendStarterUpgradePromptEmail).toHaveBeenCalledWith({
      to: "team@usechatting.com",
      prompt: {
        conversationCount: 30,
        conversationLimit: 50,
        remainingConversations: 20,
        billingUrl: "https://usechatting.com/dashboard/settings?section=billing",
        limitReached: false
      }
    });
    expect(mocks.maybeSendAnalyticsExpansionEmail).toHaveBeenCalledWith("user_123");
  });

  it("does not send the dedicated starter upgrade email between the 30 and 50 milestones", async () => {
    mocks.findBillingUsageRow.mockResolvedValue({
      conversation_count: "31",
      site_count: "1"
    });

    await notifyIncomingVisitorMessage(baseInput);

    expect(mocks.sendTeamNewMessageEmail).toHaveBeenCalledTimes(1);
    expect(mocks.maybeSendSlackConversationNotification).toHaveBeenCalledTimes(1);
    expect(mocks.sendStarterUpgradePromptEmail).not.toHaveBeenCalled();
  });

  it("sends both the team email and cap-reached upgrade email at 50 conversations", async () => {
    mocks.findBillingUsageRow.mockResolvedValue({
      conversation_count: "50",
      site_count: "1"
    });

    await notifyIncomingVisitorMessage(baseInput);

    expect(mocks.sendTeamNewMessageEmail).toHaveBeenCalledWith({
      to: "team@usechatting.com",
      siteName: "Acme",
      conversationId: "conv_123",
      content: "Need help with pricing",
      visitorEmail: "alex@example.com",
      pageUrl: "https://acme.example/pricing",
      attachmentsCount: 0
    });
    expect(mocks.sendStarterUpgradePromptEmail).toHaveBeenCalledWith({
      to: "team@usechatting.com",
      prompt: {
        conversationCount: 50,
        conversationLimit: 50,
        remainingConversations: 0,
        billingUrl: "https://usechatting.com/dashboard/settings?section=billing",
        limitReached: true
      }
    });
    expect(mocks.sendTeamMobilePushNotifications).toHaveBeenCalledTimes(1);
    expect(mocks.sendTeamMobilePushNotifications).toHaveBeenCalledWith({
      body: "Need help with pricing",
      userId: "user_123",
      conversationId: "conv_123",
      notificationType: "new_conversation",
      senderName: "alex@example.com",
      title: "New conversation"
    });
  });
});
