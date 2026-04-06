import { renderToStaticMarkup } from "react-dom/server";
import {
  EMPTY_INBOX_STATS,
  GROWTH_AI_ASSIST_ACCESS,
  OWNER_USER,
  primeWrapperDefaults
} from "./dashboard-page-wrappers.test-helpers";

const mocks = {
  getAnalyticsDataset: vi.fn(),
  getDashboardAiAssistAccess: vi.fn(),
  getDashboardSettingsData: vi.fn(),
  getConversationById: vi.fn(),
  listDashboardTeamMembers: vi.fn(),
  listInboxConversationSummaries: vi.fn(),
  listSitesForUser: vi.fn(),
  requireUser: vi.fn()
};

vi.mock("@/lib/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/data/analytics", () => ({
  getAnalyticsDataset: mocks.getAnalyticsDataset
}));
vi.mock("@/lib/data/settings-ai-assist-access", () => ({
  getDashboardAiAssistAccess: mocks.getDashboardAiAssistAccess
}));
vi.mock("@/lib/data", () => ({
  getConversationById: mocks.getConversationById,
  getDashboardSettingsData: mocks.getDashboardSettingsData,
  listDashboardTeamMembers: mocks.listDashboardTeamMembers,
  listInboxConversationSummaries: mocks.listInboxConversationSummaries,
  listSitesForUser: mocks.listSitesForUser
}));

describe("dashboard page wrappers data pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    primeWrapperDefaults(mocks);
  });

  it("loads analytics and inbox pages with the expected child props", async () => {
    const captures: Record<string, unknown> = {};
    mocks.getAnalyticsDataset.mockResolvedValueOnce({ period: "30d", totals: { conversations: 12 } });
    mocks.getDashboardAiAssistAccess.mockResolvedValueOnce(GROWTH_AI_ASSIST_ACCESS);
    mocks.listInboxConversationSummaries.mockResolvedValueOnce([{ id: "conv_1" }]);
    mocks.listSitesForUser.mockResolvedValueOnce([{ id: "site_1" }]);
    mocks.listDashboardTeamMembers.mockResolvedValueOnce([{ id: "member_1" }]);
    mocks.getConversationById.mockResolvedValueOnce({ id: "conv_1", subject: "Pricing" });
    vi.doMock("./dashboard-analytics-page", () => ({
      DashboardAnalyticsPage: (props: unknown) => ((captures.analytics = props), <div>analytics</div>)
    }));
    vi.doMock("./dashboard-client", () => ({
      DashboardClient: (props: unknown) => ((captures.inbox = props), <div>inbox</div>)
    }));

    const analyticsPage = (await import("./analytics/page")).default;
    const inboxPage = (await import("./inbox/page")).default;

    expect(renderToStaticMarkup(await analyticsPage())).toContain("analytics");
    expect(
      renderToStaticMarkup(await inboxPage({ searchParams: Promise.resolve({ id: "conv_1" }) }))
    ).toContain("inbox");
    expect(captures.analytics).toEqual({
      initialDataset: { period: "30d", totals: { conversations: 12 } },
      userEmail: OWNER_USER.email,
      activeSection: "overview",
      showAllAiActivity: false
    });
    expect(captures.inbox).toEqual({
      userEmail: OWNER_USER.email,
      initialStats: EMPTY_INBOX_STATS,
      initialSites: [{ id: "site_1" }],
      initialConversations: [{ id: "conv_1" }],
      initialActiveConversation: { id: "conv_1", subject: "Pricing" },
      initialTeamMembers: [{ id: "member_1" }],
      initialAiAssistSettings: GROWTH_AI_ASSIST_ACCESS.settings,
      initialBillingPlanKey: "growth"
    });
  });

  it("requests ai assist usage when opening the ai assist settings section", async () => {
    mocks.getDashboardSettingsData.mockResolvedValueOnce({
      profile: { email: OWNER_USER.email },
      aiAssist: GROWTH_AI_ASSIST_ACCESS.settings,
      billing: { planKey: "growth" }
    });

    const settingsPage = (await import("./settings/page")).default;

    renderToStaticMarkup(
      await settingsPage({ searchParams: Promise.resolve({ section: "aiAssist" }) })
    );

    expect(mocks.getDashboardSettingsData).toHaveBeenCalledWith(
      OWNER_USER.id,
      expect.objectContaining({
        aiAssistUsage: true,
        fullBilling: false,
        workspace: {
          ownerUserId: OWNER_USER.workspaceOwnerId,
          role: OWNER_USER.workspaceRole
        }
      })
    );
  });
});
