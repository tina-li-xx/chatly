const mocks = vi.hoisted(() => ({
  getConversationSummaryById: vi.fn(),
  getPublicAppUrl: vi.fn(),
  listWorkspaceMentionNotificationRows: vi.fn(),
  sendMentionNotificationEmail: vi.fn()
}));

vi.mock("@/lib/chatly-notification-email-senders", () => ({
  sendMentionNotificationEmail: mocks.sendMentionNotificationEmail
}));
vi.mock("@/lib/data/conversations", () => ({
  getConversationSummaryById: mocks.getConversationSummaryById
}));
vi.mock("@/lib/env", () => ({
  getPublicAppUrl: mocks.getPublicAppUrl
}));
vi.mock("@/lib/repositories/mention-notification-repository", () => ({
  listWorkspaceMentionNotificationRows: mocks.listWorkspaceMentionNotificationRows
}));

import {
  extractMentionHandles,
  resolveMentionRecipients,
  sendConversationMentionNotifications
} from "@/lib/mention-notifications";

describe("mention notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T15:45:00.000Z"));
    mocks.getPublicAppUrl.mockReturnValue("https://usechatting.com");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("extracts distinct mention handles from note text", () => {
    expect(extractMentionHandles("Please ask @Tina and @alex.smith about this, not foo@example.com")).toEqual([
      "tina",
      "alex.smith"
    ]);
  });

  it("resolves a single unambiguous teammate and skips disabled or ambiguous matches", () => {
    const rows = [
      {
        user_id: "user_sender",
        email: "sarah@example.com",
        notification_email: null,
        first_name: "Sarah",
        last_name: "Chen",
        email_notifications: true,
        mention_notifications: true
      },
      {
        user_id: "user_tina",
        email: "tina.bauer@example.com",
        notification_email: "tina@usechatting.com",
        first_name: "Tina",
        last_name: "Bauer",
        email_notifications: true,
        mention_notifications: true
      },
      {
        user_id: "user_tina_2",
        email: "tina.jones@example.com",
        notification_email: null,
        first_name: "Tina",
        last_name: "Jones",
        email_notifications: true,
        mention_notifications: true
      },
      {
        user_id: "user_alex",
        email: "alex@example.com",
        notification_email: null,
        first_name: "Alex",
        last_name: "Stone",
        email_notifications: false,
        mention_notifications: true
      }
    ];

    expect(resolveMentionRecipients("@tina please help", rows, "user_sender")).toHaveLength(0);
    expect(resolveMentionRecipients("@tina.bauer please help", rows, "user_sender")).toMatchObject([
      { user_id: "user_tina", notificationAddress: "tina@usechatting.com" }
    ]);
    expect(resolveMentionRecipients("@alex please help", rows, "user_sender")).toHaveLength(0);
  });

  it("sends mention emails to resolved teammates with the inbox deeplink", async () => {
    mocks.listWorkspaceMentionNotificationRows.mockResolvedValue([
      {
        user_id: "user_sender",
        email: "sarah@example.com",
        notification_email: null,
        first_name: "Sarah",
        last_name: "Chen",
        email_notifications: true,
        mention_notifications: true
      },
      {
        user_id: "user_tina",
        email: "tina.bauer@example.com",
        notification_email: "tina@usechatting.com",
        first_name: "Tina",
        last_name: "Bauer",
        email_notifications: true,
        mention_notifications: true
      }
    ]);
    mocks.getConversationSummaryById.mockResolvedValue({
      email: "alex@example.com",
      pageUrl: "https://usechatting.com/pricing"
    });

    await expect(
      sendConversationMentionNotifications({
        conversationId: "conv_1",
        note: "@Tina can you confirm whether this customer qualifies for annual billing?",
        updatedAt: "2026-03-30T15:42:00.000Z",
        mentionerUserId: "user_sender",
        mentionerEmail: "sarah@example.com",
        workspaceOwnerId: "owner_1"
      })
    ).resolves.toBe(1);

    expect(mocks.sendMentionNotificationEmail).toHaveBeenCalledWith({
      to: "tina@usechatting.com",
      mentionerName: "Sarah Chen",
      visitorName: "Alex",
      note: "@Tina can you confirm whether this customer qualifies for annual billing?",
      noteMeta: "Pricing conversation • 3 minutes ago",
      conversationUrl:
        "https://usechatting.com/dashboard/inbox?id=conv_1&focus=note&note=%40Tina+can+you+confirm+whether+this+customer+qualifies+for+annual+billing%3F&mention=tina"
    });
  });
});
