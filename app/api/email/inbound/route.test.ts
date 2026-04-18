const mocks = vi.hoisted(() => ({
  addInboundReply: vi.fn(),
  getConversationNotificationContext: vi.fn(),
  listInboundReplyAuthorizedEmails: vi.fn(),
  publishConversationLive: vi.fn(),
  previewIncomingMessage: vi.fn(),
  parseSesInboundReply: vi.fn(),
  verifySnsWebhookPayload: vi.fn(),
  notifyIncomingVisitorMessage: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  addInboundReply: mocks.addInboundReply,
  getConversationNotificationContext: mocks.getConversationNotificationContext
}));

vi.mock("@/lib/repositories/conversation-inbound-email-repository", () => ({
  listInboundReplyAuthorizedEmails: mocks.listInboundReplyAuthorizedEmails
}));

vi.mock("@/lib/live-events", () => ({
  publishConversationLive: mocks.publishConversationLive
}));

vi.mock("@/lib/notification-utils", () => ({
  previewIncomingMessage: mocks.previewIncomingMessage
}));

vi.mock("@/lib/ses-inbound", () => ({
  parseSesInboundReply: mocks.parseSesInboundReply
}));

vi.mock("@/lib/sns-webhook-auth", () => ({
  verifySnsWebhookPayload: mocks.verifySnsWebhookPayload
}));

vi.mock("@/lib/team-notifications", () => ({
  notifyIncomingVisitorMessage: mocks.notifyIncomingVisitorMessage
}));

import { POST } from "./route";

describe("ses inbound route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
    mocks.listInboundReplyAuthorizedEmails.mockResolvedValue(["visitor@example.com"]);
  });

  it("rejects failed webhook verification", async () => {
    mocks.verifySnsWebhookPayload.mockResolvedValueOnce({ ok: false, error: "bad-signature", status: 401 });

    const response = await POST(new Request("https://chatting.test/api/email/inbound", { method: "POST", body: "{}" }));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "bad-signature" });
  });

  it("confirms trusted sns subscriptions", async () => {
    mocks.verifySnsWebhookPayload.mockResolvedValueOnce({
      ok: true,
      envelope: {
        Type: "SubscriptionConfirmation",
        SubscribeURL: "https://sns.eu-west-1.amazonaws.com/confirm"
      }
    });

    const response = await POST(new Request("https://chatting.test/api/email/inbound", { method: "POST", body: "{}" }));

    expect(fetch).toHaveBeenCalledWith("https://sns.eu-west-1.amazonaws.com/confirm");
    expect(await response.json()).toEqual({ ok: true });
  });

  it("ignores sns notifications that do not turn into a reply", async () => {
    mocks.verifySnsWebhookPayload.mockResolvedValueOnce({
      ok: true,
      envelope: { Type: "Notification", Message: "raw-message" }
    });
    mocks.parseSesInboundReply.mockResolvedValueOnce({ ignored: true });

    const response = await POST(new Request("https://chatting.test/api/email/inbound", { method: "POST", body: "{}" }));

    expect(await response.json()).toEqual({ ok: true, ignored: true });
    expect(mocks.addInboundReply).not.toHaveBeenCalled();
  });

  it("persists replies, emits live events, and notifies the workspace", async () => {
    mocks.verifySnsWebhookPayload.mockResolvedValueOnce({
      ok: true,
      envelope: { Type: "Notification", Message: "raw-message" }
    });
    mocks.parseSesInboundReply.mockResolvedValueOnce({
      ignored: false,
      conversationId: "conversation_1",
      senderEmail: "visitor@example.com",
      body: "Hello from email",
      attachments: [
        {
          fileName: "brief.pdf",
          contentType: "application/pdf",
          sizeBytes: 5,
          content: Buffer.from("hello")
        }
      ]
    });
    mocks.addInboundReply.mockResolvedValueOnce({ createdAt: "2026-03-29T12:00:00.000Z" });
    mocks.getConversationNotificationContext.mockResolvedValueOnce({
      userId: "user_1",
      siteName: "Main site",
      summary: {
        email: "Visitor",
        pageUrl: "/pricing",
        city: "London",
        region: "England",
        country: "UK"
      }
    });
    mocks.previewIncomingMessage.mockReturnValueOnce("Hello from email");

    const response = await POST(new Request("https://chatting.test/api/email/inbound", { method: "POST", body: "{}" }));

    expect(response.status).toBe(200);
    expect(mocks.addInboundReply).toHaveBeenCalledWith(
      "conversation_1",
      "visitor@example.com",
      "Hello from email",
      [
        {
          fileName: "brief.pdf",
          contentType: "application/pdf",
          sizeBytes: 5,
          content: Buffer.from("hello")
        }
      ]
    );
    expect(mocks.previewIncomingMessage).toHaveBeenCalledWith("Hello from email", 1);
    expect(mocks.publishConversationLive).toHaveBeenCalledTimes(2);
    expect(mocks.notifyIncomingVisitorMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        conversationId: "conversation_1",
        preview: "Hello from email",
        attachmentsCount: 1,
        location: "London, England, UK",
        summary: expect.objectContaining({ pageUrl: "/pricing" })
      })
    );
  });

  it("ignores replies from senders that are not authorized for the conversation", async () => {
    mocks.verifySnsWebhookPayload.mockResolvedValueOnce({
      ok: true,
      envelope: { Type: "Notification", Message: "raw-message" }
    });
    mocks.parseSesInboundReply.mockResolvedValueOnce({
      ignored: false,
      conversationId: "conversation_1",
      senderEmail: "other@example.com",
      body: "Hello from email",
      attachments: []
    });

    const response = await POST(new Request("https://chatting.test/api/email/inbound", { method: "POST", body: "{}" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, ignored: true });
    expect(mocks.addInboundReply).not.toHaveBeenCalled();
    expect(mocks.publishConversationLive).not.toHaveBeenCalled();
    expect(mocks.notifyIncomingVisitorMessage).not.toHaveBeenCalled();
  });
});
