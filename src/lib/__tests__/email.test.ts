const mocks = vi.hoisted(() => ({
  buildConversationFeedbackLinks: vi.fn(),
  buildEmailUnsubscribeUrl: vi.fn(),
  isEmailRecipientUnsubscribed: vi.fn(),
  renderConversationFeedbackScale: vi.fn(),
  renderConversationFeedbackText: vi.fn(),
  renderNewMessageNotificationEmail: vi.fn(),
  sendSesEmail: vi.fn()
}));

vi.mock("@/lib/chatting-notification-emails", () => ({
  renderNewMessageNotificationEmail: mocks.renderNewMessageNotificationEmail
}));
vi.mock("@/lib/conversation-feedback", () => ({
  buildConversationFeedbackLinks: mocks.buildConversationFeedbackLinks
}));
vi.mock("@/lib/email-unsubscribe", () => ({
  buildEmailUnsubscribeUrl: mocks.buildEmailUnsubscribeUrl,
  isEmailRecipientUnsubscribed: mocks.isEmailRecipientUnsubscribed
}));
vi.mock("@/lib/conversation-feedback-email", () => ({
  renderConversationFeedbackScale: mocks.renderConversationFeedbackScale,
  renderConversationFeedbackText: mocks.renderConversationFeedbackText
}));
vi.mock("@/lib/env", () => ({ getPublicAppUrl: () => "https://app.example" }));
vi.mock("@/lib/env.server", () => ({
  getAppDisplayName: () => "Chatting",
  getReplyDomain: () => "reply.chatting.test"
}));
vi.mock("@/lib/ses-email", () => ({ sendSesEmail: mocks.sendSesEmail }));

import {
  sendTeamReplyEmail,
  sendRichEmail,
  sendTeamNewMessageEmail
} from "@/lib/email";
import { sendRenderedEmail } from "@/lib/rendered-email-delivery";

const renderedShellHtml =
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;margin:0;padding:0;background:#F1F5F9;"><tr><td align="center" style="padding:40px 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;"><tr><td>HTML body</td></tr></table></td></tr></table>';

describe("email helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.buildConversationFeedbackLinks.mockReturnValue({ positive: "yes", negative: "no" });
    mocks.buildEmailUnsubscribeUrl.mockImplementation((email: string) => `https://app.example/email/unsubscribe?token=${email}`);
    mocks.isEmailRecipientUnsubscribed.mockResolvedValue(false);
    mocks.renderConversationFeedbackText.mockReturnValue("1 2 3 4 5");
    mocks.renderConversationFeedbackScale.mockReturnValue("<div>Scale</div>");
    mocks.renderNewMessageNotificationEmail.mockReturnValue({
      subject: "New visitor message",
      bodyText: "Preview text",
      bodyHtml: renderedShellHtml
    });
    mocks.sendSesEmail.mockResolvedValue(undefined);
  });

  it("sends team reply emails with feedback links and a reply alias", async () => {
    await sendTeamReplyEmail({
      conversationId: "conv_1",
      to: "alex@example.com",
      content: "Line 1\nLine 2",
      attachments: [{ fileName: "pricing.pdf", contentType: "application/pdf", content: Buffer.from("x") }]
    });

    expect(mocks.sendSesEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Chatting <hello@usechatting.com>",
        to: "alex@example.com",
        replyTo: "reply+conv_1@reply.chatting.test",
        subject: "Reply from Chatting",
        bodyText: expect.stringContaining("Reply to this email to continue the conversation."),
        bodyHtml: expect.stringContaining("Attached: pricing.pdf")
      })
    );
  });

  it("sends team new-message emails with inbox-only reply actions", async () => {
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
      replyNowUrl: "https://app.example/dashboard?id=conv_1",
      inboxUrl: "https://app.example/dashboard?id=conv_1",
      workspaceName: "Main site",
      attachmentsCount: 2,
      replyByEmailEnabled: false
    });
    const sentEmail = mocks.sendSesEmail.mock.calls[0]?.[0];
    expect(sentEmail).toEqual(
      expect.objectContaining({
        from: "Chatting <noreply@notifications.usechatting.com>",
        to: "team@example.com",
        subject: "New visitor message",
        bodyHtml: expect.stringContaining("Unsubscribe")
      })
    );
    expect(sentEmail?.replyTo).toBeUndefined();
    expect(sentEmail?.bodyText).toContain("Preview text");
    expect(sentEmail?.bodyText).toContain("This email was sent by Main site using Chatting.");
    expect(sentEmail?.bodyText).toContain("Unsubscribe: https://app.example/email/unsubscribe?token=team@example.com");
  });

  it("passes rendered settings template emails through the shared rich-email path", async () => {
    await sendRenderedEmail({
      to: "team@example.com",
      rendered: {
        subject: "Chatting email probe",
        bodyText: "Probe email from local workspace.",
        bodyHtml: renderedShellHtml
      }
    });

    const sentEmail = mocks.sendSesEmail.mock.calls[0]?.[0];
    expect(sentEmail).toEqual(
      expect.objectContaining({
        from: "Chatting <hello@usechatting.com>",
        to: "team@example.com",
        subject: "Chatting email probe",
        bodyHtml: expect.stringContaining("Privacy Policy")
      })
    );
    expect(sentEmail?.bodyText).toContain("Probe email from local workspace.");
    expect(sentEmail?.bodyText).toContain("This email was sent by Chatting using Chatting.");
  });

  it("rejects raw html that skips the shared email shell", async () => {
    await expect(
      sendRenderedEmail({
        to: "team@example.com",
        rendered: {
          subject: "Template preview",
          bodyText: "Plain body",
          bodyHtml: "<p>HTML body</p>"
        }
      })
    ).rejects.toThrow("sendRichEmail requires fully rendered Chatting email HTML.");

    expect(mocks.sendSesEmail).not.toHaveBeenCalled();
  });

  it("injects the standard legal footer into already-rendered email shells", async () => {
    await sendRichEmail({
      to: "team@example.com",
      subject: "Template preview",
      bodyText: "Plain body",
      bodyHtml: renderedShellHtml
    });

    expect(mocks.sendSesEmail.mock.calls[0]?.[0].bodyHtml).toContain("This email was sent by Chatting using ");
    expect(mocks.sendSesEmail.mock.calls[0]?.[0].bodyHtml).toContain(
      'utm_source=email_footer&utm_medium=email&utm_campaign=legal_footer'
    );
    expect(mocks.sendSesEmail.mock.calls[0]?.[0].bodyHtml).toContain('target="_blank" rel="noopener noreferrer"');
    expect(mocks.sendSesEmail.mock.calls[0]?.[0].bodyHtml).toContain("Privacy Policy");
    expect(mocks.sendSesEmail.mock.calls[0]?.[0].bodyHtml).toContain("Regulus Framework Limited");
    expect(mocks.sendSesEmail.mock.calls[0]?.[0].bodyText).toContain("Company No. 16998528");
  });

  it("skips optional emails for unsubscribed recipients", async () => {
    mocks.isEmailRecipientUnsubscribed.mockResolvedValueOnce(true);

    await sendRichEmail({
      to: "team@example.com",
      subject: "Optional update",
      bodyText: "Plain body",
      bodyHtml: renderedShellHtml,
      emailCategory: "optional"
    });

    expect(mocks.sendSesEmail).not.toHaveBeenCalled();
  });
});
