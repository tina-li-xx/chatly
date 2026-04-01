const mocks = vi.hoisted(() => ({
  getDashboardEmailTemplateSettings: vi.fn(),
  sendRichEmail: vi.fn(),
  claimTemplateDelivery: vi.fn(),
  findConversationTemplateContext: vi.fn(),
  listConversationTranscriptRows: vi.fn(),
  markTemplateDeliveryFailed: vi.fn(),
  markTemplateDeliverySent: vi.fn()
}));

vi.mock("@/lib/data/settings", () => ({
  getDashboardEmailTemplateSettings: mocks.getDashboardEmailTemplateSettings
}));

vi.mock("@/lib/email", () => ({
  sendRichEmail: mocks.sendRichEmail
}));

vi.mock("@/lib/repositories/conversation-template-email-repository", () => ({
  claimTemplateDelivery: mocks.claimTemplateDelivery,
  findConversationTemplateContext: mocks.findConversationTemplateContext,
  listConversationTranscriptRows: mocks.listConversationTranscriptRows,
  markTemplateDeliveryFailed: mocks.markTemplateDeliveryFailed,
  markTemplateDeliverySent: mocks.markTemplateDeliverySent
}));

import { sendResolvedConversationTemplateEmails } from "@/lib/conversation-template-emails";
import { getDefaultDashboardEmailTemplates } from "@/lib/email-templates";

describe("conversation template emails", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const originalReplyDomain = process.env.REPLY_DOMAIN;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "https://chatly.example";
    process.env.REPLY_DOMAIN = "reply.chatly.example";

    mocks.getDashboardEmailTemplateSettings.mockResolvedValue({
      profile: {
        firstName: "Sarah",
        lastName: "Chen",
        email: "sarah@acme.example",
        jobTitle: "",
        avatarDataUrl: null
      },
      email: {
        notificationEmail: "team@acme.example",
        replyToEmail: "support@acme.example",
        templates: getDefaultDashboardEmailTemplates(),
        emailSignature: "Best,\nAcme Support"
      }
    });

    mocks.claimTemplateDelivery.mockResolvedValue(true);
    mocks.sendRichEmail.mockResolvedValue(undefined);
    mocks.markTemplateDeliverySent.mockResolvedValue(undefined);
    mocks.markTemplateDeliveryFailed.mockResolvedValue(undefined);
    mocks.listConversationTranscriptRows.mockResolvedValue([
      {
        id: "msg_1",
        sender: "user",
        content: "Hi there",
        created_at: "2026-03-28T10:00:00.000Z"
      },
      {
        id: "msg_2",
        sender: "founder",
        content: "Happy to help",
        created_at: "2026-03-28T10:01:00.000Z"
      }
    ]);
  });

  afterEach(() => {
    if (originalAppUrl === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    }

    if (originalReplyDomain === undefined) {
      delete process.env.REPLY_DOMAIN;
    } else {
      process.env.REPLY_DOMAIN = originalReplyDomain;
    }
  });

  it("adds the Chatting transcript footer for starter accounts", async () => {
    mocks.findConversationTemplateContext.mockResolvedValue({
      conversation_id: "conv_1",
      site_id: "site_1",
      session_id: "session_1",
      user_id: "user_1",
      site_name: "Acme Support",
      email: "alex@example.com",
      plan_key: "starter"
    });

    await sendResolvedConversationTemplateEmails({
      conversationId: "conv_1",
      userId: "user_1"
    });

    const transcriptEmail = mocks.sendRichEmail.mock.calls.find(
      ([input]) => input.subject === "Your conversation with Acme Support"
    )?.[0];

    expect(mocks.sendRichEmail).toHaveBeenCalledTimes(3);
    expect(transcriptEmail).toMatchObject({
      from: "Acme Support via Chatting <noreply@mail.usechatting.com>",
      to: "alex@example.com",
      replyTo: "reply+conv_1@reply.chatly.example",
      subject: "Your conversation with Acme Support"
    });
    expect(transcriptEmail.bodyText).toContain("Thanks for chatting with us!");
    expect(transcriptEmail.bodyText).toContain("March 28, 2026 • 2 messages");
    expect(transcriptEmail.bodyText).toContain("Reply to This Email: mailto:reply+conv_1@reply.chatly.example");
    expect(transcriptEmail.bodyText).toContain("Continue on the web: https://chatly.example/conversation/");
    expect(transcriptEmail.bodyText).toContain("Try Chatting Free →");
    expect(transcriptEmail.bodyText).toContain("utm_content=variant_a&ref=acme-support");
    expect(transcriptEmail.bodyText).toContain("This email was sent by Acme Support using Chatting.");
    expect(transcriptEmail.bodyHtml).toContain("Your conversation with Acme Support");
    expect(transcriptEmail.bodyHtml).toContain("background:#F8FAFC");
    expect(transcriptEmail.bodyHtml).toContain(">Try Chatting Free →<");
    expect(transcriptEmail.bodyHtml).toContain("https://chatly.example/privacy");
  });

  it("keeps growth transcript emails free of Chatting branding", async () => {
    mocks.findConversationTemplateContext.mockResolvedValue({
      conversation_id: "conv_1",
      site_id: "site_1",
      session_id: "session_1",
      user_id: "user_1",
      site_name: "Acme Support",
      email: "alex@example.com",
      plan_key: "growth"
    });

    await sendResolvedConversationTemplateEmails({
      conversationId: "conv_1",
      userId: "user_1"
    });

    const transcriptEmail = mocks.sendRichEmail.mock.calls.find(
      ([input]) => input.subject === "Your conversation with Acme Support"
    )?.[0];

    expect(transcriptEmail.bodyText).toContain("Reply to This Email: mailto:reply+conv_1@reply.chatly.example");
    expect(transcriptEmail.bodyText).not.toContain("Chat with us on Chatting");
    expect(transcriptEmail.bodyText).not.toContain("This email was sent by Acme Support using Chatting.");
    expect(transcriptEmail.bodyHtml).not.toContain("utm_campaign=viral_footer");
    expect(transcriptEmail.bodyHtml).not.toContain("Privacy Policy");
  });
});
