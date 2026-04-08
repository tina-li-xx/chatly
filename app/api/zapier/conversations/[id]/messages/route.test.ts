const mocks = vi.hoisted(() => ({
  deliverConversationTeamReply: vi.fn(),
  requireZapierApiAuth: vi.fn()
}));

vi.mock("@/lib/conversation-team-reply-delivery", () => ({
  deliverConversationTeamReply: mocks.deliverConversationTeamReply
}));
vi.mock("@/lib/zapier-api-auth", () => ({
  requireZapierApiAuth: mocks.requireZapierApiAuth
}));

import { POST } from "./route";

describe("zapier conversation messages route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireZapierApiAuth.mockResolvedValue({
      auth: { ownerUserId: "owner_1" }
    });
  });

  it("sends a message into the conversation", async () => {
    mocks.deliverConversationTeamReply.mockResolvedValueOnce({
      message: {
        id: "msg_1",
        sender: "team",
        createdAt: "2026-04-07T12:00:00.000Z"
      }
    });

    const response = await POST(
      new Request("https://chatting.test/api/zapier/conversations/conv_1/messages", {
        method: "POST",
        body: JSON.stringify({ message: "Thanks", sender: "system" })
      }),
      { params: Promise.resolve({ id: "conv_1" }) }
    );

    expect(mocks.deliverConversationTeamReply).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: "conv_1",
        actorUserId: "owner_1",
        content: "Thanks"
      })
    );
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      ok: true,
      id: "msg_1",
      conversation_id: "conv_1",
      sender: "system",
      created_at: "2026-04-07T12:00:00.000Z"
    });
  });
});
