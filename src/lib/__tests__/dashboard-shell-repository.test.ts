const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  findDashboardShellRow,
  findDashboardUnreadCount
} from "@/lib/repositories/dashboard-shell-repository";

describe("dashboard shell repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads unread counts from conversation snapshots instead of recounting messages", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ unread_count: "4" }] })
      .mockResolvedValueOnce({
        rows: [{
          browser_notifications: true,
          sound_alerts: true,
          email_notifications: true,
          new_visitor_alerts: true,
          high_intent_alerts: true,
          unread_count: "2",
          ai_assist_requests_used: null
        }]
      });

    await expect(findDashboardUnreadCount({ ownerUserId: "owner_1", viewerUserId: "viewer_1" })).resolves.toBe(4);
    await expect(findDashboardShellRow({
      viewerUserId: "viewer_1",
      ownerUserId: "owner_1",
      includeAiAssistWarning: false,
      cycleStart: null,
      cycleEnd: null
    })).resolves.toMatchObject({ unread_count: "2" });

    expect(mocks.query.mock.calls[0]?.[0]).toContain("SUM(COALESCE(cr.unread_count, 0))");
    expect(mocks.query.mock.calls[0]?.[0]).not.toContain("FROM messages m");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("SUM(COALESCE(cr.unread_count, 0))");
    expect(mocks.query.mock.calls[1]?.[0]).not.toContain("FROM messages m");
  });
});
