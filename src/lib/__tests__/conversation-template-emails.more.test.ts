const mocks = vi.hoisted(() => ({
  claimTemplateDelivery: vi.fn(),
  findConversationTemplateContext: vi.fn(),
  getDashboardEmailTemplateSettings: vi.fn(),
  listConversationTranscriptRows: vi.fn(),
  markTemplateDeliveryFailed: vi.fn(),
  markTemplateDeliverySent: vi.fn(),
  sendRichEmail: vi.fn()
}));

vi.mock("@/lib/data/settings", () => ({ getDashboardEmailTemplateSettings: mocks.getDashboardEmailTemplateSettings }));
vi.mock("@/lib/email", () => ({ sendRichEmail: mocks.sendRichEmail }));
vi.mock("@/lib/repositories/conversation-template-email-repository", () => ({
  claimTemplateDelivery: mocks.claimTemplateDelivery,
  findConversationTemplateContext: mocks.findConversationTemplateContext,
  listConversationTranscriptRows: mocks.listConversationTranscriptRows,
  markTemplateDeliveryFailed: mocks.markTemplateDeliveryFailed,
  markTemplateDeliverySent: mocks.markTemplateDeliverySent
}));

import {
  sendOfflineReplyTemplateEmail,
  sendWelcomeTemplateEmail
} from "@/lib/conversation-template-emails";
import { getDefaultDashboardEmailTemplates } from "@/lib/email-templates";

describe("conversation template emails more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "https://chatly.example";
    delete process.env.REPLY_DOMAIN;
    mocks.getDashboardEmailTemplateSettings.mockResolvedValue({
      profile: { firstName: "Sarah", lastName: "Chen", email: "sarah@acme.example", avatarDataUrl: null },
      email: {
        notificationEmail: "team@acme.example",
        replyToEmail: "support@acme.example",
        templates: getDefaultDashboardEmailTemplates(),
        emailSignature: "Best,\nAcme Support"
      }
    });
    mocks.findConversationTemplateContext.mockResolvedValue({
      conversation_id: "conv_1",
      site_id: "site_1",
      session_id: "session_1",
      user_id: "user_1",
      site_name: "Acme Support",
      email: "alex@example.com",
      plan_key: "starter"
    });
    mocks.claimTemplateDelivery.mockResolvedValue(true);
    mocks.sendRichEmail.mockResolvedValue(undefined);
    mocks.listConversationTranscriptRows.mockResolvedValue([]);
    mocks.markTemplateDeliveryFailed.mockResolvedValue(undefined);
  });

  it("skips sends when the conversation is missing, the visitor email is missing, or the template is disabled", async () => {
    mocks.findConversationTemplateContext.mockResolvedValueOnce(null);
    await expect(sendWelcomeTemplateEmail({ conversationId: "conv_1", userId: "user_1" })).resolves.toBe("skipped");

    mocks.findConversationTemplateContext.mockResolvedValueOnce({ conversation_id: "conv_1", site_id: "site_1", session_id: "session_1", user_id: "user_1", site_name: "Acme", email: null, plan_key: "starter" });
    await expect(sendWelcomeTemplateEmail({ conversationId: "conv_1", userId: "user_1" })).resolves.toBe("skipped");

    mocks.getDashboardEmailTemplateSettings.mockResolvedValueOnce({
      profile: { firstName: "Sarah", lastName: "Chen", email: "sarah@acme.example", avatarDataUrl: null },
      email: { notificationEmail: "team@acme.example", replyToEmail: "support@acme.example", templates: getDefaultDashboardEmailTemplates().map((template) => template.key === "welcome_email" ? { ...template, enabled: false } : template), emailSignature: "" }
    });
    await expect(sendWelcomeTemplateEmail({ conversationId: "conv_1", userId: "user_1" })).resolves.toBe("skipped");
  });

  it("returns duplicate when claim delivery refuses the send", async () => {
    mocks.claimTemplateDelivery.mockResolvedValueOnce(false);
    await expect(
      sendOfflineReplyTemplateEmail({ conversationId: "conv_1", userId: "user_1", messageId: "msg_1" })
    ).resolves.toBe("duplicate");
    expect(mocks.sendRichEmail).not.toHaveBeenCalled();
  });

  it("falls back to the support reply address and app url when reply aliases or site domains are missing", async () => {
    await expect(
      sendOfflineReplyTemplateEmail({ conversationId: "conv_1", userId: "user_1", messageId: "msg_1" })
    ).resolves.toBe("sent");

    expect(mocks.sendRichEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Acme Support via Chatting <noreply@mail.usechatting.com>",
        replyTo: "support@acme.example",
        to: "alex@example.com"
      })
    );
    expect(mocks.markTemplateDeliverySent).toHaveBeenCalledWith("offline_reply:msg_1");
  });

  it("sends welcome emails from the primary brand hello address", async () => {
    await expect(sendWelcomeTemplateEmail({ conversationId: "conv_1", userId: "user_1" })).resolves.toBe("sent");

    expect(mocks.sendRichEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Chatting <hello@usechatting.com>",
        to: "alex@example.com"
      })
    );
  });

  it("queues retries when the outbound email send fails", async () => {
    mocks.sendRichEmail.mockRejectedValueOnce(new Error("mail down"));

    await expect(
      sendOfflineReplyTemplateEmail({ conversationId: "conv_1", userId: "user_1", messageId: "msg_1" })
    ).resolves.toBe("queued_retry");
    expect(mocks.markTemplateDeliveryFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        deliveryKey: "offline_reply:msg_1",
        errorMessage: "mail down"
      })
    );
  });
});
