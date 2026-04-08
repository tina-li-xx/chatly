const mocks = vi.hoisted(() => ({
  listWorkspaceMentionNotificationRows: vi.fn()
}));

vi.mock("@/lib/chatting-notification-email-senders", () => ({
  sendMentionNotificationEmail: vi.fn()
}));
vi.mock("@/lib/data/conversations", () => ({
  getConversationSummaryById: vi.fn()
}));
vi.mock("@/lib/env", () => ({
  getPublicAppUrl: vi.fn(() => "https://usechatting.com")
}));
vi.mock("@/lib/repositories/mention-notification-repository", () => ({
  listWorkspaceMentionNotificationRows: mocks.listWorkspaceMentionNotificationRows
}));

import { buildMentionableTeammates, resolveMentionResolution } from "@/lib/mention-identities";
import { listMentionableTeammates } from "@/lib/mention-notifications";

function mentionRows() {
  return [
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
      email: "tina.bauer+east@example.com",
      notification_email: null,
      first_name: "Tina",
      last_name: "Bauer",
      email_notifications: true,
      mention_notifications: true
    },
    {
      user_id: "user_alex",
      email: "alex@example.com",
      notification_email: null,
      first_name: "Alex",
      last_name: "Stone",
      email_notifications: true,
      mention_notifications: false
    }
  ];
}

describe("mention notifications more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds canonical handles for mention autocomplete with deterministic collisions", () => {
    expect(buildMentionableTeammates(mentionRows(), "user_sender")).toEqual([
      { userId: "user_tina", displayName: "Tina Bauer", handle: "tina-bauer" },
      { userId: "user_tina_2", displayName: "Tina Bauer", handle: "tina-bauer-2" }
    ]);
  });

  it("reports ambiguous, unresolved, and disabled handles alongside resolved mentions", () => {
    expect(
      resolveMentionResolution("@tina @tina-bauer @alex @nobody", mentionRows(), "user_sender")
    ).toMatchObject({
      sent: ["tina-bauer"],
      ambiguous: ["tina"],
      unresolved: ["nobody"],
      disabled: ["alex"]
    });
  });

  it("loads mentionable teammates through the repository helper", async () => {
    mocks.listWorkspaceMentionNotificationRows.mockResolvedValue(mentionRows());

    await expect(
      listMentionableTeammates({
        workspaceOwnerId: "owner_1",
        mentionerUserId: "user_sender"
      })
    ).resolves.toEqual([
      { userId: "user_tina", displayName: "Tina Bauer", handle: "tina-bauer" },
      { userId: "user_tina_2", displayName: "Tina Bauer", handle: "tina-bauer-2" }
    ]);
  });
});
