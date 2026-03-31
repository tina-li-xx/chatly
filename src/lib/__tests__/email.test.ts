const mocks = vi.hoisted(() => ({
  buildConversationFeedbackLinks: vi.fn(),
  renderConversationFeedbackScale: vi.fn(),
  renderConversationFeedbackText: vi.fn(),
  renderNewMessageNotificationEmail: vi.fn(),
  sendSesEmail: vi.fn()
}));

vi.mock("@/lib/chatly-notification-emails", () => ({
  renderNewMessageNotificationEmail: mocks.renderNewMessageNotificationEmail
}));
vi.mock("@/lib/conversation-feedback", () => ({
  buildConversationFeedbackLinks: mocks.buildConversationFeedbackLinks
}));
vi.mock("@/lib/conversation-feedback-email", () => ({
  renderConversationFeedbackScale: mocks.renderConversationFeedbackScale,
  renderConversationFeedbackText: mocks.renderConversationFeedbackText
}));
vi.mock("@/lib/env", () => ({ getPublicAppUrl: () => "https://app.example" }));
vi.mock("@/lib/env.server", () => ({
  getAppDisplayName: () => "Chatting",
  getMailFromAddress: () => "team@chatting.test",
  getReplyDomain: () => "reply.chatting.test"
}));
vi.mock("@/lib/ses-email", () => ({ sendSesEmail: mocks.sendSesEmail }));

import {
  sendFounderReplyEmail,
  sendSettingsTemplateTestEmail,
  sendTeamNewMessageEmail
} from "@/lib/email";

const renderedShellHtml =
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;"><tr><td>HTML body</td></tr></table>';

describe("email helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.buildConversationFeedbackLinks.mockReturnValue({ positive: "yes", negative: "no" });
    mocks.renderConversationFeedbackText.mockReturnValue("1 2 3 4 5");
    mocks.renderConversationFeedbackScale.mockReturnValue("<div>Scale</div>");
    mocks.renderNewMessageNotificationEmail.mockReturnValue({
      subject: "New visitor message",
      bodyText: "Preview text",
      bodyHtml: renderedShellHtml
    });
    mocks.sendSesEmail.mockResolvedValue(undefined);
  });

  it("sends founder reply emails with feedback links and a reply alias", async () => {
    await sendFounderReplyEmail({
      conversationId: "conv_1",
      to: "alex@example.com",
      content: "Line 1\nLine 2",
      attachments: [{ fileName: "pricing.pdf", contentType: "application/pdf", content: Buffer.from("x") }]
    });

    expect(mocks.sendSesEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "team@chatting.test",
        to: "alex@example.com",
        replyTo: "reply+conv_1@reply.chatting.test",
        subject: "Reply from Chatting",
        bodyText: expect.stringContaining("Reply to this email to continue the conversation."),
        bodyHtml: expect.stringContaining("Attached: pricing.pdf")
      })
    );
  });

  it("sends team new-message emails with reply and inbox links", async () => {
    await sendTeamNewMessageEmail({
      to: "team@example.com",
      siteName: "Main site",
      conversationId: "conv_1",
      content: "Need help",
      visitorEmail: "alex@example.com",
      pageUrl: "https://example.com/pricing",
      attachmentsCount: 2
    });

    expect(mocks.renderNewMessageNotificationEmail).toHaveBeenCalledWith({
      visitorName: "alex@example.com",
      visitorEmail: "alex@example.com",
      currentPage: "https://example.com/pricing",
      messagePreview: "Need help",
      replyNowUrl: "mailto:reply+conv_1@reply.chatting.test",
      inboxUrl: "https://app.example/dashboard?id=conv_1",
      workspaceName: "Main site",
      attachmentsCount: 2
    });
    const sentEmail = mocks.sendSesEmail.mock.calls[0]?.[0];
    expect(sentEmail).toEqual(
      expect.objectContaining({
        to: "team@example.com",
        subject: "New visitor message",
        replyTo: "reply+conv_1@reply.chatting.test",
        bodyHtml: renderedShellHtml
      })
    );
    expect(sentEmail?.bodyText).toContain("Preview text");
    expect(sentEmail?.bodyText).toContain("Company No. 16998528");
  });

  it("passes rendered settings template emails through the shared rich-email path", async () => {
    await sendSettingsTemplateTestEmail({
      to: "team@example.com",
      subject: "Chatting email probe",
      bodyText: "Probe email from local workspace.",
      bodyHtml: renderedShellHtml
    });

    const sentEmail = mocks.sendSesEmail.mock.calls[0]?.[0];
    expect(sentEmail).toEqual(
      expect.objectContaining({
        from: "team@chatting.test",
        to: "team@example.com",
        subject: "Chatting email probe",
        bodyHtml: renderedShellHtml
      })
    );
    expect(sentEmail?.bodyText).toContain("Probe email from local workspace.");
    expect(sentEmail?.bodyText).toContain("Company No. 16998528");
  });

  it("rejects raw html that skips the shared email shell", async () => {
    await expect(
      sendSettingsTemplateTestEmail({
        to: "team@example.com",
        subject: "Template preview",
        bodyText: "Plain body",
        bodyHtml: "<p>HTML body</p>"
      })
    ).rejects.toThrow("sendRichEmail requires fully rendered Chatting email HTML.");

    expect(mocks.sendSesEmail).not.toHaveBeenCalled();
  });

  it("does not alter already-rendered email shells", async () => {
    await sendSettingsTemplateTestEmail({
      to: "team@example.com",
      subject: "Template preview",
      bodyText: "Plain body",
      bodyHtml: renderedShellHtml
    });

    expect(mocks.sendSesEmail.mock.calls[0]?.[0].bodyHtml).toBe(renderedShellHtml);
  });
});
