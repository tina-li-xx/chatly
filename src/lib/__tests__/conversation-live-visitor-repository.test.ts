const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  findConversationLiveVisitorRow,
  listConversationLiveVisitorRows
} from "@/lib/repositories/conversation-live-visitor-repository";

describe("conversation live visitor repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads the freshest live visitor row for a single accessible conversation", async () => {
    mocks.query.mockResolvedValueOnce({
      rows: [{ email: "alex@example.com", current_page_url: "/pricing" }]
    });

    await expect(
      findConversationLiveVisitorRow({
        conversationId: "conv_1",
        ownerUserId: "owner_1",
        viewerUserId: "viewer_1"
      })
    ).resolves.toEqual({
      email: "alex@example.com",
      current_page_url: "/pricing"
    });

    expect(mocks.query.mock.calls[0]?.[0]).toContain("FROM conversations c");
    expect(mocks.query.mock.calls[0]?.[0]).toContain("INNER JOIN visitor_presence_sessions vps");
    expect(mocks.query.mock.calls[0]?.[0]).toContain("c.assigned_user_id = $3");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual(["conv_1", "owner_1", "viewer_1"]);
  });

  it("reads the freshest live visitor rows for a summary list in one query", async () => {
    mocks.query.mockResolvedValueOnce({
      rows: [{ conversation_id: "conv_1", email: "alex@example.com", current_page_url: "/docs" }]
    });

    await expect(
      listConversationLiveVisitorRows({
        conversationIds: ["conv_1", "conv_2"],
        ownerUserId: "owner_1",
        viewerUserId: "viewer_1"
      })
    ).resolves.toEqual([
      { conversation_id: "conv_1", email: "alex@example.com", current_page_url: "/docs" }
    ]);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("SELECT DISTINCT ON (c.id)");
    expect(mocks.query.mock.calls[0]?.[0]).toContain("c.id = ANY($1::text[])");
    expect(mocks.query.mock.calls[0]?.[0]).toContain("vps.last_seen_at > NOW() - INTERVAL '5 minutes'");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual([["conv_1", "conv_2"], "owner_1", "viewer_1"]);
  });
});
