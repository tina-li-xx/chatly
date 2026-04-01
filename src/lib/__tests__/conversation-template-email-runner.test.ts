const mocks = vi.hoisted(() => ({
  claimRetryableTemplateDeliveries: vi.fn(),
  listStoredMessageAttachments: vi.fn(),
  retryQueuedConversationTemplateEmail: vi.fn()
}));

vi.mock("@/lib/repositories/conversation-template-email-repository", () => ({
  claimRetryableTemplateDeliveries: mocks.claimRetryableTemplateDeliveries,
  listStoredMessageAttachments: mocks.listStoredMessageAttachments
}));

vi.mock("@/lib/conversation-template-emails", () => ({
  retryQueuedConversationTemplateEmail: mocks.retryQueuedConversationTemplateEmail
}));

import { runScheduledConversationTemplateEmailRetries } from "@/lib/conversation-template-email-runner";

describe("conversation template email runner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.claimRetryableTemplateDeliveries.mockResolvedValue([]);
    mocks.listStoredMessageAttachments.mockResolvedValue([]);
  });

  it("retries queued deliveries with stored offline reply attachments", async () => {
    const attachment = { file_name: "quote.pdf", content_type: "application/pdf", content: Buffer.from("hi") };

    mocks.claimRetryableTemplateDeliveries.mockResolvedValueOnce([
      {
        conversationId: "conv_1",
        userId: "user_1",
        templateKey: "offline_reply",
        deliveryKey: "offline_reply:msg_1",
        attemptCount: 1
      },
      {
        conversationId: "conv_2",
        userId: "user_2",
        templateKey: "welcome_email",
        deliveryKey: "welcome_email:conv_2",
        attemptCount: 0
      }
    ]);
    mocks.listStoredMessageAttachments.mockResolvedValueOnce([attachment]);
    mocks.retryQueuedConversationTemplateEmail
      .mockResolvedValueOnce("sent")
      .mockResolvedValueOnce("queued_retry");

    await expect(
      runScheduledConversationTemplateEmailRetries(new Date("2026-03-31T21:00:00.000Z"))
    ).resolves.toEqual({
      processedDeliveries: 2,
      sentDeliveries: 1,
      queuedDeliveries: 1,
      skippedDeliveries: 0,
      erroredDeliveries: 0
    });

    expect(mocks.listStoredMessageAttachments).toHaveBeenCalledWith("msg_1");
    expect(mocks.retryQueuedConversationTemplateEmail).toHaveBeenNthCalledWith(1, {
      conversationId: "conv_1",
      userId: "user_1",
      templateKey: "offline_reply",
      deliveryKey: "offline_reply:msg_1",
      attemptCount: 1,
      attachments: [{ fileName: "quote.pdf", contentType: "application/pdf", content: Buffer.from("hi") }]
    });
    expect(mocks.retryQueuedConversationTemplateEmail).toHaveBeenNthCalledWith(2, {
      conversationId: "conv_2",
      userId: "user_2",
      templateKey: "welcome_email",
      deliveryKey: "welcome_email:conv_2",
      attemptCount: 0,
      attachments: []
    });
  });

  it("keeps processing when a queued delivery throws", async () => {
    mocks.claimRetryableTemplateDeliveries.mockResolvedValueOnce([
      {
        conversationId: "conv_1",
        userId: "user_1",
        templateKey: "offline_reply",
        deliveryKey: "offline_reply:msg_1",
        attemptCount: 2
      }
    ]);
    mocks.retryQueuedConversationTemplateEmail.mockRejectedValueOnce(new Error("boom"));

    await expect(
      runScheduledConversationTemplateEmailRetries(new Date("2026-03-31T21:05:00.000Z"))
    ).resolves.toEqual({
      processedDeliveries: 1,
      sentDeliveries: 0,
      queuedDeliveries: 0,
      skippedDeliveries: 0,
      erroredDeliveries: 1
    });
  });
});
