import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

function createInitialData(planKey: "starter" | "growth" = "starter", billingInterval: "monthly" | "annual" | null = null) {
  return {
    profile: { firstName: "Tina", lastName: "Bauer", email: "tina@usechatting.com", jobTitle: "Founder", avatarDataUrl: null },
    notifications: { browserNotifications: true, soundAlerts: true, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: true },
    aiAssist: { replySuggestionsEnabled: true, conversationSummariesEnabled: true, rewriteAssistanceEnabled: true, suggestedTagsEnabled: true },
    email: { notificationEmail: "team@usechatting.com", replyToEmail: "reply@usechatting.com", templates: [], emailSignature: "Best,\nChatting" },
    reports: { weeklyReportEnabled: true, weeklyReportSendTime: "09:00", weeklyReportIncludePersonalStats: true, workspaceWeeklyReportsEnabled: true, workspaceIncludeTeamLeaderboard: true, workspaceAiInsightsEnabled: true, canManageWorkspaceReports: true, recipientTimeZone: "Europe/London", teamTimeZone: "Europe/London" },
    teamMembers: [],
    teamInvites: [],
    billing: { planKey, planName: "Plan", priceLabel: "$0/month", billingInterval, usedSeats: 1, billedSeats: null, seatLimit: 5, siteCount: 1, conversationCount: 12, messageCount: 34, avgResponseSeconds: 72, conversationLimit: 50, conversationUsagePercent: 24, upgradePromptThreshold: 30, remainingConversations: 38, showUpgradePrompt: false, limitReached: false, nextBillingDate: null, trialEndsAt: null, subscriptionStatus: null, customerId: null, portalAvailable: true, checkoutAvailable: true, features: { billedPerSeat: false, proactiveChat: false, removeBranding: false }, paymentMethod: null, invoices: [], referrals: { programs: [], attributedSignups: [], rewards: [], pendingRewardCount: 0, earnedRewardCount: 0, earnedFreeMonths: 0, earnedDiscountCents: 0, earnedCommissionCents: 0 } }
  };
}

async function loadSettingsPage(search = "") {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const captures: Record<string, unknown> = {};
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(search) }));
  vi.doMock("@/lib/billing-plans", () => ({ shouldShowTranscriptBranding: (planKey: string) => planKey === "starter" }));
  vi.doMock("./dashboard-settings-scaffold", () => ({ DashboardSettingsScaffold: ({ children, ...props }: { children: unknown }) => ((captures.scaffold = props), <div>{children}</div>) }));
  vi.doMock("./dashboard-settings-automation-section", () => ({ SettingsAutomationSection: (props: unknown) => ((captures.automation = props), <div>automation</div>) }));
  vi.doMock("./dashboard-settings-profile-section", () => ({ SettingsProfileSection: (props: unknown) => ((captures.profile = props), <div>profile</div>) }));
  vi.doMock("./dashboard-settings-notifications-section", () => ({ SettingsNotificationsSection: (props: unknown) => ((captures.notifications = props), <div>notifications</div>) }));
  vi.doMock("./dashboard-settings-ai-assist-section", () => ({ SettingsAiAssistSection: (props: unknown) => ((captures.aiAssist = props), <div>ai assist</div>) }));
  vi.doMock("./dashboard-settings-reports-section", () => ({ SettingsReportsSection: (props: unknown) => ((captures.reports = props), <div>reports</div>) }));
  vi.doMock("./dashboard-settings-email-billing-sections", () => ({ SettingsEmailSection: (props: unknown) => ((captures.email = props), <div>email</div>), SettingsBillingSection: (props: unknown) => ((captures.billing = props), <div>billing</div>) }));
  vi.doMock("./dashboard-settings-saved-replies-section", () => ({ SettingsSavedRepliesSection: (props: unknown) => ((captures.savedReplies = props), <div>saved replies</div>) }));
  vi.doMock("./dashboard-settings-referrals-section", () => ({ SettingsReferralsSection: (props: unknown) => ((captures.referrals = props), <div>referrals</div>) }));
  const module = await import("./dashboard-settings-page");
  return { DashboardSettingsPage: module.DashboardSettingsPage, captures, reactMocks };
}

