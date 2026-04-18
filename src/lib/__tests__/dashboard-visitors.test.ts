const mocks = vi.hoisted(() => ({
  getWorkspaceAccess: vi.fn(),
  overlayConversationSummariesWithLivePresence: vi.fn(),
  queryConversationSummaries: vi.fn(),
  queryVisitorsPageConversationSummaries: vi.fn()
}));

vi.mock("@/lib/workspace-access", () => ({
  getWorkspaceAccess: mocks.getWorkspaceAccess
}));

vi.mock("@/lib/data/conversation-summary-live-presence", () => ({
  overlayConversationSummariesWithLivePresence: mocks.overlayConversationSummariesWithLivePresence
}));

vi.mock("@/lib/data/shared", () => ({
  mapSummary: (row: Record<string, unknown>) => ({
    id: row.id,
    siteId: row.site_id,
    email: row.email ?? null,
    sessionId: row.session_id,
    pageUrl: row.page_url
  }),
  queryConversationSummaries: mocks.queryConversationSummaries
}));

vi.mock("@/lib/repositories/visitors-page-conversation-repository", () => ({
  queryVisitorsPageConversationSummaries: mocks.queryVisitorsPageConversationSummaries
}));

import {
  listConversationSummariesForVisitor,
  listVisitorsPageConversationSummaries
} from "@/lib/data/dashboard-visitors";

describe("dashboard visitors summaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
    mocks.overlayConversationSummariesWithLivePresence.mockImplementation(async (summaries: unknown) => summaries);
  });

  it("overlays live presence onto the visitors page list", async () => {
    mocks.queryVisitorsPageConversationSummaries.mockResolvedValueOnce({
      rows: [{ id: "conv_1", site_id: "site_1", session_id: "sess_1", page_url: "/pricing" }]
    });

    await expect(listVisitorsPageConversationSummaries("viewer_1")).resolves.toEqual([
      { id: "conv_1", siteId: "site_1", email: null, sessionId: "sess_1", pageUrl: "/pricing" }
    ]);

    expect(mocks.overlayConversationSummariesWithLivePresence).toHaveBeenCalledWith(
      [{ id: "conv_1", siteId: "site_1", email: null, sessionId: "sess_1", pageUrl: "/pricing" }],
      { ownerUserId: "owner_1", viewerUserId: "viewer_1" }
    );
  });

  it("overlays live presence onto focused visitor conversation summaries", async () => {
    mocks.queryConversationSummaries.mockResolvedValueOnce({
      rows: [{ id: "conv_2", site_id: "site_1", email: "alex@example.com", session_id: "sess_2", page_url: "/docs" }]
    });

    await expect(
      listConversationSummariesForVisitor({
        userId: "viewer_1",
        siteId: "site_1",
        email: "alex@example.com"
      })
    ).resolves.toEqual([
      { id: "conv_2", siteId: "site_1", email: "alex@example.com", sessionId: "sess_2", pageUrl: "/docs" }
    ]);

    expect(mocks.queryConversationSummaries).toHaveBeenCalledWith(
      expect.stringContaining("LOWER(COALESCE(c.email, '')) = LOWER($2)"),
      ["site_1", "alex@example.com", "owner_1"],
      "ORDER BY c.last_message_at DESC NULLS LAST, c.updated_at DESC",
      "viewer_1"
    );
    expect(mocks.overlayConversationSummariesWithLivePresence).toHaveBeenCalledWith(
      [{ id: "conv_2", siteId: "site_1", email: "alex@example.com", sessionId: "sess_2", pageUrl: "/docs" }],
      { ownerUserId: "owner_1", viewerUserId: "viewer_1" }
    );
  });
});
