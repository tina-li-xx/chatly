import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  getAnalyticsDataset: vi.fn(),
  getDashboardBillingSummary: vi.fn(),
  getDashboardNotificationSettings: vi.fn(),
  getDashboardSettingsData: vi.fn(),
  getDashboardTeamPageData: vi.fn(),
  getDashboardWidgetPageData: vi.fn(),
  getDashboardStats: vi.fn(),
  getConversationById: vi.fn(),
  getUserOnboardingStep: vi.fn(),
  listDashboardTeamMembers: vi.fn(),
  listConversationSummaries: vi.fn(),
  listSitesForUser: vi.fn(),
  listVisitorPresenceSessions: vi.fn(),
  redirect: vi.fn(),
  requireUser: vi.fn(),
  usePathname: vi.fn()
}));

vi.mock("@/lib/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/data/analytics", () => ({
  getAnalyticsDataset: mocks.getAnalyticsDataset
}));
vi.mock("@/lib/data/widget-page", () => ({
  getDashboardWidgetPageData: mocks.getDashboardWidgetPageData
}));
vi.mock("@/lib/data", () => ({
  getConversationById: mocks.getConversationById,
  getDashboardBillingSummary: mocks.getDashboardBillingSummary,
  getDashboardNotificationSettings: mocks.getDashboardNotificationSettings,
  getDashboardSettingsData: mocks.getDashboardSettingsData,
  getDashboardTeamPageData: mocks.getDashboardTeamPageData,
  getDashboardStats: mocks.getDashboardStats,
  getUserOnboardingStep: mocks.getUserOnboardingStep,
  listDashboardTeamMembers: mocks.listDashboardTeamMembers,
  listConversationSummaries: mocks.listConversationSummaries,
  listSitesForUser: mocks.listSitesForUser,
  listVisitorPresenceSessions: mocks.listVisitorPresenceSessions
}));
vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  usePathname: mocks.usePathname
}));

