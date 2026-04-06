import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks } from "./test-react-hooks";

function createInitialData() {
  return {
    profile: { firstName: "Tina", lastName: "Bauer", email: "tina@usechatting.com", jobTitle: "Founder", avatarDataUrl: null },
    notifications: { browserNotifications: true, soundAlerts: true, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: true },
    aiAssist: { replySuggestionsEnabled: true, conversationSummariesEnabled: true, rewriteAssistanceEnabled: true, suggestedTagsEnabled: true },
    email: { notificationEmail: "team@usechatting.com", replyToEmail: "reply@usechatting.com", templates: [], emailSignature: "Best,\nChatting" },
    reports: { weeklyReportEnabled: true, weeklyReportSendTime: "09:00", weeklyReportIncludePersonalStats: true, workspaceWeeklyReportsEnabled: true, workspaceIncludeTeamLeaderboard: true, workspaceAiInsightsEnabled: true, canManageWorkspaceReports: true, recipientTimeZone: "Europe/London", teamTimeZone: "Europe/London" },
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

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

async function loadSettingsPage() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const captures: Record<string, unknown> = {};
  const showToast = vi.fn();

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams("") }));
  vi.doMock("@/lib/billing-plans", () => ({ shouldShowTranscriptBranding: (planKey: string) => planKey === "starter" }));
  vi.doMock("../ui/toast-provider", () => ({ useToast: () => ({ showToast }) }));
  vi.doMock("./dashboard-settings-scaffold", () => ({ DashboardSettingsScaffold: ({ children, ...props }: { children: unknown }) => ((captures.scaffold = props), <div>{children}</div>) }));
  vi.doMock("./dashboard-settings-profile-section", () => ({ SettingsProfileSection: (props: unknown) => ((captures.profile = props), <div>profile</div>) }));
  vi.doMock("./dashboard-settings-notifications-section", () => ({ SettingsNotificationsSection: (props: unknown) => ((captures.notifications = props), <div>notifications</div>) }));
  vi.doMock("./dashboard-settings-reports-section", () => ({ SettingsReportsSection: (props: unknown) => ((captures.reports = props), <div>reports</div>) }));
  vi.doMock("./dashboard-settings-email-billing-sections", () => ({
    SettingsEmailSection: (props: unknown) => ((captures.email = props), <div>email</div>),
    SettingsBillingSection: (props: unknown) => ((captures.billing = props), <div>billing</div>)
  }));
  vi.doMock("./dashboard-settings-referrals-section", () => ({ SettingsReferralsSection: (props: unknown) => ((captures.referrals = props), <div>referrals</div>) }));

  const module = await import("./dashboard-settings-page");
  return { DashboardSettingsPage: module.DashboardSettingsPage, captures, reactMocks, showToast };
}

describe("dashboard settings optimistic save", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("clears dirty state optimistically while a save request is pending", async () => {
    const updated = createInitialData();
    updated.profile.firstName = "Avery";
    const request = deferred<{ ok: true; json: () => Promise<{ ok: true; settings: typeof updated }> }>();
    vi.stubGlobal("fetch", vi.fn().mockReturnValueOnce(request.promise));
    vi.stubGlobal("CustomEvent", class { constructor(public type: string, public init: unknown) {} });
    vi.stubGlobal("window", { setTimeout: vi.fn().mockReturnValue(1), clearTimeout: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(), location: { assign: vi.fn() } });

    const { DashboardSettingsPage, captures, reactMocks, showToast } = await loadSettingsPage();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);

    (captures.profile as { onUpdateProfile: (key: "firstName", value: string) => void }).onUpdateProfile("firstName", "Avery");
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);
    expect((captures.scaffold as { isDirty: boolean }).isDirty).toBe(true);

    const savePromise = (captures.scaffold as { onSave: () => Promise<void> }).onSave();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);

    expect((captures.scaffold as { isDirty: boolean }).isDirty).toBe(false);
    expect((captures.scaffold as { isSaving: boolean }).isSaving).toBe(true);
    expect(showToast).not.toHaveBeenCalled();

    request.resolve({ ok: true, json: async () => ({ ok: true, settings: updated }) });
    await savePromise;
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);

    expect((captures.scaffold as { isDirty: boolean }).isDirty).toBe(false);
    expect((captures.scaffold as { isSaving: boolean }).isSaving).toBe(false);
    expect(showToast).toHaveBeenCalledWith("success", "Settings saved");
  });

  it("restores dirty state if an optimistic settings save fails", async () => {
    const request = deferred<{ ok: false; json: () => Promise<{ ok: false; error: string }> }>();
    vi.stubGlobal("fetch", vi.fn().mockReturnValueOnce(request.promise));
    vi.stubGlobal("window", { setTimeout: vi.fn().mockReturnValue(1), clearTimeout: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(), location: { assign: vi.fn() } });

    const { DashboardSettingsPage, captures, reactMocks, showToast } = await loadSettingsPage();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);

    (captures.profile as { onUpdateProfile: (key: "jobTitle", value: string) => void }).onUpdateProfile("jobTitle", "CEO");
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);

    const savePromise = (captures.scaffold as { onSave: () => Promise<void> }).onSave();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);

    expect((captures.scaffold as { isDirty: boolean }).isDirty).toBe(false);
    expect((captures.scaffold as { isSaving: boolean }).isSaving).toBe(true);

    request.resolve({ ok: false, json: async () => ({ ok: false, error: "settings-save-failed" }) });
    await savePromise;
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);

    expect((captures.scaffold as { isDirty: boolean }).isDirty).toBe(true);
    expect((captures.scaffold as { isSaving: boolean }).isSaving).toBe(false);
    expect(showToast).toHaveBeenCalledWith("error", "We couldn't save your changes just now.");
  });
});
