const mocks = vi.hoisted(() => ({
  getDashboardAiAssistUsage: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  listAnalyticsConversations: vi.fn(),
  listAnalyticsReplyEvents: vi.fn(),
  parseConversationRating: vi.fn(),
  getConversationTotalsForUser: vi.fn(),
  getRatedConversationCountForUser: vi.fn(),
  listTopTagsForUser: vi.fn(),
  upsertUserPresence: vi.fn()
}));

vi.mock("@/lib/workspace-access", () => ({
  getWorkspaceAccess: mocks.getWorkspaceAccess
}));
vi.mock("@/lib/data/settings-ai-assist-usage-read", () => ({
  getDashboardAiAssistUsage: mocks.getDashboardAiAssistUsage
}));
vi.mock("@/lib/repositories/analytics-repository", () => ({
  listAnalyticsConversations: mocks.listAnalyticsConversations,
  listAnalyticsReplyEvents: mocks.listAnalyticsReplyEvents
}));
vi.mock("@/lib/conversation-feedback", () => ({
  parseConversationRating: mocks.parseConversationRating
}));
vi.mock("@/lib/repositories/stats-repository", () => ({
  getConversationTotalsForUser: mocks.getConversationTotalsForUser,
  getRatedConversationCountForUser: mocks.getRatedConversationCountForUser,
  listTopTagsForUser: mocks.listTopTagsForUser
}));
vi.mock("@/lib/repositories/presence-repository", () => ({
  upsertUserPresence: mocks.upsertUserPresence
}));

import { getAnalyticsDataset } from "@/lib/data/analytics";
import { recordUserPresence } from "@/lib/data/presence";
import { getDashboardStats } from "@/lib/data/stats";

describe("small dashboard data modules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWorkspaceAccess.mockResolvedValue({
      ownerUserId: "owner_1",
      role: "admin"
    });
    mocks.getDashboardAiAssistUsage.mockResolvedValue({
      overview: { requests: 0 }
    });
  });

  it("maps analytics dataset rows into dashboard records", async () => {
    mocks.listAnalyticsConversations.mockResolvedValueOnce([
      {
        id: "conv_1",
        created_at: "2026-03-01T10:00:00.000Z",
        updated_at: "2026-03-01T10:05:00.000Z",
        status: "resolved",
        page_url: "/pricing",
        referrer: "google",
        rating: 5,
        first_response_seconds: "42",
        resolution_seconds: null,
        tags: null
      }
    ]);
    mocks.listAnalyticsReplyEvents.mockResolvedValueOnce([
      { created_at: "2026-03-01T10:02:00.000Z", response_seconds: "18" }
    ]);
    mocks.parseConversationRating.mockReturnValue("positive");

    await expect(getAnalyticsDataset("viewer_1")).resolves.toEqual({
      conversations: [
        expect.objectContaining({
          id: "conv_1",
          rating: "positive",
          firstResponseSeconds: 42,
          resolutionSeconds: null,
          tags: []
        })
      ],
      replyEvents: [{ createdAt: "2026-03-01T10:02:00.000Z", responseSeconds: 18 }],
      aiAssist: { overview: { requests: 0 } }
    });
    expect(mocks.listAnalyticsConversations).toHaveBeenCalledWith("owner_1");
    expect(mocks.getDashboardAiAssistUsage).toHaveBeenCalledWith({
      ownerUserId: "owner_1",
      viewerUserId: "viewer_1",
      viewerRole: "admin",
      recentLimit: 12
    });
  });

  it("maps dashboard stats and delegates user presence writes", async () => {
    mocks.getConversationTotalsForUser.mockResolvedValueOnce({ total: "12", answered: "9" });
    mocks.getRatedConversationCountForUser.mockResolvedValueOnce("5");
    mocks.listTopTagsForUser.mockResolvedValueOnce([{ tag: "pricing", count: "3" }]);

    await expect(getDashboardStats("viewer_1")).resolves.toEqual({
      totalConversations: 12,
      answeredConversations: 9,
      ratedConversations: 5,
      topTags: [{ tag: "pricing", count: 3 }]
    });
    await recordUserPresence("user_1");

    expect(mocks.getConversationTotalsForUser).toHaveBeenCalledWith("owner_1");
    expect(mocks.upsertUserPresence).toHaveBeenCalledWith("user_1");
  });
});
