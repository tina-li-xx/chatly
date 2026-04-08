const mocks = vi.hoisted(() => ({
  createUserMessage: vi.fn(),
  deliverZapierEvent: vi.fn(),
  extractUploadedAttachments: vi.fn(),
  extractVisitorMetadata: vi.fn(),
  getConversationSummaryById: vi.fn(),
  notifyIncomingVisitorMessage: vi.fn(),
  publishConversationLive: vi.fn(),
  sendWelcomeTemplateEmail: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  createUserMessage: mocks.createUserMessage,
  getConversationSummaryById: mocks.getConversationSummaryById
}));
vi.mock("@/lib/conversation-io", () => ({
  extractUploadedAttachments: mocks.extractUploadedAttachments,
  extractVisitorMetadata: mocks.extractVisitorMetadata
}));
vi.mock("@/lib/conversation-template-emails", () => ({
  sendWelcomeTemplateEmail: mocks.sendWelcomeTemplateEmail
}));
vi.mock("@/lib/live-events", () => ({
  publishConversationLive: mocks.publishConversationLive
}));
vi.mock("@/lib/team-notifications", () => ({
  notifyIncomingVisitorMessage: mocks.notifyIncomingVisitorMessage
}));
vi.mock("@/lib/zapier-event-delivery", () => ({
  deliverZapierEvent: mocks.deliverZapierEvent
}));

import { OPTIONS, POST } from "./route";