describe("dashboard settings page sections", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("maps automation, notifications, ai assist, saved replies, integrations, reports, email, referrals, and invalid sections into the expected page props", async () => {
    const automation = await loadSettingsPage("section=automation");
    automation.reactMocks.beginRender();
    renderToStaticMarkup(<automation.DashboardSettingsPage initialData={createInitialData()} />);
    expect((automation.captures.scaffold as { activeSection: string }).activeSection).toBe("automation");
    await runMockEffects(automation.reactMocks.effects);
    automation.reactMocks.beginRender();
    const automationHtml = renderToStaticMarkup(<automation.DashboardSettingsPage initialData={createInitialData()} />);
    expect(automationHtml).toContain("automation");
    expect((automation.captures.automation as { billing: { planKey: string } }).billing.planKey).toBe("starter");

    const notifications = await loadSettingsPage("section=notifications");
    notifications.reactMocks.beginRender();
    renderToStaticMarkup(<notifications.DashboardSettingsPage initialData={createInitialData()} />);
    expect((notifications.captures.scaffold as { activeSection: string }).activeSection).toBe("notifications");
    await runMockEffects(notifications.reactMocks.effects);
    notifications.reactMocks.beginRender();
    renderToStaticMarkup(<notifications.DashboardSettingsPage initialData={createInitialData()} />);
    expect((notifications.captures.scaffold as { activeSection: string }).activeSection).toBe("notifications");
    expect((notifications.captures.notifications as { title: string }).title).toBe("Notifications");

    const aiAssist = await loadSettingsPage("section=aiAssist");
    aiAssist.reactMocks.beginRender();
    renderToStaticMarkup(<aiAssist.DashboardSettingsPage initialData={createInitialData("growth")} />);
    await runMockEffects(aiAssist.reactMocks.effects);
    aiAssist.reactMocks.beginRender();
    renderToStaticMarkup(<aiAssist.DashboardSettingsPage initialData={createInitialData("growth")} />);
    expect((aiAssist.captures.aiAssist as { title: string }).title).toBe("AI Assist");
    expect((aiAssist.captures.aiAssist as { planKey: string }).planKey).toBe("growth");

    const reports = await loadSettingsPage("section=reports");
    reports.reactMocks.beginRender();
    renderToStaticMarkup(<reports.DashboardSettingsPage initialData={createInitialData()} />);
    await runMockEffects(reports.reactMocks.effects);
    reports.reactMocks.beginRender();
    renderToStaticMarkup(<reports.DashboardSettingsPage initialData={createInitialData()} />);
    expect((reports.captures.reports as { title: string }).title).toBe("Reports");

    const email = await loadSettingsPage("section=email");
    email.reactMocks.beginRender();
    renderToStaticMarkup(<email.DashboardSettingsPage initialData={createInitialData("growth")} />);
    await runMockEffects(email.reactMocks.effects);
    email.reactMocks.beginRender();
    renderToStaticMarkup(<email.DashboardSettingsPage initialData={createInitialData("growth")} />);
    expect((email.captures.email as { title: string; showTranscriptBrandingPreview: boolean }).title).toBe("Email");
    expect((email.captures.email as { showTranscriptBrandingPreview: boolean }).showTranscriptBrandingPreview).toBe(false);

    const savedReplies = await loadSettingsPage("section=savedReplies");
    savedReplies.reactMocks.beginRender();
    renderToStaticMarkup(<savedReplies.DashboardSettingsPage initialData={createInitialData()} canManageSavedReplies />);
    await runMockEffects(savedReplies.reactMocks.effects);
    savedReplies.reactMocks.beginRender();
    renderToStaticMarkup(<savedReplies.DashboardSettingsPage initialData={createInitialData()} canManageSavedReplies />);
    expect((savedReplies.captures.savedReplies as { title: string; canManageSavedReplies: boolean }).title).toBe("Saved replies");
    expect((savedReplies.captures.savedReplies as { canManageSavedReplies: boolean }).canManageSavedReplies).toBe(true);
    expect((savedReplies.captures.savedReplies as { headerActions?: unknown }).headerActions).toBeUndefined();

    const integrations = await loadSettingsPage("section=integrations");
    integrations.reactMocks.beginRender();
    renderToStaticMarkup(<integrations.DashboardSettingsPage initialData={createInitialData()} />);
    expect((integrations.captures.scaffold as { activeSection: string }).activeSection).toBe("integrations");
    await runMockEffects(integrations.reactMocks.effects);
    integrations.reactMocks.beginRender();
    const integrationsHtml = renderToStaticMarkup(<integrations.DashboardSettingsPage initialData={createInitialData()} />);
    expect(integrationsHtml).toContain("Integrations");
    expect(integrationsHtml).toContain("Coming soon");

    const referrals = await loadSettingsPage("section=referrals");
    referrals.reactMocks.beginRender();
    renderToStaticMarkup(<referrals.DashboardSettingsPage initialData={createInitialData()} />);
    await runMockEffects(referrals.reactMocks.effects);
    referrals.reactMocks.beginRender();
    renderToStaticMarkup(<referrals.DashboardSettingsPage initialData={createInitialData()} />);
    expect((referrals.captures.referrals as { title: string }).title).toBe("Referrals");

    const invalid = await loadSettingsPage("section=unknown");
    invalid.reactMocks.beginRender();
    renderToStaticMarkup(<invalid.DashboardSettingsPage initialData={createInitialData()} />);
    expect((invalid.captures.scaffold as { activeSection: string }).activeSection).toBe("profile");
    await runMockEffects(invalid.reactMocks.effects);
    invalid.reactMocks.beginRender();
    renderToStaticMarkup(<invalid.DashboardSettingsPage initialData={createInitialData()} />);
    expect((invalid.captures.scaffold as { activeSection: string }).activeSection).toBe("profile");
  });

  it("skips redundant billing plan changes when the current growth interval is already selected", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, billing: createInitialData("growth", "annual").billing }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { setTimeout: vi.fn().mockReturnValue(1), clearTimeout: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(), location: { assign: vi.fn() } });

    const { DashboardSettingsPage, captures, reactMocks } = await loadSettingsPage("section=billing");
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData("growth", "annual")} />);
    await runMockEffects(reactMocks.effects);
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData("growth", "annual")} />);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await (captures.billing as { onChangePlan: (plan: "growth", interval: "annual") => Promise<void> }).onChangePlan("growth", "annual");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
