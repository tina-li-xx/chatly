import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

function createInitialData() {
  return {
    profile: {
      firstName: "Tina",
      lastName: "Bauer",
      email: "tina@usechatting.com",
      jobTitle: "Founder",
      avatarDataUrl: null
    },
    teamName: "Chatting",
    notifications: {
      browserNotifications: true,
      soundAlerts: true,
      emailNotifications: true,
      newVisitorAlerts: false,
      highIntentAlerts: true
    },
    aiAssist: {
      replySuggestionsEnabled: true,
      conversationSummariesEnabled: true,
      rewriteAssistanceEnabled: true,
      suggestedTagsEnabled: true
    },
    email: {
      notificationEmail: "team@usechatting.com",
      replyToEmail: "reply@usechatting.com",
      templates: [],
      emailSignature: "Best,\nChatting"
    },
    contacts: {
      statuses: [],
      customFields: [],
      dataRetention: "forever"
    },
    reports: {
      weeklyReportEnabled: true,
      weeklyReportSendTime: "09:00",
      weeklyReportIncludePersonalStats: true,
      workspaceWeeklyReportsEnabled: true,
      workspaceIncludeTeamLeaderboard: true,
      workspaceAiInsightsEnabled: true,
      canManageWorkspaceReports: true,
      recipientTimeZone: "Europe/London",
      teamTimeZone: "Europe/London"
    },
    automation: { inbox: {}, offline: { autoReplyEnabled: false, autoReplyMessage: "", expectedReplyTimeOnline: "minutes", leadCapture: { requireEmailWhenOffline: true, formMessage: "" } } },
    automationContext: undefined,
    teamMembers: [],
    teamInvites: [],
    billing: {
      planKey: "starter",
      planName: "Starter Plan",
      priceLabel: "$0/month",
      billingInterval: null,
      usedSeats: 1,
      billedSeats: null,
      seatLimit: 5,
      siteCount: 1,
      conversationCount: 12,
      messageCount: 34,
      avgResponseSeconds: 72,
      conversationLimit: 50,
      conversationUsagePercent: 24,
      upgradePromptThreshold: 30,
      remainingConversations: 38,
      showUpgradePrompt: false,
      limitReached: false,
      nextBillingDate: null,
      trialEndsAt: null,
      subscriptionStatus: null,
      customerId: null,
      portalAvailable: true,
      checkoutAvailable: true,
      features: { billedPerSeat: false, proactiveChat: false, removeBranding: false },
      paymentMethod: null,
      invoices: [],
      referrals: { programs: [], attributedSignups: [], rewards: [], pendingRewardCount: 0, earnedRewardCount: 0, earnedFreeMonths: 0, earnedDiscountCents: 0, earnedCommissionCents: 0 }
    }
  };
}

async function loadHook() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  vi.doMock("react", () => reactMocks.moduleFactory());
  const module = await import("./use-dashboard-settings-form");
  return { reactMocks, useDashboardSettingsForm: module.useDashboardSettingsForm };
}

describe("useDashboardSettingsForm", () => {
  it("strips the legacy seeded status set from incoming settings", async () => {
    const seeded = createInitialData();
    seeded.contacts.statuses = [
      { key: "lead", label: "Lead", color: "blue" },
      { key: "trial", label: "Trial", color: "purple" }
    ];
    seeded.contacts.statuses.push(
      { key: "customer", label: "Customer", color: "green" },
      { key: "vip", label: "VIP", color: "amber" },
      { key: "churned", label: "Churned", color: "gray" }
    );
    const onNotice = vi.fn();
    const { reactMocks, useDashboardSettingsForm } = await loadHook();

    reactMocks.beginRender();
    const result = useDashboardSettingsForm(seeded as never, onNotice);
    await runMockEffects(reactMocks.effects);

    expect(result.draftSettings.contacts.statuses).toEqual([]);
  });

  it("refreshes contact settings from updated server data", async () => {
    const seeded = createInitialData();
    seeded.contacts.statuses = [
      { key: "prospect", label: "Prospect", color: "blue" },
      { key: "renewal", label: "Renewal", color: "amber" }
    ];
    const cleared = createInitialData();
    const onNotice = vi.fn();
    const { reactMocks, useDashboardSettingsForm } = await loadHook();

    reactMocks.beginRender();
    let result = useDashboardSettingsForm(seeded as never, onNotice);
    await runMockEffects(reactMocks.effects);
    expect(result.draftSettings.contacts.statuses).toHaveLength(2);

    reactMocks.beginRender();
    result = useDashboardSettingsForm(cleared as never, onNotice);
    await runMockEffects(reactMocks.effects);
    reactMocks.beginRender();
    result = useDashboardSettingsForm(cleared as never, onNotice);

    expect(result.draftSettings.contacts.statuses).toEqual([]);
  });
});
