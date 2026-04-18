const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  hasConversationAccess,
  queryCoreConversationSummaries,
  queryConversationSummaries,
  queryMessageAttachmentRows,
  querySites,
  updateConversationEmailValue
} from "@/lib/repositories/shared-repository";

describe("shared repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs the shared site and conversation summary queries with caller clauses", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ id: "site_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "conv_1", rating: null, tags: [] }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ conversation_id: "conv_1", tags: ["vip"] }] })
      .mockResolvedValueOnce({ rows: [{ conversation_id: "conv_1", rating: 5 }] })
      .mockResolvedValueOnce({ rows: [{ id: "conv_core_1" }], rowCount: 1 });

    await expect(querySites("s.user_id = $1", ["user_1"], "ORDER BY s.created_at ASC")).resolves.toEqual({
      rows: [{ id: "site_1" }]
    });
    await expect(
      queryConversationSummaries("s.user_id = $1", ["user_1"], "ORDER BY c.updated_at DESC", "viewer_1")
    ).resolves.toMatchObject({ rows: [{ id: "conv_1", tags: ["vip"], rating: 5 }] });
    await expect(
      queryCoreConversationSummaries("s.user_id = $1", ["user_1"], "ORDER BY c.updated_at DESC", "viewer_1")
    ).resolves.toEqual({ rows: [{ id: "conv_core_1" }], rowCount: 1 });

    expect(mocks.query.mock.calls[0]?.[0]).toContain("WHERE s.user_id = $1");
    expect(mocks.query.mock.calls[0]?.[0]).toContain("ORDER BY s.created_at ASC");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("LEFT JOIN conversation_reads cr");
    expect(mocks.query.mock.calls[1]?.[0]).not.toContain("FROM messages m");
    expect(mocks.query.mock.calls[1]?.[0]).not.toContain("COUNT(*)::text AS unread_count");
    expect(mocks.query.mock.calls[1]?.[0]).not.toContain("LEFT JOIN conversation_metadata cm");
    expect(mocks.query.mock.calls[1]?.[0]).not.toContain("FROM visitor_presence_sessions vps");
    expect(mocks.query.mock.calls[1]?.[0]).not.toContain("LEFT JOIN feedback");
    expect(mocks.query.mock.calls[1]?.[0]).not.toContain("LEFT JOIN tags");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("tm.role = 'admin'");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("c.assigned_user_id = $2");
    expect(mocks.query.mock.calls[1]?.[1]).toEqual(["user_1", "viewer_1"]);
    expect(mocks.query.mock.calls[4]?.[0]).not.toContain("LEFT JOIN LATERAL");
    expect(mocks.query.mock.calls[4]?.[0]).not.toContain("LEFT JOIN conversation_metadata cm");
  });

  it("skips empty attachment lookups and otherwise fetches them in created order", async () => {
    mocks.query.mockResolvedValueOnce({ rows: [{ id: "att_1" }] });

    await expect(queryMessageAttachmentRows([])).resolves.toEqual([]);
    await expect(queryMessageAttachmentRows(["msg_1"])).resolves.toEqual([{ id: "att_1" }]);
    expect(mocks.query).toHaveBeenCalledTimes(1);
    expect(mocks.query.mock.calls[0]?.[0]).toContain("FROM message_attachments");
  });

  it("updates conversation email only when a normalized value exists", async () => {
    await updateConversationEmailValue("conv_1", "  ", "merge");
    await updateConversationEmailValue("conv_1", "alex@example.com", "merge");
    await updateConversationEmailValue("conv_1", "alex@example.com", "replace");

    expect(mocks.query).toHaveBeenCalledTimes(2);
    expect(mocks.query.mock.calls[0]?.[0]).toContain("email = COALESCE(email, $2)");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("email = $2");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual(["conv_1", "alex@example.com"]);
  });

  it("checks conversation access through the assignment-aware workspace access clause", async () => {
    mocks.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: "conv_1" }] });
    mocks.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    await expect(hasConversationAccess("conv_1", "owner_1", "user_1")).resolves.toBe(true);
    await expect(hasConversationAccess("conv_2", "owner_1", "user_1")).resolves.toBe(false);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("team_memberships");
    expect(mocks.query.mock.calls[0]?.[0]).toContain("tm.role = 'admin'");
    expect(mocks.query.mock.calls[0]?.[0]).toContain("c.assigned_user_id = $3");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual(["conv_1", "owner_1", "user_1"]);
  });
});
