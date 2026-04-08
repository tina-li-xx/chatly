export function createSettingsPageInitialData() {
  return {
    profile: {
      firstName: "Tina",
      lastName: "Bauer",
      email: "tina@chatting.example",
      jobTitle: "Founder",
      avatarDataUrl: null
    },
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
      notificationEmail: "team@chatting.example",
      replyToEmail: "reply@chatting.example",
      templates: [],
      emailSignature: "Best,\nChatting"
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
      portalAvailable: false,
      checkoutAvailable: true,
      features: {
        billedPerSeat: false,
        proactiveChat: false,
        removeBranding: false
      },
      paymentMethod: null,
      invoices: [],
      referrals: {
        programs: [],
        attributedSignups: [],
        rewards: [],
        pendingRewardCount: 0,
        earnedRewardCount: 0,
        earnedFreeMonths: 0,
        earnedDiscountCents: 0,
        earnedCommissionCents: 0
      }
    }
  };
}
