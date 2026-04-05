const mocks = vi.hoisted(() => ({
  createUserMessage: vi.fn(),
  extractUploadedAttachments: vi.fn(),
  extractVisitorMetadata: vi.fn(),
  notifyIncomingVisitorMessage: vi.fn(),
  publishConversationLive: vi.fn(),
  sendWelcomeTemplateEmail: vi.fn()
}));

vi.mock("@/lib/data", () => ({ createUserMessage: mocks.createUserMessage }));
vi.mock("@/lib/conversation-io", () => ({
  extractUploadedAttachments: mocks.extractUploadedAttachments,
  extractVisitorMetadata: mocks.extractVisitorMetadata
}));
vi.mock("@/lib/conversation-template-emails", () => ({ sendWelcomeTemplateEmail: mocks.sendWelcomeTemplateEmail }));
vi.mock("@/lib/live-events", () => ({ publishConversationLive: mocks.publishConversationLive }));
vi.mock("@/lib/team-notifications", () => ({ notifyIncomingVisitorMessage: mocks.notifyIncomingVisitorMessage }));

import { POST } from "./route";

describe("public messages route more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.extractVisitorMetadata.mockReturnValue({ locale: "en-GB" });
    mocks.notifyIncomingVisitorMessage.mockResolvedValue(undefined);
  });

  it("accepts multipart submissions with attachments and optional ids", async () => {
    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set("sessionId", "session_1");
    formData.set("conversationId", "conv_1");
    formData.set("email", "visitor@example.com");
    formData.set("pageUrl", "https://example.com/pricing");
    mocks.extractUploadedAttachments.mockResolvedValueOnce([{ id: "att_1", fileName: "brief.pdf" }]);
    mocks.createUserMessage.mockResolvedValueOnce({
      conversationId: "conv_1",
      siteUserId: "user_1",
      siteName: "Main site",
      visitorLabel: "Alex",
      pageUrl: "https://example.com/pricing",
      location: "London",
      preview: "Attached a file",
      isNewConversation: false,
      isNewVisitor: false,
      highIntent: false,
      welcomeEmailEligible: false,
      notification: { attachmentsCount: 1 },
      message: { id: "msg_1", conversationId: "conv_1", sender: "user", content: "", createdAt: "2026-03-29T10:00:00.000Z", attachments: [] }
    });

    const response = await POST(new Request("http://localhost/api/public/messages", { method: "POST", body: formData }));

    expect(mocks.extractUploadedAttachments).toHaveBeenCalledWith(expect.any(FormData));
    expect(mocks.createUserMessage).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: "conv_1",
      email: "visitor@example.com",
      attachments: [{ id: "att_1", fileName: "brief.pdf" }],
      metadata: { locale: "en-GB" }
    }));
    expect(mocks.notifyIncomingVisitorMessage).toHaveBeenCalledWith(expect.objectContaining({ attachmentsCount: 1 }));
    expect(mocks.sendWelcomeTemplateEmail).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("swallows welcome email failures and keeps the message request successful", async () => {
    mocks.createUserMessage.mockResolvedValueOnce({
      conversationId: "conv_1",
      siteUserId: "user_1",
      siteName: "Main site",
      visitorLabel: "Alex",
      pageUrl: "https://example.com/pricing",
      location: "London",
      preview: "Hello there",
      isNewConversation: true,
      isNewVisitor: true,
      highIntent: true,
      welcomeEmailEligible: true,
      message: { id: "msg_1", conversationId: "conv_1", sender: "user", content: "Hello", createdAt: "2026-03-29T10:00:00.000Z", attachments: [] }
    });
    mocks.sendWelcomeTemplateEmail.mockRejectedValueOnce(new Error("mail down"));

    const response = await POST(new Request("http://localhost/api/public/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteId: "site_1", sessionId: "session_1", content: "Hello" })
    }));

    expect(response.status).toBe(200);
    expect(mocks.sendWelcomeTemplateEmail).toHaveBeenCalledWith({ conversationId: "conv_1", userId: "user_1" });
  });

  it("maps attachment-too-large and generic failures", async () => {
    mocks.createUserMessage.mockRejectedValueOnce(new Error("ATTACHMENT_TOO_LARGE"));
    let response = await POST(new Request("http://localhost/api/public/messages", {
      method: "POST",
      body: JSON.stringify({ siteId: "site_1", sessionId: "session_1", content: "Hello" })
    }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Each attachment must be smaller than 4 MB." });

    mocks.createUserMessage.mockRejectedValueOnce(new Error("boom"));
    response = await POST(new Request("http://localhost/api/public/messages", {
      method: "POST",
      body: JSON.stringify({ siteId: "site_1", sessionId: "session_1", content: "Hello" })
    }));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to store message." });
  });
});
