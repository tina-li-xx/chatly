const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  deleteConversationTypingRecord,
  deleteVisitorTypingRecord,
  findPreviousConversationByIdentity,
  getConversationVisitorActivityAggregate,
  insertMessageRecord,
  listInboundReplyAuthorizedEmails,
  touchConversationAfterMessage,
  updateConversationStatusRecord,
  updateVisitorConversationEmailRecord,
  upsertConversationTypingRecord,
  upsertVisitorTypingRecord
} from "@/lib/repositories/conversations-repository";

describe("conversations repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("switches identity matching between email and session queries", async () => {
    mocks.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: "conv_2" }] });
    mocks.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    await expect(
      findPreviousConversationByIdentity({
        siteId: "site_1",
        conversationId: "conv_1",
        useEmail: true,
        matchValue: "alex@example.com"
      })
    ).resolves.toBe(true);
    await expect(
      findPreviousConversationByIdentity({
        siteId: "site_1",
        conversationId: "conv_1",
        useEmail: false,
        matchValue: "session_1"
      })
    ).resolves.toBe(false);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("LOWER(email) = LOWER($3)");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("session_id = $3");
  });

  it("returns visitor activity aggregates and inserted messages", async () => {
    const aggregate = {
      other_questions_last_month: "2",
      other_conversations_last_month: "1",
      other_conversations_total: "4",
      last_seen_at: "2026-03-28T10:00:00.000Z"
    };
    const message = {
      id: "msg_1",
      conversation_id: "conv_1",
      sender: "team",
      content: "Happy to help",
      created_at: "2026-03-29T10:05:00.000Z"
    };
    mocks.query.mockResolvedValueOnce({ rows: [aggregate] });
    mocks.query.mockResolvedValueOnce({ rows: [message] });

    await expect(
      getConversationVisitorActivityAggregate({
        siteId: "site_1",
        conversationId: "conv_1",
        useEmail: true,
        matchValue: "alex@example.com"
      })
    ).resolves.toEqual(aggregate);
    await expect(
      insertMessageRecord({
        messageId: "msg_1",
        conversationId: "conv_1",
        sender: "team",
        content: "Happy to help"
      })
    ).resolves.toEqual(message);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("other_questions_last_month");
    expect(mocks.query.mock.calls[1]?.[0]).toContain(
      "RETURNING id, conversation_id, sender, author_user_id, content, created_at"
    );
  });

  it("updates status, touches threads, and persists visitor email ownership checks", async () => {
    mocks.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    mocks.query.mockResolvedValueOnce({ rows: [{ id: "conv_1" }], rowCount: 1 });
    mocks.query.mockResolvedValueOnce({ rows: [{ status: "resolved" }] });

    await touchConversationAfterMessage("conv_1", true);
    await expect(
      updateVisitorConversationEmailRecord({
        conversationId: "conv_1",
        siteId: "site_1",
        sessionId: "session_1",
        email: "alex@example.com"
      })
    ).resolves.toBe(true);
    await expect(updateConversationStatusRecord("conv_1", "user_1", "resolved")).resolves.toBe("resolved");

    expect(mocks.query.mock.calls[0]?.[0]).toContain("status = 'open'");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("AND session_id = $3");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("RETURNING c.status");
  });

  it("writes and clears typing records for both team and visitors", async () => {
    await deleteConversationTypingRecord("user_1", "conv_1");
    await upsertConversationTypingRecord("user_1", "conv_1");
    await deleteVisitorTypingRecord("conv_1", "session_1");
    await upsertVisitorTypingRecord("conv_1", "session_1");

    expect(mocks.query).toHaveBeenCalledTimes(4);
    expect(mocks.query.mock.calls[0]?.[0]).toContain("DELETE FROM conversation_typing");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("INSERT INTO conversation_typing");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("DELETE FROM visitor_typing");
    expect(mocks.query.mock.calls[3]?.[0]).toContain("INSERT INTO visitor_typing");
  });

  it("collects authorized inbound reply emails from the conversation and sent visitor emails", async () => {
    mocks.query.mockResolvedValueOnce({
      rows: [{ email: "alex@example.com" }, { email: "billing@example.com" }]
    });

    await expect(listInboundReplyAuthorizedEmails("conv_1")).resolves.toEqual([
      "alex@example.com",
      "billing@example.com"
    ]);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("FROM email_template_deliveries");
    expect(mocks.query.mock.calls[0]?.[0]).toContain("etd.status = 'sent'");
    expect(mocks.query.mock.calls[0]?.[0]).toContain("SELECT DISTINCT LOWER(source.email) AS email");
  });
});
