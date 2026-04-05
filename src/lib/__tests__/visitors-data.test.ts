const mocks = vi.hoisted(() => ({
  findSiteOwnerRow: vi.fn(),
  findVisitorPresenceSessionRow: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  listVisitorPresenceRowsForUser: vi.fn(),
  publishDashboardLive: vi.fn(),
  syncDashboardContactFromPresence: vi.fn(),
  upsertVisitorPresenceSessionRow: vi.fn()
}));

vi.mock("@/lib/data/contacts", () => ({
  syncDashboardContactFromPresence: mocks.syncDashboardContactFromPresence
}));
vi.mock("@/lib/live-events", () => ({
  publishDashboardLive: mocks.publishDashboardLive
}));
vi.mock("@/lib/workspace-access", () => ({
  getWorkspaceAccess: mocks.getWorkspaceAccess
}));
vi.mock("@/lib/repositories/visitor-presence-repository", () => ({
  findSiteOwnerRow: mocks.findSiteOwnerRow,
  findVisitorPresenceSessionRow: mocks.findVisitorPresenceSessionRow,
  listVisitorPresenceRowsForUser: mocks.listVisitorPresenceRowsForUser,
  upsertVisitorPresenceSessionRow: mocks.upsertVisitorPresenceSessionRow
}));

import { listVisitorPresenceSessions, recordVisitorPresence } from "@/lib/data/visitors";

describe("visitors data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWorkspaceAccess.mockResolvedValue({
      ownerUserId: "owner_1",
      role: "owner"
    });
  });

  it("returns null for invalid presence input and maps listed sessions", async () => {
    mocks.listVisitorPresenceRowsForUser.mockResolvedValueOnce([
      null,
      {
        site_id: "site_1",
        session_id: "sess_1",
        conversation_id: null,
        email: null,
        current_page_url: "/pricing",
        referrer: "google",
        user_agent: "Safari",
        country: "GB",
        region: "London",
        city: "London",
        timezone: "Europe/London",
        locale: "en-GB",
        started_at: "2026-03-01T10:00:00.000Z",
        last_seen_at: "2026-03-01T10:05:00.000Z"
      }
    ]);

    await expect(recordVisitorPresence({ siteId: "", sessionId: "sess_1" })).resolves.toBeNull();
    await expect(listVisitorPresenceSessions("user_1")).resolves.toEqual([
      expect.objectContaining({ siteId: "site_1", currentPageUrl: "/pricing" })
    ]);
  });

  it("publishes live updates when visitor presence meaningfully changes", async () => {
    mocks.findSiteOwnerRow.mockResolvedValueOnce({ user_id: "owner_1" });
    mocks.findVisitorPresenceSessionRow.mockResolvedValueOnce({
      current_page_url: "/home",
      conversation_id: null,
      email: null
    });
    mocks.upsertVisitorPresenceSessionRow.mockResolvedValueOnce({
      site_id: "site_1",
      session_id: "sess_1",
      conversation_id: "conv_1",
      email: "hello@example.com",
      current_page_url: "/pricing",
      referrer: "google",
      user_agent: "Safari",
      country: "GB",
      region: "London",
      city: "London",
      timezone: "Europe/London",
      locale: "en-GB",
      started_at: "2026-03-01T10:00:00.000Z",
      last_seen_at: "2026-03-01T10:05:00.000Z"
    });

    await expect(
      recordVisitorPresence({
        siteId: "site_1",
        sessionId: " sess_1 ",
        conversationId: "conv_1",
        email: "hello@example.com",
        pageUrl: "/pricing"
      })
    ).resolves.toEqual(expect.objectContaining({ sessionId: "sess_1", currentPageUrl: "/pricing" }));

    expect(mocks.publishDashboardLive).toHaveBeenCalledWith(
      "owner_1",
      expect.objectContaining({ type: "visitor.presence.updated", pageUrl: "/pricing" })
    );
  });

  it("serializes database dates before syncing visitor contacts", async () => {
    mocks.findSiteOwnerRow.mockResolvedValueOnce(null);
    mocks.findVisitorPresenceSessionRow.mockResolvedValueOnce(null);
    mocks.syncDashboardContactFromPresence.mockResolvedValueOnce({
      contact: null,
      created: false,
      merged: false
    });
    mocks.upsertVisitorPresenceSessionRow.mockResolvedValueOnce({
      site_id: "site_1",
      session_id: "sess_1",
      conversation_id: "conv_1",
      email: "hello@example.com",
      current_page_url: "/pricing",
      referrer: "google",
      user_agent: "Safari",
      country: "GB",
      region: "London",
      city: "London",
      timezone: "Europe/London",
      locale: "en-GB",
      tags_json: [],
      custom_fields_json: {},
      started_at: new Date("2026-03-01T10:00:00.000Z"),
      last_seen_at: new Date("2026-03-01T10:05:00.000Z")
    });

    await recordVisitorPresence({
      siteId: "site_1",
      sessionId: "sess_1",
      conversationId: "conv_1",
      email: "hello@example.com",
      pageUrl: "/pricing"
    });

    expect(mocks.syncDashboardContactFromPresence).toHaveBeenCalledWith(
      expect.objectContaining({
        siteId: "site_1",
        email: "hello@example.com",
        conversationId: "conv_1",
        sessionId: "sess_1",
        seenAt: "2026-03-01T10:05:00.000Z",
        sessionDurationSeconds: 300
      })
    );
  });

  it("skips publishing when the owner is missing or nothing changed", async () => {
    mocks.findSiteOwnerRow.mockResolvedValueOnce(null);
    mocks.findVisitorPresenceSessionRow.mockResolvedValueOnce({
      current_page_url: "/pricing",
      conversation_id: "conv_1",
      email: "hello@example.com"
    });
    mocks.upsertVisitorPresenceSessionRow.mockResolvedValueOnce({
      site_id: "site_1",
      session_id: "sess_1",
      conversation_id: "conv_1",
      email: "hello@example.com",
      current_page_url: "/pricing",
      referrer: null,
      user_agent: null,
      country: null,
      region: null,
      city: null,
      timezone: null,
      locale: null,
      started_at: "2026-03-01T10:00:00.000Z",
      last_seen_at: "2026-03-01T10:05:00.000Z"
    });

    await recordVisitorPresence({ siteId: "site_1", sessionId: "sess_1", conversationId: "conv_1", email: "hello@example.com", pageUrl: "/pricing" });
    expect(mocks.publishDashboardLive).not.toHaveBeenCalled();
  });
});
