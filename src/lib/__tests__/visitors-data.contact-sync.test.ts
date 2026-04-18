const mocks = vi.hoisted(() => ({
  findSiteOwnerRow: vi.fn(),
  findVisitorPresenceSessionRow: vi.fn(),
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
vi.mock("@/lib/repositories/visitor-presence-repository", () => ({
  findSiteOwnerRow: mocks.findSiteOwnerRow,
  findVisitorPresenceSessionRow: mocks.findVisitorPresenceSessionRow,
  listVisitorPresenceRowsForUser: vi.fn(),
  upsertVisitorPresenceSessionRow: mocks.upsertVisitorPresenceSessionRow
}));
vi.mock("@/lib/workspace-access", () => ({
  getWorkspaceAccess: vi.fn()
}));

import { recordVisitorPresence } from "@/lib/data/visitors";

const PREVIOUS_ROW = {
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
  tags_json: ["lead"],
  custom_fields_json: { plan: "starter" },
  started_at: "2026-03-01T10:00:00.000Z",
  last_seen_at: "2026-03-01T10:04:00.000Z"
};

describe("visitors contact sync policy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findSiteOwnerRow.mockResolvedValue(null);
  });

  it("skips contact sync for unchanged identified heartbeats", async () => {
    mocks.findVisitorPresenceSessionRow.mockResolvedValueOnce(PREVIOUS_ROW);
    mocks.upsertVisitorPresenceSessionRow.mockResolvedValueOnce({
      ...PREVIOUS_ROW,
      last_seen_at: "2026-03-01T10:05:00.000Z"
    });

    await recordVisitorPresence({
      siteId: "site_1",
      sessionId: "sess_1",
      conversationId: "conv_1",
      email: "hello@example.com",
      pageUrl: "/pricing",
      referrer: "google",
      visitorTags: ["lead"],
      customFields: { plan: "starter" }
    });

    expect(mocks.syncDashboardContactFromPresence).not.toHaveBeenCalled();
  });

  it("still syncs contacts when tags or custom fields change", async () => {
    mocks.findVisitorPresenceSessionRow.mockResolvedValueOnce(PREVIOUS_ROW);
    mocks.syncDashboardContactFromPresence.mockResolvedValueOnce({
      contact: null,
      created: false,
      merged: false
    });
    mocks.upsertVisitorPresenceSessionRow.mockResolvedValueOnce({
      ...PREVIOUS_ROW,
      tags_json: ["lead", "vip"],
      custom_fields_json: { plan: "starter", tier: "enterprise" },
      last_seen_at: "2026-03-01T10:05:00.000Z"
    });

    await recordVisitorPresence({
      siteId: "site_1",
      sessionId: "sess_1",
      conversationId: "conv_1",
      email: "hello@example.com",
      pageUrl: "/pricing",
      referrer: "google",
      visitorTags: ["lead", "vip"],
      customFields: { plan: "starter", tier: "enterprise" }
    });

    expect(mocks.syncDashboardContactFromPresence).toHaveBeenCalledWith(
      expect.objectContaining({
        siteId: "site_1",
        email: "hello@example.com",
        visitorTags: ["lead", "vip"],
        customFields: { plan: "starter", tier: "enterprise" }
      })
    );
  });
});
