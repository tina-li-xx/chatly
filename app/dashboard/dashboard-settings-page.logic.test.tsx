import { renderToStaticMarkup } from "react-dom/server";
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
      portalAvailable: true,
      checkoutAvailable: true,
      features: { billedPerSeat: false, proactiveChat: false, removeBranding: false },
      paymentMethod: null,
      invoices: [],
      referrals: { programs: [], attributedSignups: [], rewards: [], pendingRewardCount: 0, earnedRewardCount: 0, earnedFreeMonths: 0, earnedDiscountCents: 0, earnedCommissionCents: 0 }
    }
  };
}

async function loadSettingsPage(search = "") {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const captures: Record<string, unknown> = {};
  const showToast = vi.fn();

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(search) }));
  vi.doMock("@/lib/billing-plans", () => ({ shouldShowTranscriptBranding: (planKey: string) => planKey === "starter" }));
  vi.doMock("../ui/toast-provider", () => ({ useToast: () => ({ showToast }) }));
  vi.doMock("./dashboard-settings-scaffold", () => ({
    DashboardSettingsScaffold: ({ children, ...props }: { children: unknown }) => ((captures.scaffold = props), <div>{children}</div>)
  }));
  vi.doMock("./dashboard-settings-automation-section", () => ({ SettingsAutomationSection: (props: unknown) => ((captures.automation = props), <div>automation</div>) }));
  vi.doMock("./dashboard-settings-profile-section", () => ({ SettingsProfileSection: (props: unknown) => ((captures.profile = props), <div>profile</div>) }));
  vi.doMock("./dashboard-settings-notifications-section", () => ({ SettingsNotificationsSection: (props: unknown) => ((captures.notifications = props), <div>notifications</div>) }));
  vi.doMock("./dashboard-settings-ai-assist-section", () => ({ SettingsAiAssistSection: (props: unknown) => ((captures.aiAssist = props), <div>ai assist</div>) }));
  vi.doMock("./dashboard-settings-reports-section", () => ({ SettingsReportsSection: (props: unknown) => ((captures.reports = props), <div>reports</div>) }));
  vi.doMock("./dashboard-settings-email-billing-sections", () => ({
    SettingsEmailSection: (props: unknown) => ((captures.email = props), <div>email</div>),
    SettingsBillingSection: (props: unknown) => ((captures.billing = props), <div>billing</div>)
  }));
  vi.doMock("./dashboard-settings-referrals-section", () => ({ SettingsReferralsSection: (props: unknown) => ((captures.referrals = props), <div>referrals</div>) }));

  const module = await import("./dashboard-settings-page");
  return { DashboardSettingsPage: module.DashboardSettingsPage, captures, reactMocks, showToast };
}

describe("dashboard settings page logic", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("syncs billing from search params and forwards billing actions", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, billing: { ...createInitialData().billing, planKey: "growth", billingInterval: "annual", priceLabel: "$200/year" } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, redirectUrl: "https://stripe.example/portal" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, redirectUrl: "https://stripe.example/checkout" }) })
      .mockResolvedValue({ ok: true, json: async () => ({ ok: true, billing: { ...createInitialData().billing, planKey: "starter", billingInterval: "monthly" } }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { setTimeout: vi.fn().mockReturnValue(1), clearTimeout: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(), location: { assign: vi.fn() } });

    const { DashboardSettingsPage, captures, reactMocks, showToast } = await loadSettingsPage("section=billing&billing=checkout-success");
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);
    await runMockEffects(reactMocks.effects);
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);

    expect(showToast).toHaveBeenCalledWith("success", "Stripe checkout completed");
    expect((captures.billing as { selectedInterval: string }).selectedInterval).toBe("annual");

    await (captures.billing as { onOpenBillingPortal: () => Promise<void> }).onOpenBillingPortal();
    await (captures.billing as { onChangePlan: (plan: "starter", interval: "monthly") => Promise<void> }).onChangePlan("starter", "monthly");
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);
    await runMockEffects(reactMocks.effects);
    await (captures.billing as { onSyncBilling: () => Promise<void> }).onSyncBilling();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);

    expect((globalThis.window as Window).location.assign).toHaveBeenCalledWith("https://stripe.example/portal");
    expect((globalThis.window as Window).location.assign).toHaveBeenCalledWith("https://stripe.example/checkout");
  });

  it("tracks dirty profile changes, handles avatar upload, saves settings, and discards drafts", async () => {
    const updated = createInitialData();
    updated.profile.firstName = "Avery";
    updated.profile.avatarDataUrl = "data:image/png;base64,avatar";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, settings: updated }) });
    const addEventListener = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("CustomEvent", class { constructor(public type: string, public init: unknown) {} });
    vi.stubGlobal("FileReader", class { result: string | null = "data:image/png;base64,avatar"; onload: null | (() => void) = null; readAsDataURL() { this.onload?.(); } });
    vi.stubGlobal("window", { setTimeout: vi.fn().mockReturnValue(1), clearTimeout: vi.fn(), addEventListener, removeEventListener: vi.fn(), dispatchEvent: vi.fn(), location: { assign: vi.fn() } });

    const { DashboardSettingsPage, captures, reactMocks, showToast } = await loadSettingsPage();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);

    (captures.profile as { onUpdateProfile: (key: "firstName", value: string) => void }).onUpdateProfile("firstName", "Avery");
    (captures.profile as { onAvatarPick: (event: { target: { files: [{}]; value: string } }) => void }).onAvatarPick({ target: { files: [{}], value: "picked" } });
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);
    await runMockEffects(reactMocks.effects);

    expect((captures.scaffold as { isDirty: boolean }).isDirty).toBe(true);
    expect((captures.profile as { profile: { avatarDataUrl: string | null } }).profile.avatarDataUrl).toBe("data:image/png;base64,avatar");
    expect(addEventListener).toHaveBeenCalledWith("beforeunload", expect.any(Function));

    await (captures.scaffold as { onSave: () => Promise<void> }).onSave();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);

    expect(fetchMock).toHaveBeenCalledWith(
      "/dashboard/settings/update",
      expect.objectContaining({ method: "POST", headers: { "content-type": "application/json" } })
    );
    expect(showToast).toHaveBeenCalledWith("success", "Settings saved");
    expect((globalThis.window as Window).dispatchEvent).toHaveBeenCalledTimes(1);

    (captures.profile as { onUpdateProfile: (key: "jobTitle", value: string) => void }).onUpdateProfile("jobTitle", "CEO");
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);
    (captures.scaffold as { onDiscard: () => void }).onDiscard();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);

    expect((captures.scaffold as { isDirty: boolean }).isDirty).toBe(false);
    expect((captures.profile as { profile: { jobTitle: string } }).profile.jobTitle).toBe(updated.profile.jobTitle);
  });
});
