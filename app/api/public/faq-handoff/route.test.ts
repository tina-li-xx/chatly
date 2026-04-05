const mocks = vi.hoisted(() => ({
  handoffPublicConversationToTeam: vi.fn(),
  notifyIncomingVisitorMessage: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  handoffPublicConversationToTeam: mocks.handoffPublicConversationToTeam
}));
vi.mock("@/lib/team-notifications", () => ({
  notifyIncomingVisitorMessage: mocks.notifyIncomingVisitorMessage
}));

import { OPTIONS, POST } from "./route";

describe("public faq handoff route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notifyIncomingVisitorMessage.mockResolvedValue(undefined);
  });

  it("returns the preflight response", () => {
    expect(OPTIONS().status).toBe(204);
  });

  it("requires site, session, and conversation ids", async () => {
    const response = await POST(
      new Request("http://localhost/api/public/faq-handoff", {
        method: "POST",
        body: JSON.stringify({ siteId: "site_1" })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "siteId, sessionId, and conversationId are required."
    });
  });

  it("returns 404 when the visitor session cannot access the conversation", async () => {
    mocks.handoffPublicConversationToTeam.mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost/api/public/faq-handoff", {
        method: "POST",
        body: JSON.stringify({
          siteId: "site_1",
          sessionId: "session_1",
          conversationId: "conv_1"
        })
      })
    );

    expect(response.status).toBe(404);
    expect(mocks.notifyIncomingVisitorMessage).not.toHaveBeenCalled();
  });

  it("notifies the team when a pending FAQ handoff is released", async () => {
    mocks.handoffPublicConversationToTeam.mockResolvedValueOnce({
      notified: true,
      notification: {
        userId: "user_1",
        conversationId: "conv_1",
        createdAt: "2026-04-04T20:30:00.000Z",
        preview: "Need pricing help",
        siteName: "Main site",
        visitorLabel: "alex@example.com",
        pageUrl: "https://example.com/pricing",
        location: "London, UK",
        attachmentsCount: 0,
        isNewConversation: true,
        isNewVisitor: true,
        highIntent: true
      }
    });

    const response = await POST(
      new Request("http://localhost/api/public/faq-handoff", {
        method: "POST",
        body: JSON.stringify({
          siteId: "site_1",
          sessionId: "session_1",
          conversationId: "conv_1"
        })
      })
    );

    expect(mocks.notifyIncomingVisitorMessage).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user_1", conversationId: "conv_1" })
    );
    expect(await response.json()).toEqual({ ok: true, notified: true });
  });
});
