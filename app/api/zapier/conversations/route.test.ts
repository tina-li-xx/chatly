const mocks = vi.hoisted(() => ({
  listZapierConversations: vi.fn(),
  requireZapierApiAuth: vi.fn()
}));

vi.mock("@/lib/zapier-api-auth", () => ({
  requireZapierApiAuth: mocks.requireZapierApiAuth
}));
vi.mock("@/lib/zapier-api-resources", () => ({
  listZapierConversations: mocks.listZapierConversations
}));

import { GET } from "./route";

describe("zapier conversations route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireZapierApiAuth.mockResolvedValue({
      auth: { ownerUserId: "owner_1", ownerEmail: "owner@example.com" }
    });
  });

  it("lists recent conversations for Zapier samples", async () => {
    mocks.listZapierConversations.mockResolvedValueOnce([
      {
        id: "conv_1",
        visitor_email: "visitor@example.com",
        page_url: "/pricing",
        created_at: "2026-04-08T00:00:00.000Z",
        last_message_preview: "Do you offer annual billing?",
        tags: []
      }
    ]);

    const response = await GET(
      new Request("https://chatting.test/api/zapier/conversations?limit=1")
    );

    expect(mocks.listZapierConversations).toHaveBeenCalledWith("owner_1", 1);
    expect(await response.json()).toEqual([
      {
        event: "conversation.created",
        timestamp: "2026-04-08T00:00:00.000Z",
        data__conversation_id: "conv_1",
        data__visitor_email: "visitor@example.com",
        data__visitor_name: null,
        data__page_url: "/pricing",
        data__first_message: "Do you offer annual billing?",
        data__assigned_to: null,
        data: {
          conversation_id: "conv_1",
          visitor_email: "visitor@example.com",
          visitor_name: null,
          page_url: "/pricing",
          first_message: "Do you offer annual billing?",
          tags: [],
          assigned_to: null
        }
      }
    ]);
  });

  it("lists resolved conversation samples when requested", async () => {
    mocks.listZapierConversations.mockResolvedValueOnce([
      {
        id: "conv_2",
        visitor_email: "resolved@example.com",
        status: "resolved",
        page_url: "/support",
        created_at: "2026-04-08T00:00:00.000Z",
        updated_at: "2026-04-08T00:07:00.000Z",
        last_message_preview: "Thanks, all sorted.",
        tags: []
      }
    ]);

    const response = await GET(
      new Request(
        "https://chatting.test/api/zapier/conversations?limit=1&event=conversation.resolved"
      )
    );

    expect(await response.json()).toEqual([
      {
        event: "conversation.resolved",
        timestamp: "2026-04-08T00:07:00.000Z",
        data__conversation_id: "conv_2",
        data__visitor_email: "resolved@example.com",
        data__resolved_by: "owner@example.com",
        data__message_count: 1,
        data__duration_seconds: 420,
        data: {
          conversation_id: "conv_2",
          visitor_email: "resolved@example.com",
          resolved_by: "owner@example.com",
          message_count: 1,
          duration_seconds: 420
        }
      }
    ]);
  });

  it("lists tag added samples when requested", async () => {
    mocks.listZapierConversations.mockResolvedValueOnce([
      {
        id: "conv_ignored",
        visitor_email: "ignored@example.com",
        status: "open",
        page_url: "/ignored",
        created_at: "2026-04-08T00:00:00.000Z",
        updated_at: "2026-04-08T00:01:00.000Z",
        last_message_preview: "No tag here.",
        tags: []
      },
      {
        id: "conv_3",
        visitor_email: "tagged@example.com",
        status: "open",
        page_url: "/pricing",
        created_at: "2026-04-08T00:00:00.000Z",
        updated_at: "2026-04-08T00:09:00.000Z",
        last_message_preview: "Please send details.",
        tags: ["vip"]
      }
    ]);

    const response = await GET(
      new Request(
        "https://chatting.test/api/zapier/conversations?limit=1&event=tag.added"
      )
    );

    expect(mocks.listZapierConversations).toHaveBeenCalledWith("owner_1", 25);
    expect(await response.json()).toEqual([
      {
        event: "tag.added",
        timestamp: "2026-04-08T00:09:00.000Z",
        data__conversation_id: "conv_3",
        data__tag: "vip",
        data__added_by: "owner@example.com",
        data: {
          conversation_id: "conv_3",
          tag: "vip",
          added_by: "owner@example.com"
        }
      }
    ]);
  });
});
