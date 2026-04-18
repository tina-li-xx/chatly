const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  listAnalyticsConversations,
  listAnalyticsReplyEvents
} from "@/lib/repositories/analytics-repository";

describe("analytics repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists analytics conversations from recorded conversation snapshots", async () => {
    mocks.query.mockResolvedValueOnce({
      rows: [
        {
          id: "conv_1",
          created_at: "2026-03-01T10:00:00.000Z",
          updated_at: "2026-03-01T10:05:00.000Z",
          status: "resolved",
          page_url: "/pricing",
          referrer: "google",
          rating: 5,
          first_response_seconds: "42",
          resolution_seconds: "300",
          tags: ["pricing"]
        }
      ]
    });

    await expect(listAnalyticsConversations("user_1")).resolves.toHaveLength(1);
    expect(mocks.query.mock.calls[0]?.[0]).toContain("c.recorded_page_url AS page_url");
    expect(mocks.query.mock.calls[0]?.[0]).toContain("c.recorded_referrer AS referrer");
    expect(mocks.query.mock.calls[0]?.[0]).not.toContain("LEFT JOIN conversation_metadata cm");
    expect(mocks.query.mock.calls[0]?.[0]).toContain("ARRAY_AGG(t.tag ORDER BY t.tag)");
  });

  it("lists analytics reply events in chronological order", async () => {
    mocks.query.mockResolvedValueOnce({
      rows: [{ created_at: "2026-03-01T10:02:00.000Z", response_seconds: "18" }]
    });

    await expect(listAnalyticsReplyEvents("user_1")).resolves.toEqual([
      { created_at: "2026-03-01T10:02:00.000Z", response_seconds: "18" }
    ]);
    expect(mocks.query.mock.calls[0]?.[0]).toContain("WITH ordered_messages AS");
    expect(mocks.query.mock.calls[0]?.[0]).toContain("previous_sender = 'user'");
  });
});