describe("dashboard page wrappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.requireUser.mockResolvedValue({
      id: "user_1",
      email: "owner@example.com",
      workspaceRole: "admin",
      workspaceOwnerId: "owner_1"
    });
    mocks.getUserOnboardingStep.mockResolvedValue("done");
    mocks.usePathname.mockReturnValue("/dashboard");
  });

  it("loads widget, visitors, and team pages with the expected child props", async () => {
    const captures: Record<string, unknown> = {};
    mocks.getDashboardWidgetPageData.mockResolvedValue({
      sites: [{ id: "site_1" }],
      proactiveChatUnlocked: true
    });
    mocks.listConversationSummaries.mockResolvedValue([{ id: "conv_1" }]);
    mocks.listVisitorPresenceSessions.mockResolvedValue([{ sessionId: "session_1" }]);
    mocks.getDashboardTeamPageData.mockResolvedValue({ teamMembers: [{ id: "member_1" }], teamInvites: [{ id: "invite_1" }] });

    vi.doMock("./widget/widget-page-client", () => ({ DashboardWidgetPageClient: (props: unknown) => ((captures.widget = props), <div>widget</div>) }));
    vi.doMock("./dashboard-visitors-page", () => ({ DashboardVisitorsPage: (props: unknown) => ((captures.visitors = props), <div>visitors</div>) }));
    vi.doMock("./dashboard-team-page", () => ({ DashboardTeamPage: (props: unknown) => ((captures.team = props), <div>team</div>) }));

    const widgetPage = (await import("./widget/page")).default;
    const visitorsPage = (await import("./visitors/page")).default;
    const teamPage = (await import("./team/page")).default;

    expect(renderToStaticMarkup(await widgetPage())).toContain("widget");
    expect(renderToStaticMarkup(await visitorsPage())).toContain("visitors");
    expect(renderToStaticMarkup(await teamPage())).toContain("team");

    expect(captures.widget).toEqual({
      initialSites: [{ id: "site_1" }],
      proactiveChatUnlocked: true
    });
    expect(captures.visitors).toEqual({ initialConversations: [{ id: "conv_1" }], initialLiveSessions: [{ sessionId: "session_1" }] });
    expect(captures.team).toEqual({ canManageTeam: true, initialMembers: [{ id: "member_1" }], initialInvites: [{ id: "invite_1" }] });
  });

  it("passes member permissions through the team wrapper", async () => {
    const captures: Record<string, unknown> = {};
    mocks.requireUser.mockResolvedValueOnce({ id: "user_2", email: "member@example.com", workspaceRole: "member" });
    mocks.getDashboardTeamPageData.mockResolvedValueOnce({ teamMembers: [], teamInvites: [] });
    vi.doMock("./dashboard-team-page", () => ({ DashboardTeamPage: (props: unknown) => ((captures.team = props), <div>team</div>) }));

    const teamPage = (await import("./team/page")).default;
    renderToStaticMarkup(await teamPage());

    expect(captures.team).toEqual({ canManageTeam: false, initialMembers: [], initialInvites: [] });
  });

  it("loads dashboard layout, home, settings, and both loading variants", async () => {
    const captures: Record<string, unknown> = {};
    mocks.listConversationSummaries.mockResolvedValueOnce([
      { id: "conv_1", unreadCount: 2 },
      { id: "conv_2", unreadCount: 1 }
    ]);
    mocks.getDashboardNotificationSettings.mockResolvedValueOnce({ email: true });
    mocks.getDashboardSettingsData.mockResolvedValueOnce({ profile: { email: "owner@example.com" } });
    vi.doMock("./dashboard-shell", () => ({ DashboardShell: (props: unknown) => ((captures.shell = props), <div>shell</div>) }));
    vi.doMock("./dashboard-home", () => ({ DashboardHome: (props: unknown) => ((captures.home = props), <div>home</div>) }));
    vi.doMock("./dashboard-settings-page", () => ({
      DashboardSettingsPage: ({
        initialData,
        canManageSavedReplies,
        activeSection
      }: {
        initialData: unknown;
        canManageSavedReplies: boolean;
        activeSection: string;
      }) => ((captures.settings = { initialData, canManageSavedReplies, activeSection }), <div>settings</div>)
    }));

    const dashboardLayout = (await import("./layout")).default;
    const dashboardPage = (await import("./page")).default;
    const settingsPage = (await import("./settings/page")).default;
    const DashboardLoading = (await import("./loading")).default;

    expect(renderToStaticMarkup(await dashboardLayout({ children: <div>child</div> }))).toContain("shell");
    expect(renderToStaticMarkup(await dashboardPage())).toContain("home");
    expect(renderToStaticMarkup(await settingsPage())).toContain("settings");

    mocks.usePathname.mockReturnValue("/dashboard/inbox");
    const inboxLoading = renderToStaticMarkup(<DashboardLoading />);
    mocks.usePathname.mockReturnValue("/dashboard");
    const pageLoading = renderToStaticMarkup(<DashboardLoading />);

    expect(captures.shell).toMatchObject({
      userEmail: "owner@example.com",
      unreadCount: 3,
      notificationSettings: { email: true }
    });
    expect(captures.home).toEqual({ userEmail: "owner@example.com", userId: "user_1" });
    expect(captures.settings).toEqual({
      initialData: { profile: { email: "owner@example.com" } },
      canManageSavedReplies: true,
      activeSection: "profile"
    });
    expect(inboxLoading).toContain("h-24 rounded-xl bg-slate-50");
    expect(pageLoading).toContain("xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]");
  });

  it("redirects to onboarding before rendering the dashboard shell", async () => {
    mocks.getUserOnboardingStep.mockResolvedValueOnce("install");
    mocks.redirect.mockImplementation((url: string) => {
      throw new Error(url);
    });

    const dashboardLayout = (await import("./layout")).default;

    await expect(dashboardLayout({ children: <div>child</div> })).rejects.toThrow(
      "/onboarding?step=install"
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/onboarding?step=install");
  });

  it("loads analytics and inbox pages with the expected child props", async () => {
    const captures: Record<string, unknown> = {};
    mocks.getAnalyticsDataset.mockResolvedValueOnce({ period: "30d", totals: { conversations: 12 } });
    mocks.listConversationSummaries.mockResolvedValueOnce([{ id: "conv_1" }]);
    mocks.getDashboardStats.mockResolvedValueOnce({ conversationsCount: 12 });
    mocks.listSitesForUser.mockResolvedValueOnce([{ id: "site_1" }]);
    mocks.listDashboardTeamMembers.mockResolvedValueOnce([{ id: "member_1" }]);
    mocks.getConversationById.mockResolvedValueOnce({ id: "conv_1", subject: "Pricing" });
    vi.doMock("./dashboard-analytics-page", () => ({ DashboardAnalyticsPage: (props: unknown) => ((captures.analytics = props), <div>analytics</div>) }));
    vi.doMock("./dashboard-client", () => ({ DashboardClient: (props: unknown) => ((captures.inbox = props), <div>inbox</div>) }));

    const analyticsPage = (await import("./analytics/page")).default;
    const inboxPage = (await import("./inbox/page")).default;

    expect(renderToStaticMarkup(await analyticsPage())).toContain("analytics");
    expect(
      renderToStaticMarkup(await inboxPage({ searchParams: Promise.resolve({ id: "conv_1" }) }))
    ).toContain("inbox");

    expect(captures.analytics).toEqual({
      initialDataset: { period: "30d", totals: { conversations: 12 } },
      userEmail: "owner@example.com"
    });
    expect(captures.inbox).toEqual({
      userEmail: "owner@example.com",
      initialStats: { conversationsCount: 12 },
      initialSites: [{ id: "site_1" }],
      initialConversations: [{ id: "conv_1" }],
      initialActiveConversation: { id: "conv_1", subject: "Pricing" },
      initialTeamMembers: [{ id: "member_1" }]
    });
  });
});