describe("public messages route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.extractUploadedAttachments.mockResolvedValue([]);
    mocks.extractVisitorMetadata.mockReturnValue({ pageUrl: "https://example.com/pricing" });
    mocks.getConversationSummaryById.mockResolvedValue({
      email: "visitor@example.com",
      assignedUserId: null,
      tags: []
    });
    mocks.notifyIncomingVisitorMessage.mockResolvedValue(undefined);
    mocks.sendWelcomeTemplateEmail.mockResolvedValue(undefined);
  });

  it("returns the preflight response", async () => {
    expect((await OPTIONS()).status).toBe(204);
  });

  it("requires site, session, and message content or attachments", async () => {
    const response = await POST(
      new Request("http://localhost/api/public/messages", {
        method: "POST",
        body: JSON.stringify({ siteId: "site_1", sessionId: "session_1", content: "   " })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "siteId, sessionId, and either content or an attachment are required."
    });
  });

  it("stores visitor messages, publishes live events, and sends the welcome template", async () => {
    mocks.createUserMessage.mockResolvedValueOnce({
      conversationId: "conv_1",
      siteUserId: "user_1",
      isNewConversation: true,
      isNewVisitor: true,
      highIntent: true,
      welcomeEmailEligible: true,
      deferTeamNotification: true,
      notification: {
        userId: "user_1",
        conversationId: "conv_1",
        createdAt: "2026-03-29T10:00:00.000Z",
        preview: "Hello there",
        siteName: "Main site",
        visitorLabel: "Alex",
        pageUrl: "https://example.com/pricing",
        location: "London, UK",
        attachmentsCount: 0,
        isNewConversation: true,
        isNewVisitor: true,
        highIntent: true
      },
      faqSuggestions: {
        fallbackMessage: "None of these help? A team member will be with you shortly.",
        items: [
          {
            id: "faq_1",
            question: "What are your pricing plans?",
            answer: "We offer Free, Growth, and Business plans.",
            link: "https://example.com/pricing"
          }
        ]
      },
      message: {
        id: "msg_1",
        conversationId: "conv_1",
        sender: "user",
        content: "Hello there",
        createdAt: "2026-03-29T10:00:00.000Z",
        attachments: []
      }
    });

    const response = await POST(
      new Request("http://localhost/api/public/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          siteId: "site_1",
          sessionId: "session_1",
          content: "Hello there",
          pageUrl: "https://example.com/pricing",
          visitorTags: ["enterprise", "vip"],
          customFields: { plan: "Growth" }
        })
      })
    );

    expect(mocks.extractVisitorMetadata).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({
        pageUrl: "https://example.com/pricing",
        visitorTags: ["enterprise", "vip"],
        customFields: { plan: "Growth" }
      })
    );
    expect(mocks.createUserMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        siteId: "site_1",
        sessionId: "session_1",
        content: "Hello there",
        attachments: [],
        metadata: { pageUrl: "https://example.com/pricing" }
      })
    );
    expect(mocks.publishConversationLive).toHaveBeenCalledTimes(2);
    expect(mocks.deliverZapierEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: "user_1",
        eventType: "conversation.created"
      })
    );
    expect(mocks.notifyIncomingVisitorMessage).not.toHaveBeenCalled();
    expect(mocks.sendWelcomeTemplateEmail).toHaveBeenCalledWith({ conversationId: "conv_1", userId: "user_1" });
    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      message: {
        id: "msg_1",
        conversationId: "conv_1",
        sender: "user",
        content: "Hello there",
        createdAt: "2026-03-29T10:00:00.000Z",
        attachments: []
      },
      faqSuggestions: {
        fallbackMessage: "None of these help? A team member will be with you shortly.",
        items: [
          {
            id: "faq_1",
            question: "What are your pricing plans?",
            answer: "We offer Free, Growth, and Business plans.",
            link: "https://example.com/pricing"
          }
        ]
      }
    });
  });

  it("publishes a team live event when an automated away reply is created", async () => {
    mocks.createUserMessage.mockResolvedValueOnce({
      conversationId: "conv_1",
      siteUserId: "user_1",
      isNewConversation: true,
      isNewVisitor: true,
      highIntent: true,
      welcomeEmailEligible: false,
      deferTeamNotification: false,
      notification: {
        userId: "user_1",
        conversationId: "conv_1",
        createdAt: "2026-03-29T10:00:00.000Z",
        preview: "Hello there",
        siteName: "Main site",
        visitorLabel: "Alex",
        pageUrl: "https://example.com/pricing",
        location: "London, UK",
        attachmentsCount: 0,
        isNewConversation: true,
        isNewVisitor: true,
        highIntent: true
      },
      message: {
        id: "msg_1",
        conversationId: "conv_1",
        sender: "user",
        content: "Hello there",
        createdAt: "2026-03-29T10:00:00.000Z",
        attachments: []
      },
      automationReply: {
        id: "msg_2",
        conversationId: "conv_1",
        sender: "team",
        content: "We will reply shortly.",
        createdAt: "2026-03-29T10:00:01.000Z",
        attachments: []
      }
    });

    await POST(
      new Request("http://localhost/api/public/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteId: "site_1", sessionId: "session_1", content: "Hello there" })
      })
    );

    expect(mocks.publishConversationLive).toHaveBeenCalledTimes(4);
    expect(mocks.notifyIncomingVisitorMessage).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user_1", conversationId: "conv_1", highIntent: true })
    );
    expect(mocks.publishConversationLive).toHaveBeenNthCalledWith(
      3,
      "conv_1",
      expect.objectContaining({ type: "message.created", sender: "team" })
    );
  });

  it("passes visitor profile fields from multipart widget posts into metadata extraction", async () => {
    mocks.createUserMessage.mockResolvedValueOnce({
      conversationId: "conv_1",
      siteUserId: "user_1",
      isNewConversation: true,
      isNewVisitor: true,
      highIntent: false,
      welcomeEmailEligible: false,
      deferTeamNotification: false,
      notification: {
        userId: "user_1",
        conversationId: "conv_1",
        createdAt: "2026-03-29T10:00:00.000Z",
        preview: "Hello there",
        siteName: "Main site",
        visitorLabel: "Alex",
        pageUrl: "https://example.com/pricing",
        location: "London, UK",
        attachmentsCount: 0,
        isNewConversation: true,
        isNewVisitor: true,
        highIntent: false
      },
      message: {
        id: "msg_1",
        conversationId: "conv_1",
        sender: "user",
        content: "Hello there",
        createdAt: "2026-03-29T10:00:00.000Z",
        attachments: []
      }
    });
    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set("sessionId", "session_1");
    formData.set("content", "Hello there");
    formData.set("visitorTags", '["enterprise"]');
    formData.set("customFields", '{"plan":"Growth"}');

    await POST(
      new Request("http://localhost/api/public/messages", {
        method: "POST",
        body: formData
      })
    );

    expect(mocks.extractVisitorMetadata).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({
        visitorTags: '["enterprise"]',
        customFields: '{"plan":"Growth"}'
      })
    );
  });

  it("maps known site and attachment errors", async () => {
    mocks.createUserMessage.mockRejectedValueOnce(new Error("SITE_NOT_FOUND"));
    let response = await POST(
      new Request("http://localhost/api/public/messages", {
        method: "POST",
        body: JSON.stringify({ siteId: "site_1", sessionId: "session_1", content: "Hello there" })
      })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Unknown siteId. Create a site in the dashboard first." });

    mocks.createUserMessage.mockRejectedValueOnce(new Error("ATTACHMENT_LIMIT"));
    response = await POST(
      new Request("http://localhost/api/public/messages", {
        method: "POST",
        body: JSON.stringify({ siteId: "site_1", sessionId: "session_1", content: "Hello there" })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "You can attach up to 3 files per message." });
  });
});
